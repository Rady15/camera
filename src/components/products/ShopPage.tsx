'use client'

import { useEffect, useState } from 'react'
import { Grid, List, ChevronDown, Check, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUIStore, Product } from '@/store'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useCartStore } from '@/store'
import { PromoBanners } from '@/components/home/PromoBanners'

interface Category {
  id: string
  name: string
  slug: string
}

// CCTV-specific brands
const brands = [
  { id: 'hikvision', name: 'HIKVISION', count: 163 },
  { id: 'dahua', name: 'DAHUA', count: 89 },
  { id: 'ezviz', name: 'EZVIZ', count: 45 },
  { id: 'tiandy', name: 'Tiandy', count: 32 },
  { id: 'uniview', name: 'Uniview', count: 28 },
  { id: 'hanwha', name: 'Hanwha Vision', count: 24 },
  { id: 'axis', name: 'Axis', count: 18 },
  { id: 'bosch', name: 'Bosch', count: 15 },
]

// CCTV-specific tags
const tagsFilters = [
  { id: 'available', nameAr: 'المنتجات المتاحة', nameEn: 'Available Products', count: 163 },
  { id: 'featured', nameAr: 'المنتجات المميزة', nameEn: 'Featured Products', count: 62 },
  { id: 'new', nameAr: 'منتجات جديدة', nameEn: 'New Products', count: 12 },
  { id: 'rated', nameAr: 'منتجات ذات تقييم عالي', nameEn: 'Highly Rated', count: 13 },
  { id: 'discount', nameAr: 'المنتجات ذات الخصومات الكبيرة', nameEn: 'Big Discounts', count: 76 },
]

// Resolution filters
const resolutionFilters = [
  { id: '2mp', name: '2MP (1080p)', count: 45 },
  { id: '4mp', name: '4MP (2K)', count: 38 },
  { id: '5mp', name: '5MP', count: 28 },
  { id: '8mp', name: '8MP (4K)', count: 22 },
  { id: '12mp', name: '12MP', count: 8 },
]

// Night vision types
const nightVisionFilters = [
  { id: 'ir', nameAr: 'أشعة تحت حمراء', nameEn: 'IR Night Vision', count: 85 },
  { id: 'colorvu', nameAr: 'ColorVu', nameEn: 'ColorVu', count: 42 },
  { id: 'starlight', nameAr: 'Starlight', nameEn: 'Starlight', count: 28 },
  { id: 'full-color', nameAr: 'ملون بالكامل', nameEn: 'Full Color', count: 15 },
]

// Feature filters
const featureFilters = [
  { id: 'poe', nameAr: 'PoE (طاقة عبر الإيثرنت)', nameEn: 'PoE (Power over Ethernet)', count: 78 },
  { id: 'wifi', nameAr: 'واي فاي', nameEn: 'WiFi', count: 56 },
  { id: 'audio', nameAr: 'صوت', nameEn: 'Audio', count: 45 },
  { id: 'two-way-audio', nameAr: 'صوت ثنائي الاتجاه', nameEn: 'Two-Way Audio', count: 32 },
  { id: 'sd-card', nameAr: 'دعم كارت ذاكرة', nameEn: 'SD Card Support', count: 68 },
  { id: 'outdoor', nameAr: 'للاستخدام الخارجي', nameEn: 'Outdoor Use', count: 92 },
  { id: 'ptz', nameAr: 'PTZ (تحريك ودوران)', nameEn: 'PTZ (Pan-Tilt-Zoom)', count: 24 },
]

// Smart detection filters
const smartDetectionFilters = [
  { id: 'human', nameAr: 'كشف البشر', nameEn: 'Human Detection', count: 85 },
  { id: 'vehicle', nameAr: 'كشف المركبات', nameEn: 'Vehicle Detection', count: 62 },
  { id: 'face', nameAr: 'كشف الوجوه', nameEn: 'Face Detection', count: 38 },
  { id: 'perimeter', nameAr: 'حماية المحيط', nameEn: 'Perimeter Protection', count: 45 },
  { id: 'line-crossing', nameAr: 'عبور خط', nameEn: 'Line Crossing', count: 52 },
  { id: 'intrusion', nameAr: 'اقتحام', nameEn: 'Intrusion Detection', count: 48 },
]

