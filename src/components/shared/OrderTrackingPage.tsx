'use client'

import { useState } from 'react'
import { 
  Search, Package, Truck, MapPin, CheckCircle, Clock, 
  XCircle, Phone, Mail, ChevronLeft, ChevronRight, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/store'
import { toast } from 'sonner'

interface TrackedOrder {
  id: string
  orderNumber: string
  status: string
  statusLabel: string
  paymentStatus: string
  paymentStatusLabel: string
  paymentMethod: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  trackingNumber: string | null
  trackingUrl: string | null
  shippingProvider: string | null
  shippingName: string
  shippingCity: string
  items: {
    id: string
    productName: string
    productImage: string
    productSku: string
    price: number
    quantity: number
    subtotal: number
  }[]
  itemsCount: number
  timeline: {
    status: string
    title: string
    description: string
    completed: boolean
    date: string
  }[]
  createdAt: string
  estimatedDelivery: string | null
}

export function OrderTrackingPage() {
  const { setCurrentPage } = useUIStore()
  const [searchType, setSearchType] = useState<'orderNumber' | 'phone'>('orderNumber')
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<TrackedOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<TrackedOrder | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('يرجى إدخال قيمة للبحث')
      return
    }

    setLoading(true)
    setSearched(true)
    
    try {
      const params = new URLSearchParams()
      if (searchType === 'orderNumber') {
        params.set('orderNumber', searchValue.trim())
      } else {
        params.set('phone', searchValue.trim())
      }

      const res = await fetch(`/api/orders/track?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        setOrders(data.orders || [])
        if (data.orders?.length === 1) {
          setSelectedOrder(data.orders[0])
        } else {
          setSelectedOrder(null)
        }
      } else {
        setOrders([])
        setSelectedOrder(null)
        if (data.error) {
          toast.error(data.error)
        }
      }
    } catch (error) {
      console.error('Failed to track order:', error)
      toast.error('فشل في تتبع الطلب')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_payment':
      case 'awaiting_confirmation':
        return 'bg-yellow-500'
      case 'confirmed':
      case 'processing':
      case 'ready_to_ship':
        return 'bg-blue-500'
      case 'shipped':
        return 'bg-purple-500'
      case 'delivered':
        return 'bg-emerald-500'
      case 'cancelled':
      case 'payment_failed':
      case 'returned':
      case 'refunded':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Package className="h-5 w-5" />
      case 'confirmed':
      case 'processing':
        return <Clock className="h-5 w-5" />
      case 'shipped':
        return <Truck className="h-5 w-5" />
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />
      case 'cancelled':
        return <XCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ريال`
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="text-slate-300 hover:text-white mb-4"
            onClick={() => setCurrentPage('home')}
          >
            <ChevronRight className="h-4 w-4 ml-1" />
            العودة للرئيسية
          </Button>
          <h1 className="text-3xl font-bold mb-2">تتبع الطلب</h1>
          <p className="text-slate-300">تتبع حالة طلبك بسهولة</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">البحث عن طلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={searchType === 'orderNumber' ? 'default' : 'outline'}
                  className={searchType === 'orderNumber' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                  onClick={() => {
                    setSearchType('orderNumber')
                    setSearchValue('')
                  }}
                >
                  رقم الطلب
                </Button>
                <Button
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  className={searchType === 'phone' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                  onClick={() => {
                    setSearchType('phone')
                    setSearchValue('')
                  }}
                >
                  رقم الهاتف
                </Button>
              </div>

              {/* Search Input */}
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={searchType === 'orderNumber' ? 'أدخل رقم الطلب (مثال: SC-123456)' : 'أدخل رقم الهاتف'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : searched && orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">لم يتم العثور على طلبات</h3>
              <p className="text-slate-500 mb-6">
                تأكد من إدخال {searchType === 'orderNumber' ? 'رقم الطلب' : 'رقم الهاتف'} بشكل صحيح
              </p>
              <Button onClick={() => setCurrentPage('shop')} className="bg-emerald-500 hover:bg-emerald-600">
                تصفح المنتجات
              </Button>
            </CardContent>
          </Card>
        ) : orders.length > 1 && !selectedOrder ? (
          /* Multiple Orders List */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">الطلبات found ({orders.length})</h2>
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="cursor-pointer hover:border-emerald-500 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-100 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">طلب #{order.orderNumber}</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {order.itemsCount} منتج • {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.statusLabel}
                      </Badge>
                      <ChevronLeft className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : selectedOrder ? (
          /* Single Order Detail */
          <div className="space-y-6">
            {/* Back Button for Multiple Orders */}
            {orders.length > 1 && (
              <Button
                variant="ghost"
                className="text-slate-600"
                onClick={() => setSelectedOrder(null)}
              >
                <ChevronRight className="h-4 w-4 ml-1" />
                العودة للقائمة
              </Button>
            )}

            {/* Order Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      طلب #{selectedOrder.orderNumber}
                    </h2>
                    <p className="text-slate-500">
                      تاريخ الطلب: {formatDate(selectedOrder.createdAt)}
                    </p>
                    {selectedOrder.estimatedDelivery && (
                      <p className="text-emerald-600 font-medium">
                        التسليم المتوقع: {formatDate(selectedOrder.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={`${getStatusColor(selectedOrder.status)} text-white text-base px-4 py-2`}>
                      {selectedOrder.statusLabel}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      الدفع: {selectedOrder.paymentStatusLabel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">حالة الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {selectedOrder.timeline.map((step, index) => (
                    <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                      {/* Line */}
                      {index < selectedOrder.timeline.length - 1 && (
                        <div 
                          className={`absolute right-[19px] top-10 w-0.5 h-[calc(100%-32px)] ${
                            step.completed ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                      
                      {/* Icon */}
                      <div 
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                          step.completed 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {getStatusIcon(step.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className={`font-semibold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-slate-500">{step.description}</p>
                        {step.date && step.completed && (
                          <p className="text-xs text-slate-400 mt-1">{formatDate(step.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Info */}
            {selectedOrder.trackingNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات التتبع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">رقم التتبع</p>
                      <p className="font-medium">{selectedOrder.trackingNumber}</p>
                    </div>
                  </div>
                  {selectedOrder.shippingProvider && (
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">شركة الشحن</p>
                        <p className="font-medium">{selectedOrder.shippingProvider}</p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.trackingUrl && (
                    <Button
                      asChild
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <a href={selectedOrder.trackingUrl} target="_blank" rel="noopener noreferrer">
                        تتبع الشحنة
                        <ChevronLeft className="h-4 w-4 mr-1" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">عنوان التوصيل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedOrder.shippingName}</p>
                    <p className="text-slate-500">{selectedOrder.shippingCity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المنتجات ({selectedOrder.itemsCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImage || '/placeholder-product.jpg'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{item.productName}</h4>
                        <p className="text-sm text-slate-500">SKU: {item.productSku}</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-slate-500">الكمية: {item.quantity}</span>
                          <span className="font-medium text-emerald-600">{formatCurrency(item.subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">المجموع الفرعي</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>الخصم</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">الشحن</span>
                    <span>{selectedOrder.shipping === 0 ? 'مجاني' : formatCurrency(selectedOrder.shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-emerald-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">طريقة الدفع</p>
                      <p className="font-medium">
                        {selectedOrder.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 
                         selectedOrder.paymentMethod === 'paymob' ? 'باي موب' :
                         selectedOrder.paymentMethod === 'fawry' ? 'فوري' :
                         selectedOrder.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <Badge variant={selectedOrder.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                    {selectedOrder.paymentStatusLabel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-emerald-900 mb-2">هل تحتاج مساعدة؟</h3>
                <p className="text-sm text-emerald-700 mb-4">
                  تواصل معنا لأي استفسار بخصوص طلبك
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-emerald-500 text-emerald-600">
                    <Phone className="h-4 w-4 ml-2" />
                    اتصل بنا
                  </Button>
                  <Button 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => setCurrentPage('contact')}
                  >
                    تواصل معنا
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
