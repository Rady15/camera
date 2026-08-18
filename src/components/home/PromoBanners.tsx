import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface Banner {
  id: string
  title: string | null
  description: string | null
  image: string
  link: string | null
  buttonText: string | null
  position: string
}

interface PromoBannersProps {
  position: 'middle' | 'bottom' | 'side'
}

export function PromoBanners({ position }: PromoBannersProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`/api/banners?position=${position}`)
        const data = await res.json()
        setBanners(data.banners || [])
      } catch (error) {
        console.error(`Failed to fetch ${position} banners:`, error)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [position])

  if (loading && banners.length === 0) return null
  if (banners.length === 0) return null

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className={`grid gap-6 ${banners.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className="relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[21/7] group cursor-pointer shadow-lg"
              onClick={() => banner.link && (window.location.href = banner.link)}
            >
              <img 
                src={banner.image} 
                alt={banner.title || 'Promo Banner'} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center">
                <div className="px-8 md:px-12 text-white text-right w-full" dir="rtl">
                  {banner.title && (
                    <h3 className="text-xl md:text-3xl font-bold mb-2 drop-shadow-md">
                      {banner.title}
                    </h3>
                  )}
                  {banner.description && (
                    <p className="text-sm md:text-lg text-white/90 mb-4 line-clamp-2 max-w-sm mr-0 ml-auto">
                      {banner.description}
                    </p>
                  )}
                  {banner.buttonText && (
                    <Button 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-slate-900 rounded-full"
                    >
                      {banner.buttonText}
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
