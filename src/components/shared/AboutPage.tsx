'use client'

import { Shield, Users, Award, Clock, MapPin, Phone, Mail, Target, Eye, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store'

export function AboutPage() {
  const { setCurrentPage } = useUIStore()

  const teamMembers = [
    { name: 'John Smith', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop' },
    { name: 'Sarah Johnson', role: 'Head of Sales', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop' },
    { name: 'Michael Chen', role: 'Technical Director', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop' },
    { name: 'Emily Davis', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop' },
  ]

  const milestones = [
    { year: '2010', title: 'Company Founded', description: 'Started with a vision to make security accessible to everyone.' },
    { year: '2013', title: '10,000 Customers', description: 'Reached our first major milestone of serving 10,000 happy customers.' },
    { year: '2016', title: 'Product Line Expansion', description: 'Introduced wireless and smart home security solutions.' },
    { year: '2019', title: 'National Coverage', description: 'Expanded shipping to all 50 states with same-day dispatch.' },
    { year: '2022', title: '50,000+ Customers', description: 'Celebrated serving over 50,000 homes and businesses.' },
    { year: '2024', title: 'AI Integration', description: 'Launched AI-powered security solutions with smart detection.' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6 text-emerald-400" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About SecureVision</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your trusted partner in home and business security since 2010. 
            We're committed to making professional-grade security accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-slate-200">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Target className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
                </div>
                <p className="text-slate-600">
                  To provide affordable, reliable, and cutting-edge security solutions that protect 
                  what matters most to our customers. We believe everyone deserves peace of mind, 
                  and we work tirelessly to make that a reality.
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Eye className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
                </div>
                <p className="text-slate-600">
                  To be the most trusted name in security technology, known for innovation, 
                  exceptional customer service, and a commitment to making communities safer 
                  one home and business at a time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">14+</p>
              <p className="text-emerald-100">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">50K+</p>
              <p className="text-emerald-100">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-emerald-100">Products</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">99%</p>
              <p className="text-emerald-100">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-emerald-200 mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                  <p className="text-slate-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Meet Our Team</h2>
          <p className="text-center text-slate-600 mb-12">The people behind SecureVision</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center border-slate-200 overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-emerald-600 text-sm">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Trust</h3>
              <p className="text-slate-600">Building lasting relationships through transparency and reliability.</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Quality</h3>
              <p className="text-slate-600">Only the best products that meet our rigorous standards.</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Customer First</h3>
              <p className="text-slate-600">Your safety and satisfaction are our top priorities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Property?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Browse our extensive collection of security cameras and systems. 
            Our team is ready to help you find the perfect solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setCurrentPage('shop')}
            >
              Shop Now
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-slate-900"
              onClick={() => setCurrentPage('contact')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
