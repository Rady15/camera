'use client'

import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore, useCartStore } from '@/store'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

export function CartSidebar() {
  const { isCartOpen, setIsCartOpen, setCurrentPage } = useUIStore()
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCartStore()

  const handleCheckout = () => {
    setIsCartOpen(false)
    setCurrentPage('checkout')
  }

  const handleContinueShopping = () => {
    setIsCartOpen(false)
    setCurrentPage('shop')
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Your cart is empty</h3>
            <p className="text-slate-500 mb-6">Add some security cameras to get started!</p>
            <Button onClick={handleContinueShopping} className="bg-emerald-500 hover:bg-emerald-600">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-white rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 text-sm line-clamp-2">
                      {item.product.name}
                    </h4>
                    <p className="text-emerald-600 font-semibold mt-1">
                      ${item.product.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span>{totalPrice >= 99 ? 'Free' : '$9.99'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${(totalPrice >= 99 ? totalPrice : totalPrice + 9.99).toFixed(2)}</span>
                </div>
              </div>

              {totalPrice < 99 && (
                <p className="text-sm text-emerald-600 text-center">
                  Add ${(99 - totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}

              <div className="grid gap-2">
                <Button 
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
