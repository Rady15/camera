import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Auto-set timestamps based on status
    if (body.status === 'shipped' && !body.shippedAt) {
      body.shippedAt = new Date().toISOString()
    } else if (body.status === 'delivered' && !body.deliveredAt) {
      body.deliveredAt = new Date().toISOString()
      if (!body.shippedAt) body.shippedAt = new Date().toISOString() // Fallback
    } else if (body.status === 'confirmed' && !body.confirmedAt) {
      body.confirmedAt = new Date().toISOString()
    }
    
    const order = await db.order.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
