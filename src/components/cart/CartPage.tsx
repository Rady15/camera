'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useUIStore, useCartStore, useAuthStore } from '@/store'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function CheckoutPage() {
  const { setCurrentPage } = useUIStore()
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    notes: '',
  })
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('courier')
  const [pickupBranch, setPickupBranch] = useState('القاهرة - وسط البلد')

  const shipping = totalPrice >= 99 ? 0 : 9.99
  const tax = totalPrice * 0.08
  const total = totalPrice + shipping + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images[0] || '',
            quantity: item.quantity,
            price: item.product.price,
          })),
          shipping: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          deliveryMethod,
          pickupBranch: deliveryMethod === 'pickup' ? pickupBranch : null,
          paymentMethod,
          customerNotes: formData.notes,
          subtotal: totalPrice,
          shippingCost: shipping,
          tax,
          total,
          userId: user?.id || null,
        }),
      })

      const orderData = await orderRes.json()
      
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order')

      // Handle card payment redirection
      if (paymentMethod === 'card') {
        const stripeRes = await fetch('/api/payment/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.order.id,
            amount: total,
            customerEmail: formData.email,
            items: items.map(item => ({
              productName: item.product.name,
              productImage: item.product.images[0] || '',
              quantity: item.quantity,
              price: item.product.price,
            })),
          }),
        })

        const stripeData = await stripeRes.json()
        if (stripeRes.ok && stripeData.url) {
          window.location.href = stripeData.url
          return
        } else {
          throw new Error(stripeData.error || 'Stripe initialization failed')
        }
      }

      // Handle paypal payment redirection
      if (paymentMethod === 'paypal') {
        const paypalRes = await fetch('/api/payment/paypal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.order.id,
            amount: total,
            items: items.map(item => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
          }),
        })

        const paypalData = await paypalRes.json()
        if (paypalRes.ok && paypalData.url) {
          window.location.href = paypalData.url
          return
        } else {
          throw new Error(paypalData.error || 'PayPal initialization failed')
        }
      }

      // Handle COD and success
      setOrderNumber(orderData.order.orderNumber)
      setOrderPlaced(true)
      clearCart()
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error.message || 'Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-slate-600 mb-2">Thank you for your purchase.</p>
            <p className="text-slate-600 mb-6">
              Order Number: <span className="font-semibold">{orderNumber}</span>
            </p>
            <p className="text-slate-500 mb-8">
              You will receive an email confirmation shortly with your order details and tracking information.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setCurrentPage('orders')} variant="outline">
                View Orders
              </Button>
              <Button onClick={() => setCurrentPage('shop')} className="bg-emerald-500 hover:bg-emerald-600">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h1>
          <Button onClick={() => setCurrentPage('shop')} className="bg-emerald-500 hover:bg-emerald-600">
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-emerald-400 mb-4"
            onClick={() => setCurrentPage('cart')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Cart
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
              }`}>
                1
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
              }`}>
                2
              </div>
              <span className="font-medium">Payment</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
              }`}>
                3
              </div>
              <span className="font-medium">Confirm</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" /> طريقة الاستلام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delivery Method Choice */}
                  <RadioGroup value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)} className="grid grid-cols-2 gap-4">
                    <div className={cn(
                        "flex items-center space-x-2 border-2 rounded-2xl p-4 cursor-pointer transition-all",
                        deliveryMethod === 'courier' ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 hover:border-slate-200"
                    )}>
                      <RadioGroupItem value="courier" id="courier" />
                      <Label htmlFor="courier" className="flex-1 cursor-pointer font-bold text-slate-700">توصيل للمنزل</Label>
                    </div>
                    <div className={cn(
                        "flex items-center space-x-2 border-2 rounded-2xl p-4 cursor-pointer transition-all",
                        deliveryMethod === 'pickup' ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 hover:border-slate-200"
                    )}>
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer font-bold text-slate-700">استلام من الفرع</Label>
                    </div>
                  </RadioGroup>

                  {deliveryMethod === 'pickup' ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <Label className="text-slate-500 font-medium">اختر الفرع المفضل للاستلام</Label>
                        {[
                            'القاهرة - وسط البلد',
                            'الإسكندرية - سموحة',
                            'الجيزة - الدقي'
                        ].map((branch) => (
                            <div 
                                key={branch}
                                onClick={() => setPickupBranch(branch)}
                                className={cn(
                                    "flex justify-between items-center p-4 border rounded-2xl cursor-pointer transition-all",
                                    pickupBranch === branch ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-100" : "hover:bg-slate-50 border-slate-100"
                                )}
                            >
                                <span className={cn("font-bold text-sm", pickupBranch === branch ? "text-emerald-700" : "text-slate-600")}>{branch}</span>
                                {pickupBranch === branch && <Shield className="h-4 w-4 text-emerald-500 fill-emerald-500" />}
                            </div>
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Input 
                      id="street" 
                      name="street" 
                      value={formData.street} 
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    </div>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-2xl font-bold shadow-lg shadow-emerald-100 mt-4"
                    onClick={() => setStep(2)}
                  >
                    متابعة لعملية الدفع
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-emerald-500">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>Credit / Debit Card</span>
                          <div className="flex gap-2">
                            <span className="text-blue-600 font-bold">VISA</span>
                            <span className="text-red-600 font-bold">MC</span>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-emerald-500">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>PayPal</span>
                          <span className="text-blue-600 font-bold">PayPal</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-emerald-500">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>Cash on Delivery</span>
                          <span className="text-emerald-600 font-bold">COD</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => setStep(3)}
                    >
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Summary */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Shipping Address</h4>
                    <p className="text-slate-600">
                      {formData.name}<br />
                      {formData.street}<br />
                      {formData.city}, {formData.state} {formData.zipCode}<br />
                      {formData.country}
                    </p>
                  </div>

                  <Separator />

                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-4">
                          <img
                            src={item.product.images[0] || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.product.name}</p>
                            <p className="text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-slate-600 truncate max-w-[200px]">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {shipping === 0 && (
                  <p className="text-emerald-600 text-sm text-center">
                    🎉 You've qualified for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
