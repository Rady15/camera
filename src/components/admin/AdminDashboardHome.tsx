'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useUIStore } from '@/store'
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Package,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface KPIStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  conversionRate: number
  pendingOrders: number
  lowStockProducts: number
  avgOrderValue: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
  customersChange: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  shippingName?: string
  total: number
  status: string
  createdAt: string
}

interface TopProduct {
  id: string
  name: string
  salesCount: number
  revenue: number
  stock: number
}

interface DailySales {
  day: string
  sales: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  processing: 'bg-blue-500/20 text-blue-500',
  shipped: 'bg-purple-500/20 text-purple-500',
  delivered: 'bg-emerald-500/20 text-emerald-500',
  cancelled: 'bg-red-500/20 text-red-500',
}

export function AdminDashboardHome() {
  const { token, isLoading, isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState<KPIStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    conversionRate: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    avgOrderValue: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    const { token: authToken } = useAuthStore.getState()
    const headers: HeadersInit | undefined = authToken ? { Authorization: `Bearer ${authToken}` } : undefined
    
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', { headers })
      if (statsRes.status === 401) {
        useAuthStore.getState().logout()
        useUIStore.getState().setCurrentPage('login')
        return
      }
      const statsData = await statsRes.json()
      if (statsData.stats) {
        setStats(prev => ({ ...prev, ...statsData.stats }))
        if (statsData.stats.topProducts) {
          setTopProducts(statsData.stats.topProducts.map((p: any) => ({
            id: p.name, // Use name as ID if no ID provided from aggregation
            name: p.name,
            salesCount: p.sales,
            revenue: p.revenue,
            stock: 0, // Stock is not in this aggregation
          })))
        }
      }

      // Fetch recent orders
      const ordersRes = await fetch('/api/orders?limit=5&all=true', { headers })
      const ordersData = await ordersRes.json()
      setRecentOrders(ordersData.orders || [])

      // Fetch daily sales
      const dailySalesRes = await fetch('/api/admin/daily-sales', { headers })
      const dailySalesData = await dailySalesRes.json()
      if (dailySalesData.dailySales) {
        setDailySales(dailySalesData.dailySales)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      useUIStore.getState().setCurrentPage('login')
      return
    }
    
    if (!isLoading && isAuthenticated) {
      fetchDashboardData()
    }
  }, [isLoading, isAuthenticated])

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال`,
      change: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`,
      changeType: stats.revenueChange >= 0 ? 'up' : 'down',
      icon: DollarSign,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange}%`,
      changeType: stats.ordersChange >= 0 ? 'up' : 'down',
      icon: ShoppingCart,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total Customers',
      value: stats.totalUsers.toLocaleString(),
      change: `${stats.customersChange >= 0 ? '+' : ''}${stats.customersChange}%`,
      changeType: stats.customersChange >= 0 ? 'up' : 'down',
      icon: Users,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Avg. Order Value',
      value: `${stats.avgOrderValue.toFixed(2)} ريال`,
      change: stats.totalOrders > 0 ? 'Based on orders' : 'No orders',
      changeType: 'neutral',
      icon: DollarSign,
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-500',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      change: stats.pendingOrders > 0 ? 'Needs attention' : 'No pending',
      changeType: stats.pendingOrders > 0 ? 'alert' : 'neutral',
      icon: ShoppingCart,
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-500',
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockProducts.toString(),
      change: 'Products < 5 units',
      changeType: stats.lowStockProducts > 0 ? 'alert' : 'neutral',
      icon: AlertTriangle,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-500',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: 'Active catalog',
      changeType: 'neutral',
      icon: Package,
      iconBg: 'bg-slate-500/20',
      iconColor: 'text-slate-500',
    },
  ]

  const maxSales = Math.max(...dailySales.map(d => d.sales), 1)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${card.iconBg}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  {card.changeType === 'up' && (
                    <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {card.change}
                    </Badge>
                  )}
                  {card.changeType === 'down' && (
                    <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/20">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      {card.change}
                    </Badge>
                  )}
                  {card.changeType === 'alert' && (
                    <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20">
                      {card.change}
                    </Badge>
                  )}
                  {card.changeType === 'neutral' && (
                    <Badge className="bg-slate-500/20 text-slate-400 hover:bg-slate-500/20">
                      {card.change}
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-sm text-slate-400">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Sales Overview</CardTitle>
              <CardDescription className="text-slate-400">Daily sales for the past week</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              View Report
            </Button>
          </CardHeader>
          <CardContent>
            {/* Simple Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {dailySales.length > 0 ? dailySales.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-emerald-600 rounded-t-lg transition-all duration-300 hover:bg-emerald-500"
                    style={{ height: `${(data.sales / maxSales) * 100}%` }}
                  />
                  <span className="text-xs text-slate-400">{data.day}</span>
                </div>
              )) : (
                <div className="w-full text-center text-slate-400 py-12">No sales data yet</div>
              )}
            </div>
            <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-slate-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.totalRevenue.toLocaleString()} ريال</p>
                <p className="text-sm text-slate-400">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}%</p>
                <p className="text-sm text-slate-400">This Week vs Last</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Top Products</CardTitle>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Eye className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).length > 0 ? topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-sm font-medium text-slate-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.salesCount} sales</p>
                  </div>
                  <p className="text-sm font-medium text-emerald-500">
                    {product.revenue.toLocaleString()} ريال
                  </p>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>No products data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Recent Orders</CardTitle>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-400">Order</TableHead>
                    <TableHead className="text-slate-400">Customer</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="text-white font-medium">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {order.shippingName || 'Guest'}
                      </TableCell>
                      <TableCell className="text-white">
                        {order.total.toLocaleString()} ريال
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || statusColors.pending}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p>No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Low Stock Alert</CardTitle>
              <CardDescription className="text-slate-400">Products running low on inventory</CardDescription>
            </div>
            <Badge className="bg-red-500/20 text-red-500">
              {stats.lowStockProducts} items
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.filter(p => p.stock < 5).slice(0, 5).length > 0 ? (
                topProducts.filter(p => p.stock < 5).slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{product.name}</p>
                        <p className="text-xs text-slate-400">SKU: {product.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-500">
                        {product.stock} left
                      </p>
                      <p className="text-xs text-slate-400">in stock</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>No low stock products</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
