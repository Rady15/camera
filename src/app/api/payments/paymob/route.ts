/**
 * Paymob Payment API Routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { protectApiRoute, routeConfigs, getUserFromHeaders } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'
import { initiatePayment, isPaymobConfigured } from '@/lib/payments/paymob'
import { db } from '@/lib/db'

// POST /api/payments/paymob - Initiate Paymob payment
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      try {
        // Check if Paymob is configured
        if (!isPaymobConfigured()) {
          return NextResponse.json(
            { error: 'Paymob is not configured', code: 'PAYMENT_NOT_CONFIGURED' },
            { status: 503 }
          )
        }

        const body = await request.json()
        const { orderId } = body
        const user = getUserFromHeaders(request)

        if (!orderId) {
          return NextResponse.json(
            { error: 'Order ID is required', code: 'MISSING_ORDER_ID' },
            { status: 400 }
          )
        }

        // Get order from database
        const order = await db.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        })

        if (!order) {
          return NextResponse.json(
            { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
            { status: 404 }
          )
        }

        // Check if user owns this order
        if (order.userId && order.userId !== user.id) {
          return NextResponse.json(
            { error: 'Forbidden', code: 'FORBIDDEN' },
            { status: 403 }
          )
        }

        // Check if order is already paid
        if (order.paymentStatus === 'paid') {
          return NextResponse.json(
            { error: 'Order is already paid', code: 'ALREADY_PAID' },
            { status: 400 }
          )
        }

        // Initiate payment
        const paymentResult = await initiatePayment({
          orderId: order.orderNumber,
          amount: order.total,
          items: order.items.map(item => ({
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
          })),
          customer: {
            firstName: order.shippingName.split(' ')[0] || order.shippingName,
            lastName: order.shippingName.split(' ').slice(1).join(' ') || 'Customer',
            phone: order.shippingPhone,
            email: order.shippingEmail || `${user.id}@securecam.com`,
            city: order.shippingCity,
            street: order.shippingStreet,
          },
        })

        // Update order with Paymob order ID
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentReference: String(paymentResult.paymobOrderId),
          },
        })

        // Log the action
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'initiate_payment',
            entityType: 'order',
            entityId: orderId,
            newValue: JSON.stringify({ paymobOrderId: paymentResult.paymobOrderId }),
          },
        })

        return NextResponse.json({
          success: true,
          paymentUrl: paymentResult.paymentUrl,
          paymobOrderId: paymentResult.paymobOrderId,
        })
      } catch (error) {
        console.error('Paymob payment error:', error)
        return NextResponse.json(
          { error: 'Payment initiation failed', code: 'PAYMENT_FAILED' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'checkout'
)
