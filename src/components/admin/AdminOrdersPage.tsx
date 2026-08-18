'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Package,
  Printer,
  Mail,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingName: string
  shippingPhone: string
  shippingEmail?: string
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingZipCode: string
  shippingCountry: string
  trackingNumber?: string
  trackingUrl?: string
  shippingProvider?: string
  deliveryMethod?: 'courier' | 'pickup'
  pickupBranch?: string
  notes?: string
  createdAt: string
  items: {
    id: string
    productId: string
    productName: string
    productImage: string
    price: number
    quantity: number
  }[]
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  pending_payment: { label: 'Pending Payment', color: 'bg-orange-500/20 text-orange-500', icon: CreditCard },
  payment_failed: { label: 'Payment Failed', color: 'bg-red-500/20 text-red-500', icon: XCircle },
  awaiting_confirmation: { label: 'Awaiting Confirmation', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-500', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-500', icon: Package },
  ready_to_ship: { label: 'Ready to Ship', color: 'bg-purple-500/20 text-purple-500', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-500/20 text-purple-500', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-500/20 text-emerald-500', icon: CheckCircle },
  partially_delivered: { label: 'Partially Delivered', color: 'bg-orange-500/20 text-orange-500', icon: AlertCircle },
  returned: { label: 'Returned', color: 'bg-slate-500/20 text-slate-400', icon: Package },
  refunded: { label: 'Refunded', color: 'bg-slate-500/20 text-slate-400', icon: CreditCard },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-500', icon: XCircle },
}

const statusPipeline = [
  'pending',
  'confirmed',
  'processing',
  'ready_to_ship',
  'shipped',
  'delivered',
]

export function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [searchQuery, statusFilter, paymentFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('all', 'true')
      if (searchQuery) params.append('search', searchQuery)
      
      const res = await fetch(`/api/orders?${params.toString()}`)
      const data = await res.json()
      let filteredOrders = data.orders || []
      
      if (statusFilter && statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter((o: Order) => o.status === statusFilter)
      }
      if (paymentFilter && paymentFilter !== 'all') {
        filteredOrders = filteredOrders.filter((o: Order) => o.paymentStatus === paymentFilter)
      }
      
      setOrders(filteredOrders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This will restore product stock.')) return
    
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'Order deleted successfully' })
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          setOrderDialogOpen(false)
        }
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete order')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      toast({ title: 'Order status updated' })
      fetchOrders()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setOrderDialogOpen(true)
  }

  const handlePrintInvoice = (order: Order) => {
    toast({ title: 'Generating invoice...', description: `Order #${order.orderNumber}` })
  }

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => ['pending', 'pending_payment', 'awaiting_confirmation'].includes(o.status)).length,
    processing: orders.filter(o => ['confirmed', 'processing', 'ready_to_ship'].includes(o.status)).length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  // Pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-slate-400">Manage and track customer orders</p>
        </div>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Status Pipeline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: 'total', label: 'Total', value: stats.total, color: 'bg-slate-700' },
          { key: 'pending', label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
          { key: 'processing', label: 'Processing', value: stats.processing, color: 'bg-blue-500' },
          { key: 'shipped', label: 'Shipped', value: stats.shipped, color: 'bg-purple-500' },
          { key: 'delivered', label: 'Delivered', value: stats.delivered, color: 'bg-emerald-500' },
          { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, color: 'bg-red-500' },
        ].map((stat) => (
          <Card 
            key={stat.key} 
            className={`bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700 transition-colors ${statusFilter === stat.key ? 'ring-2 ring-emerald-500' : ''}`}
            onClick={() => setStatusFilter(statusFilter === stat.key ? 'all' : stat.key === 'total' ? 'all' : stat.key)}
          >
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <div className={`h-1 w-full ${stat.color} rounded-full mt-2`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Order</TableHead>
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Items</TableHead>
                <TableHead className="text-slate-400">Total</TableHead>
                <TableHead className="text-slate-400">Payment</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400 w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={8} className="h-16 bg-slate-800/50 animate-pulse" />
                  </TableRow>
                ))
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const statusConf = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = statusConf.icon
                  return (
                    <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-white">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white">{order.shippingName}</p>
                          <p className="text-xs text-slate-400">
                            {order.deliveryMethod === 'pickup' ? `استلام من: ${order.pickupBranch}` : 'توصيل للمنزل'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={order.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-yellow-500/20 text-yellow-500'}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleUpdateStatus(order.id, v)}
                        >
                          <SelectTrigger className={`w-36 bg-transparent border-0 ${statusConf.color}`}>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <span>{statusConf.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>No orders found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, orders.length)} of {orders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'bg-emerald-600' : 'border-slate-700 text-slate-300'}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="border-slate-700 text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <span>Order #{selectedOrder?.orderNumber}</span>
              <Badge className={statusConfig[selectedOrder?.status || 'pending']?.color}>
                {statusConfig[selectedOrder?.status || 'pending']?.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-4">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                      <div className="w-16 h-16 bg-slate-700 rounded overflow-hidden">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.productName}</p>
                        <p className="text-slate-400 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Order Summary */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                  <div className="bg-slate-800 p-4 rounded-lg text-slate-300">
                    <p className="font-medium text-white">{selectedOrder.shippingName}</p>
                    <p>{selectedOrder.shippingPhone}</p>
                    {selectedOrder.deliveryMethod === 'pickup' ? (
                        <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-emerald-500 font-bold text-sm">✓ استلام من الفرع</p>
                            <p className="text-emerald-400 text-xs">{selectedOrder.pickupBranch}</p>
                        </div>
                    ) : (
                        <>
                            <p>{selectedOrder.shippingStreet}</p>
                            <p>{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZipCode}</p>
                            <p>{selectedOrder.shippingCountry}</p>
                        </>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Payment Details</h3>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span>Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span>Shipping</span>
                      <span>${selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span>Tax</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-slate-700 my-2" />
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className={selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-yellow-500/20 text-yellow-500'}>
                        {selectedOrder.paymentStatus}
                      </Badge>
                      <span className="text-slate-400 text-sm">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.trackingNumber && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Tracking</h3>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <p className="text-slate-300">
                      <span className="text-slate-400">Carrier:</span> {selectedOrder.shippingProvider}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Tracking:</span> {selectedOrder.trackingNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                  <div className="bg-slate-800 p-4 rounded-lg text-slate-300">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOrderDialogOpen(false)} className="border-slate-700 text-slate-300">
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Order
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
