import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/daily-sales - Get daily sales for the past 7 days
export async function GET() {
  try {
    const validStatuses = ['confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'pending']
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: last7Days },
        status: { in: validStatuses }
      },
      select: {
        total: true,
        createdAt: true
      }
    })

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dailySalesMap = new Map<string, number>()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayName = dayNames[date.getDay()]
      dailySalesMap.set(dayName, 0)
    }
    
    orders.forEach(order => {
      const dayName = dayNames[new Date(order.createdAt).getDay()]
      dailySalesMap.set(dayName, (dailySalesMap.get(dayName) || 0) + order.total)
    })

    const dailySales = Array.from(dailySalesMap.entries()).map(([day, sales]) => ({
      day,
      sales
    }))

    return NextResponse.json({ dailySales })
  } catch (error) {
    console.error('Failed to fetch daily sales:', error)
    return NextResponse.json({ error: 'Failed to fetch daily sales' }, { status: 500 })
  }
}
