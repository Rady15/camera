import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/stats - Get admin dashboard stats
export async function GET() {
  try {
    // Define statuses that count as valid business (excluding drafts/cancelled)
    const validStatuses = ['confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'pending']
    
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      orders,
      pendingOrders,
      lowStockProducts,
      last7DaysOrders,
      last14DaysOrders,
      topProductsRaw
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count({ where: { status: { in: validStatuses } } }),
      db.user.count({ where: { role: 'customer' } }),
      db.order.findMany({
        where: { status: { in: validStatuses } },
        select: { total: true, createdAt: true, status: true }
      }),
      db.order.count({ where: { status: { in: ['pending', 'awaiting_confirmation'] } } }),
      db.product.count({ where: { stock: { lt: 5 }, isActive: true } }),
      db.order.findMany({
        where: {
          status: { in: validStatuses },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: { total: true }
      }),
      db.order.findMany({
        where: {
          status: { in: validStatuses },
          createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
        },
        select: { total: true }
      }),
      db.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      })
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const last7DaysRevenue = last7DaysOrders.reduce((sum, order) => sum + order.total, 0)
    const last14DaysRevenue = last14DaysOrders.reduce((sum, order) => sum + order.total, 0)
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const last7DaysOrdersCount = last7DaysOrders.length
    const last14DaysOrdersCount = last14DaysOrders.length

    const revenueChange = last14DaysRevenue > 0 
      ? ((last7DaysRevenue - (last14DaysRevenue / 2)) / (last14DaysRevenue / 2)) * 100 
      : 0
    
    const ordersChange = last14DaysOrdersCount > 0 
      ? ((last7DaysOrdersCount - (last14DaysOrdersCount / 2)) / (last14DaysOrdersCount / 2)) * 100 
      : 0

    const topProducts = topProductsRaw.map(item => ({
      name: item.productName,
      sales: item._sum.quantity || 0,
      revenue: item._sum.subtotal || 0
    }))

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        avgOrderValue,
        revenueChange: revenueChange.toFixed(1),
        ordersChange: ordersChange.toFixed(1),
        customersChange: "0.0",
        topProducts
      }
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
