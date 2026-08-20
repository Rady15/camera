/**
 * Paymob Payment API - Payment Gateway Integration
 * Documentation: https://docs.paymob.com/docs/api-reference
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs, getUserFromHeaders } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'

// Paymob API Configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || ''
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || ''
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || ''

const PAYMOB_API_URL = 'https://accept.paymob.com/api'

// POST /api/payment/paymob - Initialize Paymob Payment
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const body = await request.json()
      const { orderId, amountCents, billingData } = body

      if (!orderId || !amountCents) {
        return NextResponse.json(
          { error: 'Order ID and amount are required', code: 'MISSING_PARAMS' },
          { status: 400 }
        )
      }

      try {
        // 1. Authentication Request - Get Auth Token
        const authRes = await fetch(`${PAYMOB_API_URL}/auth/tokens`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
        })

        const authData = await authRes.json()

        if (!authRes.ok || !authData.token) {
          console.error('Paymob auth failed:', authData)
          return NextResponse.json(
            { error: 'Payment gateway authentication failed', code: 'AUTH_FAILED' },
            { status: 500 }
          )
        }

        const authToken = authData.token

        // 2. Order Registration
        const orderRes = await fetch(`${PAYMOB_API_URL}/ecommerce/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_token: authToken,
            delivery_needed: 'false',
            amount_cents: amountCents,
            currency: 'SAR',
            merchant_order_id: orderId,
            items: [],
          }),
        })

        const orderData = await orderRes.json()

        if (!orderRes.ok || !orderData.id) {
          console.error('Paymob order registration failed:', orderData)
          return NextResponse.json(
            { error: 'Failed to register order with payment gateway', code: 'ORDER_REG_FAILED' },
            { status: 500 }
          )
        }

        const paymobOrderId = orderData.id

        // 3. Payment Key Request
        const paymentKeyRes = await fetch(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_token: authToken,
            amount_cents: amountCents,
            expiration: 3600, // 1 hour
            order_id: paymobOrderId,
            billing_data: {
              first_name: billingData?.firstName || 'Customer',
              last_name: billingData?.lastName || 'User',
              email: billingData?.email || 'customer@example.com',
              phone_number: billingData?.phone || '+201000000000',
              country: billingData?.country || 'EG',
              city: billingData?.city || 'Cairo',
              street: billingData?.street || 'NA',
              building: 'NA',
              floor: 'NA',
              apartment: 'NA',
            },
            currency: 'SAR',
            integration_id: PAYMOB_INTEGRATION_ID,
            lock_order_when_paid: 'true',
          }),
        })

        const paymentKeyData = await paymentKeyRes.json()

        if (!paymentKeyRes.ok || !paymentKeyData.token) {
          console.error('Paymob payment key failed:', paymentKeyData)
          return NextResponse.json(
            { error: 'Failed to generate payment key', code: 'PAYMENT_KEY_FAILED' },
            { status: 500 }
          )
        }

        // Update order with Paymob order ID
        // @ts-ignore - recently added field
        await db.order.update({
          where: { id: orderId },
          data: {
            metadata: JSON.stringify({
              paymobOrderId: paymobOrderId.toString(),
              paymentInitiatedAt: new Date().toISOString(),
            }),
          },
        })

        // Return payment URL
        const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKeyData.token}`

        return NextResponse.json({
          success: true,
          paymentUrl,
          paymobOrderId,
          paymentKey: paymentKeyData.token,
        })
      } catch (error) {
        console.error('Paymob payment initialization failed:', error)
        return NextResponse.json(
          { error: 'Failed to initialize payment', code: 'INIT_FAILED' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'auth'
)
