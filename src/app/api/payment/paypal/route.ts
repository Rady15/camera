import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || ''
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || ''
const PAYPAL_API = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  const data = await response.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, items } = await req.json()

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return NextResponse.json({ 
        error: 'PayPal is not configured. Please add PAYPAL_CLIENT_ID and CLIENT_SECRET to your .env file.',
        code: 'PAYPAL_NOT_CONFIGURED' 
      }, { status: 500 })
    }

    const accessToken = await getPayPalAccessToken()
    
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: `Order #${orderId}`,
          },
        ],
        application_context: {
          brand_name: 'SecureVision',
          return_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${orderId}`,
          cancel_url: `${process.env.NEXTAUTH_URL}/cart?error=payment_cancelled`,
        },
      }),
    })

    const data = await response.json()
    const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href

    return NextResponse.json({ url: approvalUrl })

  } catch (error: any) {
    console.error('PayPal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
