'use client'

import { useState } from 'react'
import { 
  DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, 
  Download, Calendar, BarChart3, PieChart, LineChart 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Mock data for charts
const salesData = [
  { month: 'Jan', sales: 12500, orders: 45 },
  { month: 'Feb', sales: 15200, orders: 52 },
  { month: 'Mar', sales: 18900, orders: 68 },
  { month: 'Apr', sales: 22100, orders: 75 },
  { month: 'May', sales: 19800, orders: 62 },
  { month: 'Jun', sales: 28500, orders: 89 },
]

const categoryData = [
  { name: 'Indoor Cameras', value: 35, color: 'bg-emerald-500' },
  { name: 'Outdoor Cameras', value: 28, color: 'bg-blue-500' },
  { name: 'Wireless Cameras', value: 18, color: 'bg-purple-500' },
  { name: 'DVR/NVR Systems', value: 12, color: 'bg-orange-500' },
  { name: 'Accessories', value: 7, color: 'bg-slate-500' },
]

const topProducts = [
  { name: 'ProShield 4K Indoor Camera', sales: 156, revenue: 23388 },
  { name: 'WeatherGuard Pro Outdoor', sales: 134, revenue: 33466 },
  { name: 'EasyMount Wireless Camera', sales: 98, revenue: 17622 },
  { name: 'SecureStore 8-Channel NVR', sales: 67, revenue: 40199 },
  { name: 'WiFi Video Doorbell Pro', sales: 89, revenue: 17799 },
]

export function AdminReportsPage() {
  const [period, setPeriod] = useState('6months')
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  const maxSales = Math.max(...salesData.map(d => d.sales))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-slate-400">Track your store performance and sales trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">$117,000</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">+18.5%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">391</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">+12.3%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">New Customers</p>
                <p className="text-2xl font-bold text-white">89</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">+24.7%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg. Order Value</p>
                <p className="text-2xl font-bold text-white">$299</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500">-2.1%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Sales Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={chartType === 'bar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="text-slate-300"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="text-slate-300"
              >
                <LineChart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {salesData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full group">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        chartType === 'bar' 
                          ? 'bg-emerald-600 hover:bg-emerald-500' 
                          : 'bg-transparent'
                      }`}
                      style={{ height: chartType === 'bar' ? `${(data.sales / maxSales) * 100}%` : '2px' }}
                    >
                      {chartType === 'line' && index > 0 && (
                        <div 
                          className="absolute bottom-full left-1/2 w-px bg-emerald-500"
                          style={{ height: `${(salesData[index - 1].sales / maxSales) * 200}px` }}
                        />
                      )}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge className="bg-slate-700 text-white text-xs">
                          ${(data.sales / 1000).toFixed(1)}k
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{category.name}</span>
                    <span className="text-white font-medium">{category.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.color} rounded-full`}
                      style={{ width: `${category.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-slate-400 text-sm">{product.sales} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-500 font-bold">${product.revenue.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
