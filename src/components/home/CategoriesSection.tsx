'use client'

import { Camera, Radio, HardDrive, Cpu, Cable } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useUIStore } from '@/store'

const categories = [
  {
    name: 'Indoor Cameras',
    description: 'Monitor your home interior',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    slug: 'indoor-cameras',
  },
  {
    name: 'Outdoor Cameras',
    description: 'Weather-resistant security',
    icon: Radio,
    image: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=400&h=300&fit=crop',
    slug: 'outdoor-cameras',
  },
  {
    name: 'Wireless Cameras',
    description: 'Easy installation, no wires',
    icon: Cpu,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop',
    slug: 'wireless-cameras',
  },
  {
    name: 'DVR / NVR Systems',
    description: 'Complete recording solutions',
    icon: HardDrive,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    slug: 'dvr-nvr-systems',
  },
  {
    name: 'Accessories',
    description: 'Cables, storage & more',
    icon: Cable,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    slug: 'accessories',
  },
]

export function CategoriesSection() {
  const { setCurrentPage } = useUIStore()

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Shop by Category</h2>
          <p className="text-slate-500 mt-2">Find the perfect security solution for your needs</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.slug}
                className="group cursor-pointer overflow-hidden border-slate-200 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg"
                onClick={() => setCurrentPage('shop')}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-semibold text-white">{category.name}</h3>
                    </div>
                    <p className="text-sm text-slate-300">{category.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
