'use client'

import { useEffect, useState } from 'react'
import { User, ShoppingBag, Heart, Settings, LogOut, Package, CreditCard, MapPin, Trash2, Check, Truck, Clock, Eye, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUIStore, useAuthStore, useWishlistStore, Order } from '@/store'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export function UserDashboard() {
  const { setCurrentPage } = useUIStore()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { items: wishlistItems } = useWishlistStore()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage('login')
    } else {
      fetchOrders()
    }
  }, [isAuthenticated])

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return
    
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId))
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      if (!user?.id) return
      const res = await fetch(`/api/orders?userId=${user.id}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    logout()
    await signOut({ redirect: false })
    setCurrentPage('home')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'shipped': return 'bg-purple-500'
      case 'delivered': return 'bg-emerald-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-emerald-600 text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => setCurrentPage('orders')}>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-slate-500 text-sm">Orders</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => setCurrentPage('wishlist')}>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold">{wishlistItems.length}</p>
              <p className="text-slate-500 text-sm">Wishlist</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CreditCard className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-slate-500 text-sm">Saved Cards</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-slate-500 text-sm">Addresses</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" /> My Orders
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" /> Account Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-slate-100 p-3 rounded-lg">
                            <Package className="h-6 w-6 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Order #{order.orderNumber}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-slate-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setTrackingOrder(order)}
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            تتبع الطلب
                          </Button>

                          {(order.status === 'pending' || order.status === 'awaiting_payment') && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No orders yet</h3>
                  <p className="text-slate-500 mb-6">Start shopping to see your orders here.</p>
                  <Button onClick={() => setCurrentPage('shop')} className="bg-emerald-500 hover:bg-emerald-600">
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{user.phone || 'Not set'}</p>
                  </div>
                </div>
                <Separator />
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Tracking Modal - Premium Stepper */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl relative bg-white rounded-3xl overflow-hidden shadow-2xl">
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
                onClick={() => setTrackingOrder(null)}
            >
                <X className="h-6 w-6" />
            </Button>
            
            <CardHeader className="text-center pt-8 pb-4">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">تتبع حالة الطلب</p>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900">
                رقم الطلب: {trackingOrder.orderNumber.split('-')[2] || trackingOrder.orderNumber}
              </CardTitle>
              <p className="text-slate-500 text-sm mt-1">رقم الفاتورة: {trackingOrder.id.substring(trackingOrder.id.length - 10).toUpperCase()}</p>
            </CardHeader>

            <CardContent className="pt-6 pb-12 px-6 sm:px-12">
              {/* Stepper Container */}
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-[18px] left-[10%] right-[10%] h-[3px] bg-slate-100 hidden sm:block" />
                
                {/* Active Progress Bar */}
                <div 
                    className="absolute top-[18px] left-[10%] h-[3px] bg-emerald-500 transition-all duration-1000 hidden sm:block" 
                    style={{ 
                        width: trackingOrder.status === 'delivered' ? '80%' : 
                               trackingOrder.status === 'shipped' ? '40%' : '0%' 
                    }} 
                />

                {/* Steps */}
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 sm:gap-0 relative z-10">
                  
                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center group text-center w-full sm:w-1/3">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                        "bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-100 scale-110"
                    )}>
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                      <p className="font-bold text-slate-900 text-sm mb-1">تم المراجعة</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {new Date(trackingOrder.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: '2-digit', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {new Date(trackingOrder.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Shipped */}
                  <div className="flex flex-col items-center group text-center w-full sm:w-1/3">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 delay-300",
                        (trackingOrder.status === 'shipped' || trackingOrder.status === 'delivered')
                            ? "bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-100 scale-110"
                            : "bg-white border-slate-100 text-slate-300"
                    )}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                      <p className={cn(
                          "font-bold text-sm mb-1",
                          (trackingOrder.status === 'shipped' || trackingOrder.status === 'delivered') ? "text-slate-900" : "text-slate-300"
                      )}>جاري الشحن</p>
                      
                      {(trackingOrder.status === 'shipped' || trackingOrder.status === 'delivered') ? (
                          <>
                            <p className="text-[11px] text-emerald-600 font-bold mb-1">
                                رقم التتبع: {trackingOrder.trackingNumber || 'SV38291029'} 
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                                {trackingOrder.shippedAt 
                                    ? new Date(trackingOrder.shippedAt).toLocaleDateString('ar-EG') 
                                    : new Date(new Date(trackingOrder.createdAt).getTime() + 86400000).toLocaleDateString('ar-EG')}
                            </p>
                          </>
                      ) : (
                          <p className="text-[11px] text-slate-300">في انتظار الشحن</p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Delivered */}
                  <div className="flex flex-col items-center group text-center w-full sm:w-1/3">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 delay-600",
                        trackingOrder.status === 'delivered'
                            ? "bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-100 scale-110"
                            : "bg-white border-slate-100 text-slate-300"
                    )}>
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                      <p className={cn(
                          "font-bold text-sm mb-1",
                          trackingOrder.status === 'delivered' ? "text-slate-900" : "text-slate-300"
                      )}>تم الاستلام</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {trackingOrder.status === 'delivered' 
                            ? new Date(trackingOrder.deliveredAt || Date.now()).toLocaleDateString('ar-EG')
                            : 'تاريخ التوصيل المتوقع'}
                      </p>
                      {trackingOrder.status !== 'delivered' && (
                          <p className="text-[11px] text-slate-400 font-medium">
                            {new Date(new Date(trackingOrder.createdAt).getTime() + 259200000).toLocaleDateString('ar-EG')}
                          </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </CardContent>

            <div className="bg-slate-50 p-6 flex flex-col items-center gap-4">
                {trackingOrder.status === 'shipped' && (
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-12 py-3 font-bold shadow-lg shadow-emerald-100 animate-bounce"
                        onClick={async () => {
                            try {
                                const res = await fetch(`/api/orders/${trackingOrder.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'delivered' }),
                                })
                                if (res.ok) {
                                    const data = await res.json()
                                    setTrackingOrder(data.order)
                                    fetchOrders()
                                }
                            } catch (error) {
                                console.error('Failed to confirm delivery:', error)
                            }
                        }}
                    >
                        ✓ تأكيد استلام الشحنة
                    </Button>
                )}
                <Button 
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-2 font-bold"
                    onClick={() => setTrackingOrder(null)}
                >
                    إغلاق التتبع
                </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
