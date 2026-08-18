'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-emerald-100 mb-8">
            Get the latest updates on new products, exclusive offers, and security tips delivered to your inbox.
          </p>
          
          {subscribed ? (
            <div className="bg-white/20 backdrop-blur rounded-lg p-6">
              <p className="text-lg font-medium">✓ Thank you for subscribing!</p>
              <p className="text-sm text-emerald-100 mt-1">Check your email for a welcome message.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-emerald-100"
                required
              />
              <Button type="submit" className="bg-white text-emerald-600 hover:bg-emerald-50">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
