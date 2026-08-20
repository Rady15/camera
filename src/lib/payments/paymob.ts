/**
 * Paymob Payment Gateway Integration
 * Documentation: https://docs.paymob.com/docs/api
 */

// Paymob API Configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET

const PAYMOB_API_URL = 'https://accept.paymob.com/api'

// Types
export interface PaymobAuthResponse {
  token: string
}

export interface PaymobOrderRequest {
  auth_token: string
  delivery_needed: boolean
  amount_cents: number
  currency: 'SAR'
  merchant_order_id: string
  items: PaymobOrderItem[]
  shipping_data?: {
    first_name: string
    last_name: string
    phone_number: string
    email: string
    city: string
    country: string
    street: string
    building: string
    floor: string
    apartment: string
  }
}

export interface PaymobOrderItem {
  name: string
  amount_cents: number
  description: string
  quantity: number
}

export interface PaymobOrderResponse {
  id: number
  created_at: string
  currency: string
  amount_cents: number
  merchant_order_id: string
}

export interface PaymobPaymentKeyRequest {
  auth_token: string
  amount_cents: number
  expiration: number
  order_id: number
  billing_data: {
    first_name: string
    last_name: string
    phone_number: string
    email: string
    city: string
    country: string
    street: string
    building: string
    floor: string
    apartment: string
  }
  currency: 'SAR'
  integration_id: number
  lock_order_when_paid: boolean
}

export interface PaymobPaymentKeyResponse {
  token: string
}

export interface PaymobCallback {
  obj: {
    id: number
    order: {
      id: number
      merchant_order_id: string
    }
    success: boolean
    pending: boolean
    is_refund: boolean
    source_data: {
      type: string
      pan: string
      sub_type: string
    }
    amount_cents: number
    currency: string
    created_at: string
    hmac: string
  }
}

/**
 * Step 1: Authentication Request
 * Get authentication token
 */
export async function authenticate(): Promise<string> {
  if (!PAYMOB_API_KEY) {
    throw new Error('PAYMOB_API_KEY is not configured')
  }

  const response = await fetch(`${PAYMOB_API_URL}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paymob authentication failed: ${error}`)
  }

  const data = await response.json() as PaymobAuthResponse
  return data.token
}

/**
 * Step 2: Order Registration
 * Create an order in Paymob
 */
export async function createOrder(
  authToken: string,
  orderData: {
    orderId: string
    amount: number // in SAR
    items: Array<{
      name: string
      price: number
      quantity: number
    }>
    shippingData?: {
      firstName: string
      lastName: string
      phone: string
      email: string
      city: string
      street: string
    }
  }
): Promise<number> {
  const amountCents = Math.round(orderData.amount * 100) // Convert to cents

  const payload: PaymobOrderRequest = {
    auth_token: authToken,
    delivery_needed: !!orderData.shippingData,
    amount_cents: amountCents,
    currency: 'SAR',
    merchant_order_id: orderData.orderId,
    items: orderData.items.map(item => ({
      name: item.name,
      amount_cents: Math.round(item.price * 100),
      description: item.name,
      quantity: item.quantity,
    })),
    shipping_data: orderData.shippingData ? {
      first_name: orderData.shippingData.firstName,
      last_name: orderData.shippingData.lastName,
      phone_number: orderData.shippingData.phone,
      email: orderData.shippingData.email,
      city: orderData.shippingData.city,
      country: 'EG',
      street: orderData.shippingData.street,
      building: 'N/A',
      floor: 'N/A',
      apartment: 'N/A',
    } : undefined,
  }

  const response = await fetch(`${PAYMOB_API_URL}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paymob order creation failed: ${error}`)
  }

  const data = await response.json() as PaymobOrderResponse
  return data.id
}

/**
 * Step 3: Payment Key Request
 * Generate payment key for iframe
 */
