'use client'

import { Truck, Shield, CreditCard, Headphones, RefreshCw, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $99',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure transactions',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Expert technical help',
  },
  {
    icon: Award,
    title: 'Quality Guarantee',
    description: 'Premium products only',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payment',
    description: 'Cards, PayPal, COD',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Why Choose Us</h2>
          <p className="text-slate-500 mt-2">We're committed to providing the best security solutions</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors"
              >
                <div className="bg-emerald-100 p-4 rounded-full mb-4">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
