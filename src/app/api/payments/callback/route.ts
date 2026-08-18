/**
 * Paymob Payment Callback Webhook
 * Handles payment callbacks from Paymob
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyHmac, PaymobCallback } from '@/lib/payments/paymob'
import { sendOrderConfirmationEmail } from '@/lib/emails/resend'

// POST /api/payments/callback - Paymob webhook callback
export async function POST(request: NextRequest) {
  try {
    const callback: PaymobCallback = await request.json()
    
    // Verify HMAC signature
    const isValid = await verifyHmac(callback)
    if (!isValid) {
      console.error('Invalid HMAC signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { obj } = callback
    
    // Find order by merchant order ID
    const order = await db.order.findUnique({
      where: { orderNumber: obj.order.merchant_order_id },
      include: { items: true },
    })

    if (!order) {
      console.error('Order not found:', obj.order.merchant_order_id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Handle payment status
    if (obj.success) {
      // Payment successful
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paymentId: String(obj.id),
          status: 'confirmed',
          confirmedAt: new Date(),
        },
      })

      // Log the payment
      await db.auditLog.create({
        data: {
          userId: order.userId,
          action: 'payment_success',
          entityType: 'order',
          entityId: order.id,
          newValue: JSON.stringify({
            paymobPaymentId: obj.id,
            amount: obj.amount_cents / 100,
            currency: obj.currency,
          }),
        },
      })

      // Send confirmation email
      if (order.shippingEmail) {
        await sendOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: order.shippingName,
          customerEmail: order.shippingEmail,
          items: order.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: order.subtotal,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          shippingAddress: {
            street: order.shippingStreet,
            city: order.shippingCity,
            state: order.shippingState,
            phone: order.shippingPhone,
          },
          paymentMethod: order.paymentMethod,
        })
      }

      console.log(`Payment successful for order ${order.orderNumber}`)
    } else if (obj.pending) {
      // Payment pending
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'pending',
          status: 'pending_payment',
        },
      })

      console.log(`Payment pending for order ${order.orderNumber}`)
    } else {
      // Payment failed
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          status: 'payment_failed',
        },
      })

      // Log the failure
      await db.auditLog.create({
        data: {
          userId: order.userId,
          action: 'payment_failed',
          entityType: 'order',
          entityId: order.id,
          newValue: JSON.stringify({
            paymobPaymentId: obj.id,
          }),
        },
      })

      console.log(`Payment failed for order ${order.orderNumber}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 })
  }
}
