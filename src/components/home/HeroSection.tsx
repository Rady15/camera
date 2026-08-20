'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Shield, Wifi, Video, Eye, Moon, ArrowLeft, Search, Grid, List, ChevronDown, Star, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { useUIStore, useCartStore } from '@/store'
import { useLanguage } from '@/components/providers/LanguageProvider'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { useToast } from '@/hooks/use-toast'

// Camera images for the slider
const cameraSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=500&fit=crop',
    titleAr: 'أمان فائق الدقة 4K',
    titleEn: '4K Ultra HD Security',
    subtitleAr: 'مراقبة واضحة تماماً',
    subtitleEn: 'Crystal Clear Monitoring',
    badgeAr: 'الأكثر مبيعاً',
    badgeEn: 'Best Seller',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&h=500&fit=crop',
    titleAr: 'كاميرا الرؤية الليلية',
    titleEn: 'Night Vision Pro',
    subtitleAr: 'رؤية في الظلام الدامس',
    subtitleEn: 'See in Complete Darkness',
    badgeAr: 'وصل حديثاً',
    badgeEn: 'New Arrival',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&h=500&fit=crop',
    titleAr: 'كاميرا واي فاي ذكية',
    titleEn: 'Smart WiFi Camera',
    subtitleAr: 'مراقبة من أي مكان',
    subtitleEn: 'Monitor from Anywhere',
    badgeAr: 'مميز',
    badgeEn: 'Popular',
  },
]

// Mock products matching the design
const products = [
  {
    id: '1',
    name: 'كاميرا HIKVISION ثابتة داخلي 2 ميجا بكسل DS-2CE16D0T-ITPF',
    brand: 'HIKVISION',
    price: 775,
    originalPrice: 1005,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    inStock: true,
    discount: 230,
    rating: 4.5,
    reviews: 128,
  },
  {
    id: '2',
    name: 'كاميرا HIKVISION ثابتة خارجي 2 ميجا بكسل DS-2CE16D0T-ITPF',
    brand: 'HIKVISION',
    price: 995,
    originalPrice: 1195,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',
    inStock: true,
    discount: 200,
    rating: 4.8,
    reviews: 95,
  },
  {
    id: '3',
    name: 'كاميرا HIKVISION ثابتة داخلي 4 ميجا بكسل DS-2CE16D0T-ITPF',
    brand: 'HIKVISION',
    price: 1150,
    originalPrice: 1350,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=400&fit=crop',
    inStock: true,
    discount: 200,
    rating: 4.7,
    reviews: 67,
  },
  {
    id: '4',
    name: 'كاميرا HIKVISION دوم داخلي 2 ميجا بكسل DS-2CE56D0T-ITPF',
    brand: 'HIKVISION',
    price: 850,
    originalPrice: 1050,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&h=400&fit=crop',
    inStock: true,
    discount: 200,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: '5',
    name: 'كاميرا HIKVISION ثابتة خارجي 4 ميجا بكسل DS-2CE16D0T-LP',
    brand: 'HIKVISION',
    price: 1250,
    originalPrice: 1450,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
    inStock: true,
    discount: 200,
    rating: 4.9,
    reviews: 156,
  },
  {
    id: '6',
    name: 'كاميرا HIKVISION PTZ خارجي 2 ميجا بكسل DS-2DE2A404IW-DE',
    brand: 'HIKVISION',
    price: 2250,
    originalPrice: 2550,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    inStock: true,
    discount: 300,
    rating: 4.8,
    reviews: 42,
  },
  {
    id: '7',
    name: 'كاميرا HIKVISION ColorVu داخلي 2 ميجا بكسل DS-2CE12DF0T-F',
    brand: 'HIKVISION',
    price: 1350,
    originalPrice: 1550,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop',
    inStock: true,
    discount: 200,
    rating: 4.7,
    reviews: 73,
  },
  {
    id: '8',
    name: 'كاميرا HIKVISION ColorVu خارجي 4 ميجا بكسل DS-2CE16D0T-L',
    brand: 'HIKVISION',
    price: 1750,
    originalPrice: 1950,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=400&fit=crop',
    inStock: false,
    discount: 200,
    rating: 4.9,
    reviews: 38,
  },
]

const brands = [
  { name: 'HIKVISION', count: 163 },
  { name: 'Dahua', count: 45 },
  { name: 'EZVIZ', count: 32 },
  { name: 'Tiandy', count: 28 },
  { name: 'Uniview', count: 22 },
]

export function HeroSection() {
  const { setCurrentPage } = useUIStore()
  const { language, isRTL } = useLanguage()
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners?position=hero')
        const data = await res.json()
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners)
        } else {
          // Fallback to defaults
          setBanners(cameraSlides.map(s => ({
            id: s.id,
            image: s.image,
            title: language === 'ar' ? s.titleAr : s.titleEn,
            description: language === 'ar' ? s.subtitleAr : s.subtitleEn,
            buttonText: 'تسوق الآن'
          })))
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [language])

  const onSelect = () => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    setCount(api.scrollSnapList().length)
  }

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  return (
    <section className="relative bg-[#f5f5f5] overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
          direction: isRTL ? 'rtl' : 'ltr',
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            direction: isRTL ? 'rtl' : 'ltr',
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((slide) => (
            <CarouselItem key={slide.id}>
              <div 
                className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] cursor-pointer"
                onClick={() => slide.link && (window.location.href = slide.link)}
              >
                <img
                  src={slide.image}
                  alt={slide.title || 'Hero Banner'}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/10 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-xl text-white text-right" dir="rtl">
                      {slide.title && (
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg leading-tight">
                          {slide.title}
                        </h2>
                      )}
                      {slide.description && (
                        <p className="text-lg md:text-2xl text-white/90 mb-8 drop-shadow-md max-w-md mr-0 ml-auto">
                          {slide.description}
                        </p>
                      )}
                      <Button 
                        size="lg" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-10 h-14 text-xl rounded-full shadow-xl transition-all hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slide.link) window.location.href = slide.link;
                          else setCurrentPage('shop');
                        }}
                      >
                        {slide.buttonText || 'تسوق الآن'}
                        <ArrowLeft className="mr-3 h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Slider Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index ? 'bg-yellow-500 w-12' : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

