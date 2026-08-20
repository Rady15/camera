'use client'

import { HeroSection } from '@/components/home/HeroSection'
import { PromoBanners } from '@/components/home/PromoBanners'
import { ArrowLeft, ArrowRight, Shield, Zap, Truck, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store'
import { useLanguage } from '@/components/providers/LanguageProvider'

// Features Strip for Home
export function HomeFeaturesStrip() {
  const { language } = useLanguage()
  const features = [
    {
      icon: Truck,
      titleAr: 'شحن مجاني',
      titleEn: 'Free Shipping',
      descAr: 'للطلبات فوق 500 ريال',
      descEn: 'Orders over 500 SAR',
    },
    {
      icon: Zap,
      titleAr: 'تركيب سريع',
      titleEn: 'Fast Installation',
      descAr: 'خدمة تركيب احترافية',
      descEn: 'Professional installation',
    },
    {
      icon: Shield,
      titleAr: 'ضمان سنتين',
      titleEn: '2 Year Warranty',
      descAr: 'على جميع المنتجات',
      descEn: 'On all products',
    },
    {
      icon: Headphones,
      titleAr: 'دعم فني 24/7',
      titleEn: '24/7 Support',
      descAr: 'خدمة عملاء متميزة',
      descEn: 'Excellent customer service',
    },
  ]

  return (
    <section className="bg-[#1a237e] py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 text-white">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <feature.icon className="h-6 w-6 text-slate-900" />
              </div>
              <div>
                <p className="font-semibold">
                  {language === 'ar' ? feature.titleAr : feature.titleEn}
                </p>
                <p className="text-sm text-white/70">
                  {language === 'ar' ? feature.descAr : feature.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  const { setCurrentPage } = useUIStore()
  const { language, isRTL } = useLanguage()

  return (
    <div className="space-y-0">
      {/* Hero Slider - Database Driven */}
      <HeroSection />

      {/* Features Strip */}
      <HomeFeaturesStrip />

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#1a237e] mb-6 text-right">
            {language === 'ar' ? 'تصفح حسب الفئة' : 'Browse by Category'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { 
                nameAr: 'كاميرات داخلية', 
                nameEn: 'Indoor Cameras', 
                image: '/assets/home/كاميرات داخلية.png' 
              },
              { 
                nameAr: 'كاميرات خارجية', 
                nameEn: 'Outdoor Cameras', 
                image: '/assets/home/كاميرات خارجية.png' 
              },
              { 
                nameAr: 'كاميرات لاسلكية', 
                nameEn: 'WiFi Cameras', 
                image: '/assets/home/كاميرات لاسلكية.png' 
              },
              { 
                nameAr: 'أجهزة التسجيل', 
                nameEn: 'NVR Systems', 
                image: '/assets/home/أجهزة التسجيل.png' 
              },
              { 
                nameAr: 'الإكسسوارات', 
                nameEn: 'Accessories', 
                image: '/assets/home/الإكسسوارات.png' 
              },
              { 
                nameAr: 'العروض', 
                nameEn: 'Offers', 
                image: '/assets/home/العروض.png' 
              },
            ].map((cat, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage('shop')}
                className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
              >
                <img
                  src={cat.image}
                  alt={language === 'ar' ? cat.nameAr : cat.nameEn}
                  className="w-full h-24 md:h-32 object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm md:text-base text-center px-2">
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Middle Promo Banners - Database Driven */}
      <PromoBanners position="middle" />

      {/* Featured Products */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1a237e]">
              {language === 'ar' ? 'منتجات مميزة' : 'Featured Products'}
            </h2>
            <Button 
              variant="link" 
              className="text-[#1a237e]"
              onClick={() => setCurrentPage('shop')}
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
              {isRTL ? <ArrowLeft className="h-4 w-4 mr-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=400&fit=crop', discount: true },
              { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', discount: false },
              { img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop', discount: true },
              { img: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=400&h=400&fit=crop', discount: false },
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setCurrentPage('product')}
              >
                <div className="relative">
                  <img
                    src={item.img}
                    alt="Product"
                    className="w-full h-48 object-cover"
                  />
                  {item.discount && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {language === 'ar' ? 'تخفيض' : 'Sale'}
                    </span>
                  )}
                </div>
                <div className="p-4 text-right">
                  <p className="text-xs text-slate-500 mb-1">HIKVISION</p>
                  <h3 className="font-medium text-slate-800 mb-2 text-sm line-clamp-2">
                    {language === 'ar' ? 'كاميرا مراقبة داخلية 4MP مع رؤية ليلية' : 'Indoor Security Camera 4MP with Night Vision'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-[#1a237e]">1,250 ريال</span>
                    {i % 2 === 0 && (
                      <span className="text-sm text-slate-400 line-through">1,500 ريال</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {language === 'ar' ? 'متوفر' : 'In Stock'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Banners - Database Driven */}
      <PromoBanners position="bottom" />

      {/* CTA Banner */}
      <section className="bg-[#1a237e] py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {language === 'ar' ? 'هل تحتاج مساعدة في اختيار الكاميرا المناسبة؟' : 'Need help choosing the right camera?'}
          </h2>
          <p className="text-white/80 mb-6">
            {language === 'ar' ? 'فريقنا جاهز لمساعدتك على مدار الساعة' : 'Our team is ready to help you 24/7'}
          </p>
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold"
            onClick={() => setCurrentPage('contact')}
          >
            {language === 'ar' ? 'اتصل بنا الآن' : 'Contact Us Now'}
          </Button>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#1a237e] mb-6 text-center">
            {language === 'ar' ? 'العلامات التجارية' : 'Our Brands'}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {[
              { name: 'Hikvision', logo: '/logos/hikvision.svg' },
              { name: 'Dahua', logo: '/logos/dahua.svg' },
              { name: 'EZVIZ', logo: '/logos/ezviz.svg' },
              { name: 'Tiandy', logo: '/logos/tiandy.svg' },
              { name: 'Uniview', logo: '/logos/uniview.svg' },
              { name: 'Honeywell', logo: '/logos/honeywell.svg' },
            ].map((brand) => (
              <div 
                key={brand.name} 
                className="bg-gray-50 px-6 py-3 rounded-lg hover:bg-[#e3f2fd] transition-colors cursor-pointer border border-gray-100 hover:border-[#1a237e]/20"
              >
                <img src={brand.logo} alt={brand.name} className="h-10 w-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