export async function getPaymentKey(
  authToken: string,
  orderId: number,
  amount: number,
  billingData: {
    firstName: string
    lastName: string
    phone: string
    email: string
    city: string
    street: string
  }
): Promise<string> {
  if (!PAYMOB_INTEGRATION_ID) {
    throw new Error('PAYMOB_INTEGRATION_ID is not configured')
  }

  const amountCents = Math.round(amount * 100)

  const payload: PaymobPaymentKeyRequest = {
    auth_token: authToken,
    amount_cents: amountCents,
    expiration: 3600, // 1 hour
    order_id: orderId,
    billing_data: {
      first_name: billingData.firstName,
      last_name: billingData.lastName,
      phone_number: billingData.phone,
      email: billingData.email,
      city: billingData.city,
      country: 'EG',
      street: billingData.street,
      building: 'N/A',
      floor: 'N/A',
      apartment: 'N/A',
    },
    currency: 'SAR',
    integration_id: parseInt(PAYMOB_INTEGRATION_ID),
    lock_order_when_paid: true,
  }

  const response = await fetch(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Paymob payment key generation failed: ${error}`)
  }

  const data = await response.json() as PaymobPaymentKeyResponse
  return data.token
}

/**
 * Get Payment iframe URL
 */
export function getPaymentIframeUrl(paymentKey: string): string {
  if (!PAYMOB_IFRAME_ID) {
    throw new Error('PAYMOB_IFRAME_ID is not configured')
  }
  return `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`
}

/**
 * Verify HMAC signature from callback
 */
export async function verifyHmac(callback: PaymobCallback): Promise<boolean> {
  if (!PAYMOB_HMAC_SECRET) {
    console.warn('PAYMOB_HMAC_SECRET is not configured')
    return true // Skip verification in development
  }

  const obj = callback.obj
  const concatenatedString = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    (obj as Record<string, unknown>).error_occured || '',
    (obj as Record<string, unknown>).has_parent_transaction || '',
    obj.id,
    (obj as Record<string, unknown>).integration_id,
    (obj as Record<string, unknown>).is_3d_secure || '',
    (obj as Record<string, unknown>).is_auth || '',
    (obj as Record<string, unknown>).is_capture || '',
    obj.is_refund || '',
    (obj as Record<string, unknown>).is_standalone_payment || '',
    (obj as Record<string, unknown>).is_voided || '',
    obj.order.id,
    (obj as Record<string, unknown>).owner,
    obj.pending,
    obj.source_data.pan,
    obj.source_data.sub_type,
    obj.source_data.type,
    obj.success,
  ].join('')

  const crypto = await import('crypto')
  const calculatedHmac = crypto
    .createHmac('sha512', PAYMOB_HMAC_SECRET)
    .update(concatenatedString)
    .digest('hex')

  return calculatedHmac === obj.hmac
}

/**
 * Full payment flow - create order and get payment URL
 */
export async function initiatePayment(orderData: {
  orderId: string
  amount: number
  items: Array<{ name: string; price: number; quantity: number }>
  customer: {
    firstName: string
    lastName: string
    phone: string
    email: string
    city: string
    street: string
  }
}): Promise<{ paymentUrl: string; paymobOrderId: number }> {
  // Step 1: Authenticate
  const authToken = await authenticate()

  // Step 2: Create order
  const paymobOrderId = await createOrder(authToken, {
    orderId: orderData.orderId,
    amount: orderData.amount,
    items: orderData.items,
    shippingData: orderData.customer,
  })

  // Step 3: Get payment key
  const paymentKey = await getPaymentKey(
    authToken,
    paymobOrderId,
    orderData.amount,
    orderData.customer
  )

  // Step 4: Get iframe URL
  const paymentUrl = getPaymentIframeUrl(paymentKey)

  return { paymentUrl, paymobOrderId }
}

/**
 * Check if Paymob is configured
 */
export function isPaymobConfigured(): boolean {
  return !!(PAYMOB_API_KEY && PAYMOB_INTEGRATION_ID && PAYMOB_IFRAME_ID)
}
