/**
 * Order Tracking API - Track order status
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withRateLimit } from '@/lib/rate-limit'

// GET /api/orders/track - Track order by order number or phone
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const orderNumber = searchParams.get('orderNumber')
      const phone = searchParams.get('phone')

      if (!orderNumber && !phone) {
        return NextResponse.json(
          { error: 'يرجى إدخال رقم الطلب أو رقم الهاتف', code: 'MISSING_SEARCH' },
          { status: 400 }
        )
      }

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}

      if (orderNumber) {
        where.orderNumber = orderNumber.toUpperCase()
      }

      if (phone) {
        where.shippingPhone = { contains: phone }
      }

      const orders = await db.order.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              productName: true,
              productImage: true,
              productSku: true,
              price: true,
              quantity: true,
              subtotal: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10, // Limit results
      })

      if (orders.length === 0) {
        return NextResponse.json(
          { error: 'لم يتم العثور على طلبات', code: 'NOT_FOUND', orders: [] },
          { status: 404 }
        )
      }

      // Format orders for tracking display
      const trackedOrders = orders.map(order => {
        // Status timeline
        const timeline = []

        // Order placed
        timeline.push({
          status: 'placed',
          title: 'تم استلام الطلب',
          description: 'طلبك في انتظار المراجعة',
          completed: true,
          date: order.createdAt,
        })

        // Confirmed
        if (['confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered'].includes(order.status)) {
          timeline.push({
            status: 'confirmed',
            title: 'تم تأكيد الطلب',
            description: 'جاري تجهيز طلبك',
            completed: true,
            date: order.confirmedAt || order.updatedAt,
          })
        }

        // Processing
        if (['processing', 'ready_to_ship', 'shipped', 'delivered'].includes(order.status)) {
          timeline.push({
            status: 'processing',
            title: 'جاري التجهيز',
            description: 'طلبك في مرحلة التجهيز',
            completed: true,
            date: order.updatedAt,
          })
        }

        // Shipped
        if (['shipped', 'delivered'].includes(order.status)) {
          timeline.push({
            status: 'shipped',
            title: 'تم الشحن',
            description: order.trackingNumber ? `رقم التتبع: ${order.trackingNumber}` : 'طلبك في الطريق إليك',
            completed: true,
            date: order.shippedAt || order.updatedAt,
          })
        }

        // Delivered
        if (order.status === 'delivered') {
          timeline.push({
            status: 'delivered',
            title: 'تم التسليم',
            description: 'تم تسليم طلبك بنجاح',
            completed: true,
            date: order.deliveredAt || order.updatedAt,
          })
        }

        // Cancelled
        if (order.status === 'cancelled') {
          timeline.push({
            status: 'cancelled',
            title: 'تم الإلغاء',
            description: 'تم إلغاء الطلب',
            completed: true,
            date: order.cancelledAt || order.updatedAt,
          })
        }

        // Status labels in Arabic
        const statusLabels: Record<string, string> = {
          pending: 'قيد الانتظار',
          pending_payment: 'في انتظار الدفع',
          payment_failed: 'فشل الدفع',
          awaiting_confirmation: 'في انتظار التأكيد',
          confirmed: 'مؤكد',
          processing: 'جاري التجهيز',
          ready_to_ship: 'جاهز للشحن',
          shipped: 'تم الشحن',
          delivered: 'تم التسليم',
          partially_delivered: 'تسليم جزئي',
          returned: 'مرتجع',
          refunded: 'مسترد',
          cancelled: 'ملغي',
        }

        // Payment status labels
        const paymentStatusLabels: Record<string, string> = {
          pending: 'قيد الانتظار',
          paid: 'مدفوع',
          failed: 'فشل',
          refunded: 'مسترد',
        }

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          statusLabel: statusLabels[order.status] || order.status,
          paymentStatus: order.paymentStatus,
          paymentStatusLabel: paymentStatusLabels[order.paymentStatus] || order.paymentStatus,
          paymentMethod: order.paymentMethod,
          subtotal: order.subtotal,
          discount: order.discount,
          shipping: order.shipping,
          total: order.total,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          shippingProvider: order.shippingProvider,
          shippingName: order.shippingName,
          shippingCity: order.shippingCity,
          items: order.items,
          itemsCount: order.items.length,
          timeline,
          createdAt: order.createdAt,
          estimatedDelivery: order.shippedAt 
            ? new Date(order.shippedAt.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days after shipping
            : null,
        }
      })

      return NextResponse.json({
        orders: trackedOrders,
        count: trackedOrders.length,
      })
    } catch (error) {
      console.error('Failed to track order:', error)
      return NextResponse.json(
        { error: 'فشل في تتبع الطلب' },
        { status: 500 }
      )
    }
  },
  'public'
)
