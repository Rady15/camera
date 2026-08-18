/**
 * Paymob Callback API - Process Payment Webhooks
 * This endpoint receives callbacks from Paymob after payment completion
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit } from '@/lib/rate-limit'

// POST /api/payment/callback - Process Paymob Webhook
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      const body = await request.json()
      
      // Log the callback for debugging
      console.log('Paymob callback received:', JSON.stringify(body, null, 2))

      const {
        obj: {
          order: { merchant_order_id, id: paymobOrderId },
          success,
          pending,
          is_voided,
          is_refunded,
          amount_cents,
          currency,
          source_data: { type: paymentType, pan: cardNumber, sub_type: cardType },
          id: transactionId,
        },
        type: callbackType,
      } = body

      if (!merchant_order_id) {
        return NextResponse.json(
          { error: 'Missing merchant order ID' },
          { status: 400 }
        )
      }

      // Find the order
      const order = await db.order.findFirst({
        where: {
          OR: [
            { id: merchant_order_id },
            { orderNumber: merchant_order_id },
          ],
        },
      })

      if (!order) {
        console.error('Order not found for callback:', merchant_order_id)
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      // Process based on callback type
      if (callbackType === 'TRANSACTION') {
        if (success) {
          // Payment successful
          const currentMetadata = order.metadata ? JSON.parse(order.metadata) : {}
          await db.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'paid',
              status: 'confirmed',
              paidAt: new Date(),
              metadata: JSON.stringify({
                ...currentMetadata,
                paymobTransactionId: transactionId?.toString(),
                paymobOrderId: paymobOrderId?.toString(),
                paymentType,
                cardLastFour: cardNumber ? cardNumber.slice(-4) : null,
                cardType,
                paidAmount: amount_cents ? (amount_cents / 100).toFixed(2) : order.total.toString(),
                paymentCurrency: currency,
                paidAt: new Date().toISOString(),
              }),
            },
          })

          // Log the successful payment
          console.log(`Payment successful for order ${order.orderNumber}`)
          
          // Emit event for real-time updates (if using websockets)
          // This would typically update inventory, send emails, etc.
          
        } else if (pending) {
          // Payment pending
          const currentMetadata = order.metadata ? JSON.parse(order.metadata) : {}
          await db.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'pending',
              metadata: JSON.stringify({
                ...currentMetadata,
                paymobTransactionId: transactionId?.toString(),
                paymentPendingAt: new Date().toISOString(),
              }),
            },
          })
          
          console.log(`Payment pending for order ${order.orderNumber}`)
          
        } else if (is_voided || is_refunded) {
          // Payment voided or refunded
          const currentMetadata = order.metadata ? JSON.parse(order.metadata) : {}
          await db.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: is_refunded ? 'refunded' : 'voided',
              status: is_refunded ? 'refunded' : 'cancelled',
              metadata: JSON.stringify({
                ...currentMetadata,
                voidedOrRefundedAt: new Date().toISOString(),
              }),
            },
          })
          
          console.log(`Payment ${is_refunded ? 'refunded' : 'voided'} for order ${order.orderNumber}`)
        }
      }

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Failed to process payment callback:', error)
      return NextResponse.json(
        { error: 'Failed to process callback' },
        { status: 500 }
      )
    }
  },
  'public' // Allow public access for webhooks
)

// GET /api/payment/callback - Payment Return URL
export const GET = withRateLimit(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order')
    const success = searchParams.get('success')
    const pending = searchParams.get('pending')
    const cancelled = searchParams.get('cancelled')

    if (!orderId) {
      return NextResponse.redirect(new URL('/cart?error=no_order', request.url))
    }

    try {
      const order = await db.order.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderNumber: orderId },
          ],
        },
      })

      if (!order) {
        return NextResponse.redirect(new URL('/cart?error=order_not_found', request.url))
      }

      if (success === 'true') {
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            status: 'confirmed',
            paidAt: new Date(),
          },
        })
        
        // Redirect to success page
        return NextResponse.redirect(
          new URL(`/checkout/success?order=${order.orderNumber}`, request.url)
        )
      } else if (pending === 'true') {
        return NextResponse.redirect(
          new URL(`/checkout/pending?order=${order.orderNumber}`, request.url)
        )
      } else {
        return NextResponse.redirect(
          new URL(`/checkout/failed?order=${order.orderNumber}`, request.url)
        )
      }
    } catch (error) {
      console.error('Failed to process payment return:', error)
      return NextResponse.redirect(new URL('/cart?error=processing_failed', request.url))
    }
  },
  'public'
)