// Weather ratings
const weatherRatings = [
  { id: 'ip66', name: 'IP66', count: 65 },
  { id: 'ip67', name: 'IP67', count: 48 },
  { id: 'ip68', name: 'IP68', count: 12 },
  { id: 'ik10', name: 'IK10 (Vandal Proof)', count: 28 },
]

// Category names for display
const categoryNames: Record<string, { ar: string; en: string }> = {
  'ip-cameras': { ar: 'كاميرات IP', en: 'IP Cameras' },
  'analog-cameras': { ar: 'كاميرات AHD/Analog', en: 'AHD/Analog Cameras' },
  'nvr': { ar: 'مسجلات NVR', en: 'NVR Recorders' },
  'dvr': { ar: 'مسجلات DVR', en: 'DVR Recorders' },
  'wifi-cameras': { ar: 'كاميرات WiFi', en: 'WiFi Cameras' },
  'systems': { ar: 'أنظمة كاملة', en: 'Complete Systems' },
  'accessories': { ar: 'اكسسوارات', en: 'Accessories' },
  'cables': { ar: 'كابلات وموصلات', en: 'Cables & Connectors' },
  'storage': { ar: 'هارد ديسك', en: 'Hard Drives' },
  'monitors': { ar: 'شاشات عرض', en: 'Monitors' },
}

