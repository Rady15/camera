'use client'

import { Clock, Zap, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/store'

export function SpecialOffers() {
  const { setCurrentPage } = useUIStore()

  const offers = [
    {
      title: 'Flash Sale',
      description: 'Up to 40% off on selected outdoor cameras',
      code: 'FLASH40',
      discount: '40%',
      endTime: 'Ends in 24 hours',
      gradient: 'from-red-600 to-orange-500',
    },
    {
      title: 'Bundle Deal',
      description: 'Buy 2 cameras, get 1 free accessory',
      code: 'BUNDLE2024',
      discount: 'Free',
      endTime: 'Limited time offer',
      gradient: 'from-purple-600 to-pink-500',
    },
    {
      title: 'New Customer',
      description: '15% off your first order',
      code: 'WELCOME15',
      discount: '15%',
      endTime: 'For new customers',
      gradient: 'from-emerald-600 to-teal-500',
    },
  ]

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Zap className="h-6 w-6 text-orange-500" />
          <h2 className="text-3xl font-bold text-slate-900">Special Offers</h2>
          <Zap className="h-6 w-6 text-orange-500" />
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.gradient} text-white p-6`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white" />
                <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white" />
              </div>

              <div className="relative z-10">
                <Badge className="bg-white/20 text-white border-0 mb-3">
                  {offer.discount} OFF
                </Badge>
                
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <p className="text-white/80 mb-4">{offer.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{offer.endTime}</span>
                </div>

                <div className="bg-white/20 backdrop-blur rounded-lg p-3 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span className="font-mono font-bold">{offer.code}</span>
                  </div>
                  <button 
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                    onClick={() => navigator.clipboard.writeText(offer.code)}
                  >
                    Copy
                  </button>
                </div>

                <Button 
                  className="w-full bg-white text-slate-900 hover:bg-white/90"
                  onClick={() => setCurrentPage('shop')}
                >
                  Shop Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
