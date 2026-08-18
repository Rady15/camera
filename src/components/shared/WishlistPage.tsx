'use client'

import { useEffect, useState } from 'react'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUIStore, useWishlistStore, useCartStore, Product } from '@/store'

export function WishlistPage() {
  const { setCurrentPage } = useUIStore()
  const { items, removeItem } = useWishlistStore()
  const { addItem } = useCartStore()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlistProducts()
  }, [items])

  const fetchWishlistProducts = async () => {
    if (items.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`/api/products?ids=${items.join(',')}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch wishlist products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
    removeItem(product.id)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-slate-300">
            {items.length} item{items.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="border-slate-200 overflow-hidden">
                <div className="relative aspect-square bg-slate-100">
                  <img
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-emerald-600 font-bold mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeItem(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 mb-6">
              Save items you love by clicking the heart icon on products.
            </p>
            <Button 
              onClick={() => setCurrentPage('shop')}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Browse Products
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