export function ShopPage() {
  const { searchQuery, setSearchQuery, setCurrentPage, setSelectedProductId, selectedCategory, setSelectedCategory } = useUIStore()
  const { addItem } = useCartStore()
  const { language, isRTL } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedNightVision, setSelectedNightVision] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedSmartDetection, setSelectedSmartDetection] = useState<string[]>([])
  const [selectedWeather, setSelectedWeather] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filterCounts, setFilterCounts] = useState({
    brands: {} as Record<string, number>,
    tags: {} as Record<string, number>,
    resolutions: {} as Record<string, number>,
    nightVision: {} as Record<string, number>,
    features: {} as Record<string, number>,
    smartDetection: {} as Record<string, number>,
    weatherRatings: {} as Record<string, number>,
  })

  useEffect(() => {
    fetchCategories()
    fetchAllProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [
    searchQuery, sortBy, selectedCategory, allProducts,
    selectedBrands, selectedResolutions, selectedFeatures, 
    selectedNightVision, selectedTags, selectedSmartDetection, 
    selectedWeather, priceMin, priceMax
  ])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...allProducts]

    // Category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?.slug === selectedCategory)
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      )
    }

    // Brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => {
        const b = typeof p.brand === 'string' ? p.brand : p.brand?.name
        return b && selectedBrands.includes(b.toLowerCase())
      })
    }

    // Resolutions
    if (selectedResolutions.length > 0) {
      filtered = filtered.filter(p => {
        const res = (p as any).resolution?.toLowerCase() || ''
        return selectedResolutions.some(r => res.includes(r))
      })
    }

    // Features
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter(p => {
        const feat = Array.isArray((p as any).features) ? (p as any).features : []
        return selectedFeatures.some(f => feat.includes(f))
      })
    }

    // Night Vision
    if (selectedNightVision.length > 0) {
      filtered = filtered.filter(p => {
        const nv = (p as any).nightVisionType?.toLowerCase() || ''
        return selectedNightVision.some(n => nv.includes(n))
      })
    }

    // Smart Detection
    if (selectedSmartDetection.length > 0) {
      filtered = filtered.filter(p => {
        const sd = Array.isArray((p as any).smartDetection) ? (p as any).smartDetection : []
        return selectedSmartDetection.some(s => sd.includes(s))
      })
    }

    // Weather
    if (selectedWeather.length > 0) {
      filtered = filtered.filter(p => {
        const wr = (p as any).weatherRating?.toLowerCase() || ''
        return selectedWeather.some(w => wr.includes(w))
      })
    }

    // Tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => {
        if (selectedTags.includes('available') && (!p.stock || p.stock <= 0)) return false
        if (selectedTags.includes('featured') && !p.featured) return false
        if (selectedTags.includes('new')) {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          if (new Date(p.createdAt) < thirtyDaysAgo) return false
        }
        if (selectedTags.includes('rated') && (!p.rating || p.rating < 4)) return false
        if (selectedTags.includes('discount') && (!p.comparePrice || p.comparePrice <= p.price)) return false
        return true
      })
    }

    // Price
    if (priceMin) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceMin))
    }
    if (priceMax) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceMax))
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'featured') {
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    setProducts(filtered)
    calculateFilterCounts(allProducts) // Keep counts relative to all products in category or globally
  }

  const fetchAllProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=1000')
      const data = await res.json()
      setAllProducts(data.products || [])
      calculateFilterCounts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch all products:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateFilterCounts = (productsList: Product[]) => {
    const brandCounts: Record<string, number> = {}
    const tagCounts: Record<string, number> = {
      available: 0,
      featured: 0,
      new: 0,
      rated: 0,
      discount: 0,
    }
    const resolutionCounts: Record<string, number> = {}
    const nightVisionCounts: Record<string, number> = {}
    const featureCounts: Record<string, number> = {}
    const smartDetectionCounts: Record<string, number> = {}
    const weatherRatingCounts: Record<string, number> = {}

    productsList.forEach((product: any) => {
      // Brand counts
      const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name;
      if (brandName) {
        const brandKey = brandName.toLowerCase()
        brandCounts[brandKey] = (brandCounts[brandKey] || 0) + 1
      }

      // Tag counts
      if (product.stock && product.stock > 0) tagCounts.available++
      if (product.featured) tagCounts.featured++
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (new Date(product.createdAt) >= thirtyDaysAgo) tagCounts.new++
      if (product.rating && product.rating >= 4) tagCounts.rated++
      if (product.comparePrice && product.price && product.comparePrice > product.price) tagCounts.discount++

      // Resolution counts
      if (product.resolution) {
        const resKey = product.resolution.toLowerCase()
        if (resKey.includes('2mp') || resKey.includes('1080')) resolutionCounts['2mp'] = (resolutionCounts['2mp'] || 0) + 1
        else if (resKey.includes('4mp') || resKey.includes('2k')) resolutionCounts['4mp'] = (resolutionCounts['4mp'] || 0) + 1
        else if (resKey.includes('5mp')) resolutionCounts['5mp'] = (resolutionCounts['5mp'] || 0) + 1
        else if (resKey.includes('8mp') || resKey.includes('4k')) resolutionCounts['8mp'] = (resolutionCounts['8mp'] || 0) + 1
        else if (resKey.includes('12mp')) resolutionCounts['12mp'] = (resolutionCounts['12mp'] || 0) + 1
      }

      // Night vision counts
      if (product.nightVisionType) {
        const nvKey = product.nightVisionType.toLowerCase()
        if (nvKey.includes('ir') || nvKey.includes('infrared')) nightVisionCounts['ir'] = (nightVisionCounts['ir'] || 0) + 1
        if (nvKey.includes('colorvu') || nvKey.includes('color')) nightVisionCounts['colorvu'] = (nightVisionCounts['colorvu'] || 0) + 1
        if (nvKey.includes('starlight')) nightVisionCounts['starlight'] = (nightVisionCounts['starlight'] || 0) + 1
        if (nvKey.includes('full')) nightVisionCounts['full-color'] = (nightVisionCounts['full-color'] || 0) + 1
      }

      // Feature counts
      if (product.features) {
        const features = Array.isArray(product.features) ? product.features : []
        if (features.includes('poe') || features.includes('PoE')) featureCounts['poe'] = (featureCounts['poe'] || 0) + 1
        if (features.includes('wifi') || features.includes('WiFi')) featureCounts['wifi'] = (featureCounts['wifi'] || 0) + 1
        if (features.includes('audio')) featureCounts['audio'] = (featureCounts['audio'] || 0) + 1
        if (features.includes('two-way-audio')) featureCounts['two-way-audio'] = (featureCounts['two-way-audio'] || 0) + 1
        if (features.includes('sd-card')) featureCounts['sd-card'] = (featureCounts['sd-card'] || 0) + 1
        if (features.includes('outdoor')) featureCounts['outdoor'] = (featureCounts['outdoor'] || 0) + 1
        if (features.includes('ptz')) featureCounts['ptz'] = (featureCounts['ptz'] || 0) + 1
      }

      // Smart detection counts
      if (product.smartDetection) {
        const sd = Array.isArray(product.smartDetection) ? product.smartDetection : []
        if (sd.includes('human') || sd.includes('person')) smartDetectionCounts['human'] = (smartDetectionCounts['human'] || 0) + 1
        if (sd.includes('vehicle')) smartDetectionCounts['vehicle'] = (smartDetectionCounts['vehicle'] || 0) + 1
        if (sd.includes('face')) smartDetectionCounts['face'] = (smartDetectionCounts['face'] || 0) + 1
        if (sd.includes('perimeter')) smartDetectionCounts['perimeter'] = (smartDetectionCounts['perimeter'] || 0) + 1
        if (sd.includes('line-crossing')) smartDetectionCounts['line-crossing'] = (smartDetectionCounts['line-crossing'] || 0) + 1
        if (sd.includes('intrusion')) smartDetectionCounts['intrusion'] = (smartDetectionCounts['intrusion'] || 0) + 1
      }

      // Weather rating counts
      if (product.weatherRating) {
        const wr = product.weatherRating.toLowerCase()
        if (wr.includes('ip66')) weatherRatingCounts['ip66'] = (weatherRatingCounts['ip66'] || 0) + 1
        if (wr.includes('ip67')) weatherRatingCounts['ip67'] = (weatherRatingCounts['ip67'] || 0) + 1
        if (wr.includes('ip68')) weatherRatingCounts['ip68'] = (weatherRatingCounts['ip68'] || 0) + 1
        if (wr.includes('ik10')) weatherRatingCounts['ik10'] = (weatherRatingCounts['ik10'] || 0) + 1
      }
    })

    setFilterCounts({
      brands: brandCounts,
      tags: tagCounts,
      resolutions: resolutionCounts,
      nightVision: nightVisionCounts,
      features: featureCounts,
      smartDetection: smartDetectionCounts,
      weatherRatings: weatherRatingCounts,
    })
  }

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }

  const toggleResolution = (resId: string) => {
    setSelectedResolutions(prev => 
      prev.includes(resId)
        ? prev.filter(id => id !== resId)
        : [...prev, resId]
    )
  }

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedBrands([])
    setSelectedResolutions([])
    setSelectedFeatures([])
    setSelectedNightVision([])
    setSelectedTags([])
    setSelectedSmartDetection([])
    setSelectedWeather([])
    setPriceMin('')
    setPriceMax('')
    setSortBy('featured')
  }

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId)
    setCurrentPage('product')
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    addItem(product, 1)
  }

  const getCategoryName = () => {
    if (!selectedCategory) {
      return language === 'ar' ? 'جميع المنتجات' : 'All Products'
    }
    return language === 'ar' 
      ? categoryNames[selectedCategory]?.ar || selectedCategory
      : categoryNames[selectedCategory]?.en || selectedCategory
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => setCurrentPage('home')} className="hover:text-[#1a237e]">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>
            <span>/</span>
            <span className="text-[#1a237e] font-medium">
              {getCategoryName()}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className={`flex gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Products Grid - Left Side */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-slate-600">
                  <span className="font-bold text-slate-900">{products.length}</span>
                  {' '}{language === 'ar' ? 'منتج' : 'products'}
                </p>
                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 bg-white border-slate-300">
                      <SelectValue placeholder={language === 'ar' ? 'ترتيب حسب' : 'Sort by'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">{language === 'ar' ? 'الأكثر مبيعاً' : 'Best Selling'}</SelectItem>
                      <SelectItem value="newest">{language === 'ar' ? 'الأحدث' : 'Newest'}</SelectItem>
                      <SelectItem value="price-asc">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</SelectItem>
                      <SelectItem value="price-desc">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Mobile Filter Button */}
                  <Button 
                    variant="outline" 
                    className="lg:hidden"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4 ml-2" />
                    {language === 'ar' ? 'فلترة' : 'Filter'}
                  </Button>
                  
                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
                    <button
                      className={`p-2 ${view === 'grid' ? 'bg-[#1a237e] text-white' : 'bg-white text-slate-600'}`}
                      onClick={() => setView('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-2 ${view === 'list' ? 'bg-[#1a237e] text-white' : 'bg-white text-slate-600'}`}
                      onClick={() => setView('list')}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid - 4 Columns */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={
                view === 'grid'
                  ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-4'
              }>
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-50">
                      <img
                        src={product.images?.[0] || `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&sat=-100&seed=${product.id}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Discount Badge */}
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                          {language === 'ar' ? 'تخفيض!' : 'Sale!'}
                        </span>
                      )}
                      {/* Featured Badge */}
                      {product.featured && (
                        <span className="absolute top-2 left-2 bg-yellow-500 text-slate-900 text-xs px-2 py-1 rounded font-bold">
                          {language === 'ar' ? 'مميز' : 'Featured'}
                        </span>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3 text-right">
                      {/* Brand */}
                      <p className="text-xs text-slate-500 mb-1 font-medium">HIKVISION</p>
                      
                      {/* Title */}
                      <h3 className="text-sm text-slate-800 mb-2 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-lg font-bold text-[#1a237e]">
                          {product.price.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-slate-400 line-through">
                            {product.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {/* Availability */}
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Check className="h-4 w-4" />
                        <span>{language === 'ar' ? 'متوفر' : 'In Stock'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-slate-500 text-lg">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </main>

          {/* Sidebar Filters - Right Side */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm sticky top-20">
              {/* Filter Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">
                    {language === 'ar' ? 'الفلترة' : 'Filter'}
                  </h3>
                  <span className="text-sm text-slate-500">
                    ({products.length} {language === 'ar' ? 'منتج' : 'products'})
                  </span>
                </div>
              </div>

              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <Accordion type="multiple" defaultValue={['tags', 'brand', 'resolution', 'features']} className="w-full">
                  {/* Tags/Availability */}
                  <AccordionItem value="tags" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'حالة المنتج' : 'Product Status'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {tagsFilters.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              setSelectedTags(prev => 
                                prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                              )
                            }}
                            className={`flex items-center justify-between w-full text-sm py-1 transition-colors ${
                              selectedTags.includes(tag.id) ? 'text-[#1a237e] font-bold' : 'text-slate-600 hover:text-[#1a237e]'
                            }`}
                          >
                            <div className="flex items-center">
                              {selectedTags.includes(tag.id) && <Check className="h-3 w-3 mr-1" />}
                              <span>{language === 'ar' ? tag.nameAr : tag.nameEn}</span>
                            </div>
                            <span className="text-slate-400">({filterCounts.tags[tag.id] || 0})</span>
                          </button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Brand */}
                  <AccordionItem value="brand" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'العلامات التجارية' : 'Brands'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {brands.map((brand) => (
                          <div key={brand.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={brand.id}
                                checked={selectedBrands.includes(brand.id)}
                                onCheckedChange={() => toggleBrand(brand.id)}
                              />
                              <Label htmlFor={brand.id} className="text-sm text-slate-600 cursor-pointer">
                                {brand.name}
                              </Label>
                            </div>
                            <span className="text-xs text-slate-400">({filterCounts.brands[brand.id] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Resolution */}
                  <AccordionItem value="resolution" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'الدقة' : 'Resolution'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {resolutionFilters.map((res) => (
                          <div key={res.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={res.id}
                                checked={selectedResolutions.includes(res.id)}
                                onCheckedChange={() => toggleResolution(res.id)}
                              />
                              <Label htmlFor={res.id} className="text-sm text-slate-600 cursor-pointer">
                                {res.name}
                              </Label>
                            </div>
                            <span className="text-xs text-slate-400">({filterCounts.resolutions[res.id] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Night Vision */}
                  <AccordionItem value="nightVision" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'الرؤية الليلية' : 'Night Vision'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {nightVisionFilters.map((nv) => (
                          <div key={nv.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={nv.id} 
                                checked={selectedNightVision.includes(nv.id)}
                                onCheckedChange={() => setSelectedNightVision(prev => 
                                  prev.includes(nv.id) ? prev.filter(id => id !== nv.id) : [...prev, nv.id]
                                )}
                              />
                              <Label htmlFor={nv.id} className="text-sm text-slate-600 cursor-pointer">
                                {language === 'ar' ? nv.nameAr : nv.nameEn}
                              </Label>
                            </div>
                            <span className="text-xs text-slate-400">({filterCounts.nightVision[nv.id] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Features */}
                  <AccordionItem value="features" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'الميزات' : 'Features'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {featureFilters.map((feature) => (
                          <div key={feature.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={feature.id}
                                checked={selectedFeatures.includes(feature.id)}
                                onCheckedChange={() => toggleFeature(feature.id)}
                              />
                              <Label htmlFor={feature.id} className="text-sm text-slate-600 cursor-pointer">
                                {language === 'ar' ? feature.nameAr : feature.nameEn}
                              </Label>
                            </div>
                            <span className="text-xs text-slate-400">({filterCounts.features[feature.id] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Smart Detection */}
                  <AccordionItem value="smartDetection" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'الكشف الذكي' : 'Smart Detection'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {smartDetectionFilters.map((sd) => (
                          <div key={sd.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={sd.id} 
                                checked={selectedSmartDetection.includes(sd.id)}
                                onCheckedChange={() => setSelectedSmartDetection(prev => 
                                  prev.includes(sd.id) ? prev.filter(id => id !== sd.id) : [...prev, sd.id]
                                )}
                              />
                              <Label htmlFor={sd.id} className="text-sm text-slate-600 cursor-pointer">
                                {language === 'ar' ? sd.nameAr : sd.nameEn}
                              </Label>
                            </div>
                            <span className="text-xs text-slate-400">({filterCounts.smartDetection[sd.id] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Weather Rating */}
                  <AccordionItem value="weather" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'مقاومة الطقس' : 'Weather Rating'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {weatherRatings.map((wr) => (
                          <div key={wr.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={wr.id} 
                                checked={selectedWeather.includes(wr.id)}
                                onCheckedChange={() => setSelectedWeather(prev => 
                                  prev.includes(wr.id) ? prev.filter(id => id !== wr.id) : [...prev, wr.id]
                                )}
                              />
                              <Label htmlFor={wr.id} className="text-sm text-slate-600 cursor-pointer">
                                {wr.name}
                              </Label>
                            </div>
                            <span className="text-xs text-slate-400">({filterCounts.weatherRatings[wr.id] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Price */}
                  <AccordionItem value="price" className="border-b">
                    <AccordionTrigger className="text-sm font-semibold text-slate-700 hover:no-underline py-3">
                      {language === 'ar' ? 'السعر' : 'Price'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center gap-2 pt-2">
                        <Input
                          type="number"
                          placeholder={language === 'ar' ? 'من' : 'Min'}
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="text-sm"
                        />
                        <span className="text-slate-400">-</span>
                        <Input
                          type="number"
                          placeholder={language === 'ar' ? 'إلى' : 'Max'}
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Clear Filters Button */}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={clearFilters}
                >
                  {language === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                </Button>

                {/* Side Banner Ads */}
                <div className="mt-8">
                  <PromoBanners position="side" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">{language === 'ar' ? 'الفلترة' : 'Filter'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              {/* Mobile filters content - simplified */}
              <div className="space-y-4">
                {/* Brands */}
                <div>
                  <h4 className="font-semibold mb-2">{language === 'ar' ? 'العلامات التجارية' : 'Brands'}</h4>
                  <div className="space-y-2">
                    {brands.slice(0, 5).map((brand) => (
                      <div key={brand.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`mobile-${brand.id}`}
                          checked={selectedBrands.includes(brand.id)}
                          onCheckedChange={() => toggleBrand(brand.id)}
                        />
                        <Label htmlFor={`mobile-${brand.id}`} className="text-sm">{brand.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-2">{language === 'ar' ? 'الميزات' : 'Features'}</h4>
                  <div className="space-y-2">
                    {featureFilters.slice(0, 5).map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`mobile-${feature.id}`}
                          checked={selectedFeatures.includes(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                        <Label htmlFor={`mobile-${feature.id}`} className="text-sm">
                          {language === 'ar' ? feature.nameAr : feature.nameEn}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-2">{language === 'ar' ? 'السعر' : 'Price'}</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={language === 'ar' ? 'من' : 'Min'}
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="text-sm"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder={language === 'ar' ? 'إلى' : 'Max'}
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button className="w-full bg-[#1a237e]" onClick={() => setShowMobileFilters(false)}>
                  {language === 'ar' ? 'تطبيق الفلترة' : 'Apply Filters'}
                </Button>
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