// Product Card Component
function ProductCard({ product }: { product: typeof products[0] }) {
  const { addToCart } = useCartStore()
  const { toast } = useToast()
  const { language } = useLanguage()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: 10,
    })
    toast({
      title: language === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart',
      description: product.name,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            خصم {product.discount} ريال
          </div>
        )}
        {/* Wishlist Button */}
        <button className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-colors">
          <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3" dir="rtl">
        {/* Brand */}
        <p className="text-xs text-[#1a237e] font-bold mb-1">{product.brand}</p>
        
        {/* Title */}
        <h3 className="text-sm text-gray-800 line-clamp-2 h-10 mb-2 leading-5">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-red-600">{product.price.toLocaleString()} ريال</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {product.originalPrice.toLocaleString()} ريال
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1 mb-3">
          <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
            {product.inStock ? 'متوفر' : 'غير متوفر'}
          </span>
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-[#1a237e] hover:bg-[#283593] text-white text-sm"
        >
          <ShoppingCart className="h-4 w-4 ml-2" />
          أضف للسلة
        </Button>
      </div>
    </div>
  )
}

// Filter Sidebar
function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <aside className="bg-white rounded-lg shadow-sm p-4" dir="rtl">
      <h3 className="text-lg font-bold text-[#1a237e] mb-4 pb-2 border-b">الفلترة</h3>
      
      {/* Brands */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">العلامات التجارية</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand.name} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
              <div className="flex items-center gap-2">
                <Checkbox id={brand.name} />
                <span className="text-sm text-gray-700">{brand.name}</span>
              </div>
              <span className="text-xs text-gray-400">({brand.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">السعر</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={5000}
          step={50}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{priceRange[0]} ريال</span>
          <span>{priceRange[1]} ريال</span>
        </div>
      </div>

      {/* Shipping */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">الشحن</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <Checkbox id="free-shipping" />
            <span className="text-sm text-gray-700">شحن مجاني</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <Checkbox id="fast-shipping" />
            <span className="text-sm text-gray-700">شحن سريع</span>
          </label>
        </div>
      </div>

      {/* Stock */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">المخزون</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <Checkbox id="in-stock" />
            <span className="text-sm text-gray-700">متوفر فقط</span>
          </label>
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">الميزات</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <Checkbox id="night-vision" />
            <span className="text-sm text-gray-700">رؤية ليلية</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <Checkbox id="wifi" />
            <span className="text-sm text-gray-700">واي فاي</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
            <Checkbox id="4k" />
            <span className="text-sm text-gray-700">دقة 4K</span>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold">
        تطبيق الفلترة
      </Button>
    </aside>
  )
}

// Main Products Section
export function ProductsSection() {
  const { setCurrentPage } = useUIStore()
  const { language } = useLanguage()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')

  return (
    <section className="bg-[#f5f5f5] py-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm" dir="rtl">
          <ol className="flex items-center gap-2 text-gray-500">
            <li>
              <button onClick={() => setCurrentPage('home')} className="hover:text-[#1a237e]">
                الرئيسية
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => setCurrentPage('shop')} className="hover:text-[#1a237e]">
                كاميرات المراقبة
              </button>
            </li>
            <li>/</li>
            <li className="text-[#1a237e]">HIKVISION</li>
          </ol>
        </nav>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex items-center justify-between" dir="rtl">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  عرض <strong className="text-gray-800">{products.length}</strong> منتج
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">ترتيب حسب:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="featured">الأكثر مبيعاً</option>
                    <option value="price-low">السعر: من الأقل للأعلى</option>
                    <option value="price-high">السعر: من الأعلى للأقل</option>
                    <option value="newest">الأحدث</option>
                    <option value="rating">الأعلى تقييماً</option>
                  </select>
                </div>
                {/* View Mode */}
                <div className="flex items-center border rounded overflow-hidden">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#1a237e] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 ${viewMode === 'list' ? 'bg-[#1a237e] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More */}
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                className="border-[#1a237e] text-[#1a237e] hover:bg-[#1a237e] hover:text-white"
              >
                عرض المزيد من المنتجات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Strip
export function FeaturesStrip() {
  const features = [
    { icon: '🚚', titleAr: 'شحن مجاني', titleEn: 'Free Shipping', descAr: 'للطلبات فوق 500 ريال', descEn: 'Orders over 500 SAR' },
    { icon: '🛡️', titleAr: 'ضمان سنتين', titleEn: '2 Year Warranty', descAr: 'على جميع المنتجات', descEn: 'On all products' },
    { icon: '📞', titleAr: 'دعم فني', titleEn: 'Technical Support', descAr: '24/7 خدمة العملاء', descEn: '24/7 Customer Service' },
    { icon: '🔧', titleAr: 'تركيب مجاني', titleEn: 'Free Installation', descAr: 'في القاهرة والجيزة', descEn: 'In Cairo & Giza' },
  ]

  return (
    <section className="bg-[#1a237e] py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-white">
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <p className="font-bold">{feature.titleAr}</p>
                <p className="text-xs text-white/70">{feature.descAr}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
