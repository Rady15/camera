'use client'

import { useEffect, useState } from 'react'
import { Heart, ShoppingCart, Minus, Plus, Share2, Check, Truck, Shield, RotateCcw, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUIStore, useCartStore, useWishlistStore, Product } from '@/store'
import { ProductCard } from './ProductCard'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProductDetailPage() {
  const { selectedProductId, setCurrentPage } = useUIStore()
  const { addItem } = useCartStore()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  
  const { user } = useAuthStore()
  const { toast } = useToast()
  
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState<any>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', title: '' })

  useEffect(() => {
    if (selectedProductId) {
      fetchProduct()
    }
  }, [selectedProductId])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${selectedProductId}`)
      const data = await res.json()
      setProduct(data.product)
      
      // Fetch related products
      if (data.product?.categoryId) {
        const relatedRes = await fetch(`/api/products?categoryId=${data.product.categoryId}&limit=4`)
        const relatedData = await relatedRes.json()
        setRelatedProducts((relatedData.products || []).filter((p: Product) => p.id !== selectedProductId))
      }
      
      fetchReviews()
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const res = await fetch(`/api/reviews?productId=${selectedProductId}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setReviewStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: 'Please login to review', variant: 'destructive' })
      return
    }

    setSubmittingReview(true)
    try {
      const { token } = useAuthStore.getState()
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProductId,
          ...reviewForm
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Review submitted successfully!' })
        setReviewForm({ rating: 5, comment: '', title: '' })
        fetchReviews()
        fetchProduct() // Update average rating
      } else {
        let errorMessage = data.error
        if (data.code === 'VALIDATION_ERROR' && data.details?.[0]) {
          errorMessage = data.details[0].message
        } else if (data.code === 'ALREADY_REVIEWED') {
          errorMessage = 'لقد قمت بتقييم هذا المنتج من قبل'
        }
        
        toast({ 
          title: 'Error Submitting Review', 
          description: errorMessage, 
          variant: 'destructive' 
        })
      }
    } catch (error) {
      toast({ title: 'Failed to submit review', variant: 'destructive' })
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity)
      setCurrentPage('checkout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-24 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500">Product not found</p>
          <Button className="mt-4" onClick={() => setCurrentPage('shop')}>
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-slate-50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => setCurrentPage('home')} className="hover:text-emerald-600">Home</button>
            <span>/</span>
            <button onClick={() => setCurrentPage('shop')} className="hover:text-emerald-600">Shop</button>
            <span>/</span>
            <span className="text-slate-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-lg px-3 py-1">
                  -{discountPercentage}%
                </Badge>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-emerald-500' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <Badge variant="outline" className="text-emerald-600 border-emerald-600">
              {product.category.name}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-600">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-slate-400 line-through">
                  ${product.comparePrice!.toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-slate-600">
              {product.description.substring(0, 200)}...
            </p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="h-5 w-5 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">In Stock</span>
                  <span className="text-slate-500">({product.stock} available)</span>
                </>
              ) : (
                <>
                  <span className="text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {added ? (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y">
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-900">Free Shipping</p>
                  <p className="text-sm text-slate-500">Orders over $99</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-900">2 Year Warranty</p>
                  <p className="text-sm text-slate-500">Full coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-6 w-6 text-emerald-500" />
                <div>
                  <p className="font-medium text-slate-900">30 Day Returns</p>
                  <p className="text-sm text-slate-500">Easy returns</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4">
              <span className="text-slate-600">Share:</span>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none text-slate-600">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="bg-slate-50 rounded-lg p-6">
                {product.specifications ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-slate-200">
                        <span className="font-medium text-slate-700">{key}</span>
                        <span className="text-slate-600">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No specifications available.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Review Stats */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">Customer Reviews</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-slate-900">{reviewStats?.averageRating || product.rating.toFixed(1)}</div>
                    <div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(reviewStats?.averageRating || product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-slate-500">Based on {reviewStats?.totalReviews || product.reviewCount} reviews</p>
                    </div>
                  </div>

                  {/* Rating Progress Bars */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewStats?.ratingDistribution?.[star] || 0
                      const total = reviewStats?.totalReviews || product.reviewCount || 1
                      const percentage = (count / total) * 100
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="w-12 text-sm text-slate-600">{star} stars</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-8 text-sm text-slate-400">{count}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add Review Form */}
                  <Separator />
                  <div className="space-y-4 pt-4">
                    <h4 className="font-bold text-slate-800">Add a Review</h4>
                    {user ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="focus:outline-none"
                              >
                                <Star className={`h-6 w-6 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Review Comment</Label>
                          <Textarea
                            placeholder="Tell us what you think about this product..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            required
                            className="min-h-[100px]"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-2 px-4 rounded"
                          disabled={submittingReview}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <p className="text-slate-600 mb-3">Please login to write a review</p>
                        <Button variant="outline" onClick={() => setCurrentPage('login')}>Login Now</Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review List */}
                <div className="lg:col-span-2 space-y-6">
                  {reviewsLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-50 rounded-lg" />
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-slate-50 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                                {review.user?.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{review.user?.name || 'Customer'}</p>
                              <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                        {review.isVerified && (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-600 text-xs">
                            <Check className="h-3 w-3 mr-1" /> Verified Purchase
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-lg">
                      <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
