/**
 * Coupon Validation API - Apply and validate discount codes
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit } from '@/lib/rate-limit'
import { validateBody, couponValidateSchema } from '@/lib/validations'

// POST /api/coupons/validate - Validate and apply coupon
export const POST = withRateLimit(
  async (request: NextRequest) => {
    const validation = await validateBody(request, couponValidateSchema)
    
    if (!validation.success) {
      return validation.error
    }

    const { code, subtotal } = validation.data

    try {
      // Find the coupon
      const coupon = await db.coupon.findUnique({
        where: { code: code.toUpperCase() },
      })

      if (!coupon) {
        return NextResponse.json(
          { error: 'كود الخصم غير صالح', code: 'INVALID_COUPON', valid: false },
          { status: 400 }
        )
      }

      // Check if coupon is active
      if (!coupon.active) {
        return NextResponse.json(
          { error: 'كود الخصم غير نشط', code: 'INACTIVE_COUPON', valid: false },
          { status: 400 }
        )
      }

      // Check dates
      const now = new Date()
      if (coupon.startsAt && now < coupon.startsAt) {
        return NextResponse.json(
          { error: 'كود الخصم لم يبدأ بعد', code: 'NOT_STARTED', valid: false },
          { status: 400 }
        )
      }

      if (coupon.expiresAt && now > coupon.expiresAt) {
        return NextResponse.json(
          { error: 'كود الخصم منتهي الصلاحية', code: 'EXPIRED', valid: false },
          { status: 400 }
        )
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: 'كود الخصم استنفد عدد مرات الاستخدام', code: 'USAGE_LIMIT', valid: false },
          { status: 400 }
        )
      }

      // Check minimum order
      if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
        return NextResponse.json(
          { 
            error: `الحد الأدنى للطلب ${coupon.minOrder} ريال`, 
            code: 'MIN_ORDER_NOT_MET',
            valid: false,
            minOrder: coupon.minOrder 
          },
          { status: 400 }
        )
      }

      // Calculate discount
      let discount = 0
      
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discount) / 100
        
        // Apply max discount limit
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount
        }
      } else {
        // Fixed discount
        discount = coupon.discount
        
        // Discount can't exceed subtotal
        if (discount > subtotal) {
          discount = subtotal
        }
      }

      // Round to 2 decimal places
      discount = Math.round(discount * 100) / 100

      return NextResponse.json({
        valid: true,
        coupon: {
          code: coupon.code,
          discount: discount,
          discountType: coupon.discountType,
          discountValue: coupon.discount,
          maxDiscount: coupon.maxDiscount,
          minOrder: coupon.minOrder,
        },
        originalTotal: subtotal,
        discountedTotal: Math.round((subtotal - discount) * 100) / 100,
        savings: discount,
      })
    } catch (error) {
      console.error('Failed to validate coupon:', error)
      return NextResponse.json(
        { error: 'فشل في التحقق من كود الخصم', code: 'VALIDATION_FAILED' },
        { status: 500 }
      )
    }
  },
  'checkout'
)
