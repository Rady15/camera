/**
 * Coupons API - Discount Code Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs, getUserFromHeaders } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'
import { validateBody, couponCreateSchema, couponValidateSchema } from '@/lib/validations'

// GET /api/coupons - Get all coupons
export const GET = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search')
        const active = searchParams.get('active')

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (search) {
          where.OR = [
            { code: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }

        if (active === 'true') {
          where.active = true
        } else if (active === 'false') {
          where.active = false
        }

        const [coupons, total] = await Promise.all([
          db.coupon.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          db.coupon.count({ where }),
        ])

        return NextResponse.json({
          coupons,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      } catch (error) {
        console.error('Failed to fetch coupons:', error)
        return NextResponse.json(
          { error: 'Failed to fetch coupons' },
          { status: 500 }
        )
      }
    },
    routeConfigs.staffOnly
  ),
  'admin'
)

// POST /api/coupons - Create coupon (Admin only)
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)

      const validation = await validateBody(request, couponCreateSchema)
      if (!validation.success) {
        return validation.error
      }

      const data = validation.data

      try {
        // Check if coupon code already exists
        const existingCoupon = await db.coupon.findUnique({
          where: { code: data.code.toUpperCase() },
        })

        if (existingCoupon) {
          return NextResponse.json(
            { error: 'Coupon code already exists', code: 'DUPLICATE_CODE' },
            { status: 400 }
          )
        }

        // Validate discount based on type
        if (data.discountType === 'percentage' && data.discount > 100) {
          return NextResponse.json(
            { error: 'Percentage discount cannot exceed 100%', code: 'INVALID_DISCOUNT' },
            { status: 400 }
          )
        }

        const coupon = await db.coupon.create({
          data: {
            code: data.code.toUpperCase(),
            description: data.description,
            discount: data.discount,
            discountType: data.discountType,
            minOrder: data.minOrder || 0,
            maxDiscount: data.maxDiscount,
            usageLimit: data.usageLimit,
            perUserLimit: data.perUserLimit,
            firstPurchaseOnly: data.firstPurchaseOnly || false,
            active: data.active ?? true,
            startsAt: data.startsAt ? new Date(data.startsAt) : null,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          },
        })

        // Log the action
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'create_coupon',
            entityType: 'coupon',
            entityId: coupon.id,
            newValue: JSON.stringify(coupon),
          },
        })

        return NextResponse.json({ coupon }, { status: 201 })
      } catch (error) {
        console.error('Failed to create coupon:', error)
        return NextResponse.json(
          { error: 'Failed to create coupon' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)

// PATCH /api/coupons - Update coupon (Admin only)
export const PATCH = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const body = await request.json()
      const { couponId, ...updateData } = body

      if (!couponId) {
        return NextResponse.json(
          { error: 'Coupon ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        const existingCoupon = await db.coupon.findUnique({
          where: { id: couponId },
        })

        if (!existingCoupon) {
          return NextResponse.json(
            { error: 'Coupon not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        // Prepare update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}

        if (updateData.description !== undefined) data.description = updateData.description
        if (updateData.discount !== undefined) data.discount = updateData.discount
        if (updateData.discountType !== undefined) data.discountType = updateData.discountType
        if (updateData.minOrder !== undefined) data.minOrder = updateData.minOrder
        if (updateData.maxDiscount !== undefined) data.maxDiscount = updateData.maxDiscount
        if (updateData.usageLimit !== undefined) data.usageLimit = updateData.usageLimit
        if (updateData.perUserLimit !== undefined) data.perUserLimit = updateData.perUserLimit
        if (updateData.firstPurchaseOnly !== undefined) data.firstPurchaseOnly = updateData.firstPurchaseOnly
        if (updateData.active !== undefined) data.active = updateData.active
        if (updateData.startsAt !== undefined) data.startsAt = updateData.startsAt ? new Date(updateData.startsAt) : null
        if (updateData.expiresAt !== undefined) data.expiresAt = updateData.expiresAt ? new Date(updateData.expiresAt) : null

        const coupon = await db.coupon.update({
          where: { id: couponId },
          data,
        })

        // Log the action
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'update_coupon',
            entityType: 'coupon',
            entityId: couponId,
            oldValue: JSON.stringify(existingCoupon),
            newValue: JSON.stringify(coupon),
          },
        })

        return NextResponse.json({ coupon })
      } catch (error) {
        console.error('Failed to update coupon:', error)
        return NextResponse.json(
          { error: 'Failed to update coupon' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)

// DELETE /api/coupons - Delete coupon (Admin only)
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const { searchParams } = new URL(request.url)
      const couponId = searchParams.get('couponId')

      if (!couponId) {
        return NextResponse.json(
          { error: 'Coupon ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        const existingCoupon = await db.coupon.findUnique({
          where: { id: couponId },
        })

        if (!existingCoupon) {
          return NextResponse.json(
            { error: 'Coupon not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        await db.coupon.delete({
          where: { id: couponId },
        })

        // Log the action
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'delete_coupon',
            entityType: 'coupon',
            entityId: couponId,
            oldValue: JSON.stringify(existingCoupon),
          },
        })

        return NextResponse.json({ success: true, message: 'Coupon deleted successfully' })
      } catch (error) {
        console.error('Failed to delete coupon:', error)
        return NextResponse.json(
          { error: 'Failed to delete coupon' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)
