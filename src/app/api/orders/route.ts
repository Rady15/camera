import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SV-${timestamp}-${random}`
}

// GET /api/orders - Get orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const all = searchParams.get('all')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    
    // Build where clause
    let where: any = {}
    
    // Filter by userId
    if (userId) {
      where.userId = userId
    }
    
    // If not admin ('all' is only for admin panel), hide unpaid/draft orders
    if (all !== 'true') {
      where.status = { not: 'awaiting_payment' }
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { shippingName: { contains: search } },
        { shippingPhone: { contains: search } },
      ]
    }
    
    const orders = await db.order.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shipping, paymentMethod, customerNotes, subtotal, shippingCost, tax, total, userId } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }
    if (!shipping?.name || !shipping?.phone || !shipping?.street || !shipping?.city) {
      return NextResponse.json({ error: 'Missing shipping information' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    // Validate products exist and prepare order items
    const orderItems: any[] = []
    for (const item of items) {
      // Check if product exists
      if (item.productId) {
        const product = await db.product.findUnique({
          where: { id: item.productId }
        })
        
        if (product) {
          orderItems.push({
            productId: item.productId,
            productName: item.productName || product.name,
            productImage: item.productImage || (product.images ? JSON.parse(product.images)[0] : null),
            productSku: product.sku || null,
            price: item.price || product.price,
            quantity: item.quantity || 1,
            subtotal: (item.price || product.price) * (item.quantity || 1),
          })
        } else {
          // Product not found, create with provided data (no FK constraint)
          orderItems.push({
            productId: null, // Use null instead of empty string
            productName: item.productName || 'Unknown Product',
            productImage: item.productImage || null,
            productSku: null,
            price: item.price || 0,
            quantity: item.quantity || 1,
            subtotal: (item.price || 0) * (item.quantity || 1),
          })
        }
      } else {
        // No productId provided
        orderItems.push({
          productId: null, // Use null instead of empty string
          productName: item.productName || 'Unknown Product',
          productImage: item.productImage || null,
          productSku: null,
          price: item.price || 0,
          quantity: item.quantity || 1,
          subtotal: (item.price || 0) * (item.quantity || 1),
        })
      }
    }

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: userId || null, // Allow guest orders (null userId)
        status: paymentMethod === 'cod' ? 'pending' : 'awaiting_payment',
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'pending',
        subtotal: subtotal || 0,
        tax: tax || 0,
        shipping: shippingCost || 0,
        total: total || 0,
        shippingName: shipping.name,
        shippingPhone: shipping.phone,
        shippingEmail: shipping.email || null,
        shippingStreet: shipping.street,
        shippingCity: shipping.city,
        shippingState: shipping.state || '',
        shippingZipCode: shipping.zipCode || '',
        shippingCountry: shipping.country || 'Egypt',
        customerNotes: customerNotes || null,
        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    })

    // Update stock for each product
    for (const item of items) {
      if (item.productId) {
        try {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity || 1 }
            }
          })
        } catch (e) {
          // Ignore if product not found
          console.log('Could not update stock for product:', item.productId)
        }
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ error: 'Failed to create order', details: String(error) }, { status: 500 })
  }
}

// DELETE /api/orders - Delete an order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order items before deleting to restore stock
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Restore stock
    for (const item of order.items) {
      if (item.productId) {
        try {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity }
            }
          })
        } catch (e) {
          console.error('Failed to restore stock for product:', item.productId)
        }
      }
    }

    // Delete order (cascades to items)
    await db.order.delete({
      where: { id: orderId }
    })

    // Log action
    await db.auditLog.create({
      data: {
        action: 'delete',
        entityType: 'order',
        entityId: orderId,
        oldValue: JSON.stringify(order),
        orderId: orderId,
      }
    })

    return NextResponse.json({ success: true, message: 'Order deleted and stock restored' })
  } catch (error) {
    console.error('Failed to delete order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}

