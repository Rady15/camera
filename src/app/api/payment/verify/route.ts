import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const sessionId = searchParams.get('session_id')

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // If it's already confirmed, just return success
    if (order.status === 'confirmed') {
      return NextResponse.json({ success: true, order })
    }

    // Basic verification: if they reached success page with the right orderId, 
    // we mark it as confirmed (Draft -> Confirmed).
    // In a production app, we would verify the checkout session here via Stripe.
    
    await db.order.update({
      where: { id: orderId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentReference: sessionId || null,
        confirmedAt: new Date(),
      }
    })

    return NextResponse.json({ success: true, message: 'Order confirmed successfully' })
  } catch (error) {
    console.error('Failed to verify order:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
