'use client'

import { Video, Wifi, Bell, Moon, Cloud, Shield, Smartphone, Zap } from 'lucide-react'

const features = [
  {
    icon: Video,
    title: '4K Ultra HD',
    description: 'Crystal clear video quality for perfect identification',
  },
  {
    icon: Wifi,
    title: 'WiFi Enabled',
    description: 'Easy setup with wireless connectivity',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Instant notifications when motion detected',
  },
  {
    icon: Moon,
    title: 'Night Vision',
    description: 'See clearly even in complete darkness',
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Secure footage backup in the cloud',
  },
  {
    icon: Shield,
    title: 'Weatherproof',
    description: 'Built to withstand any weather condition',
  },
  {
    icon: Smartphone,
    title: 'Remote Access',
    description: 'View your cameras from anywhere',
  },
  {
    icon: Zap,
    title: 'AI Detection',
    description: 'Smart person and vehicle detection',
  },
]

export function FeaturesShowcase() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Advanced Security Features</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Our cameras come packed with cutting-edge technology to keep you protected 24/7
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group text-center p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Icon className="h-8 w-8 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
