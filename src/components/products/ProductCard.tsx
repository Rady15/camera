'use client'

import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore, useWishlistStore, useUIStore, Product } from '@/store'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const { setCurrentPage, setSelectedProductId } = useUIStore()

  const inWishlist = isInWishlist(product.id)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) 
    : 0

  const handleViewProduct = () => {
    setSelectedProductId(product.id)
    setCurrentPage('product')
  }

  return (
    <Card className="group relative overflow-hidden border-slate-200 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <Badge className="bg-red-500 hover:bg-red-600">
              -{discountPercentage}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              Featured
            </Badge>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 hover:bg-orange-600">
              Low Stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="bg-slate-500">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white shadow-md"
            onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white shadow-md"
            onClick={handleViewProduct}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
          <Button 
            className="w-full bg-emerald-500 hover:bg-emerald-600"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        {/* Category */}
        <p className="text-xs text-emerald-600 font-medium mb-1">{product.category.name}</p>
        
        {/* Name */}
        <h3 
          className="font-semibold text-slate-900 mb-2 line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors"
          onClick={handleViewProduct}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              ${product.comparePrice!.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
