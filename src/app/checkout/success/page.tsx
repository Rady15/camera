'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || searchParams.get('order')
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      // Call verify API to finalize the order draft
      fetch(`/api/payment/verify?orderId=${orderId}&session_id=${sessionId || ''}`)
        .then(res => res.json())
        .then(() => setLoading(false))
        .catch(err => {
          console.error('Failed to verify order:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [orderId, sessionId])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <ShieldCheck className="h-12 w-12 text-emerald-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Payment Successful!</h1>
          <p className="text-slate-500">Your order has been placed and is being processed.</p>
        </div>

        {orderId && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-slate-400" />
              <div className="text-left">
                <p className="text-xs text-slate-400 uppercase font-semibold">Order ID</p>
                <p className="font-mono text-sm text-slate-700">{orderId}</p>
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
        )}

        <div className="pt-4 space-y-3">
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 py-6">
            <Link href="/" onClick={() => {
                 if (typeof window !== 'undefined') {
                    // Force state back to home or dashboard if needed
                    localStorage.setItem('redirect_page', 'orders');
                 }
            }}>
              View My Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="w-full text-slate-500">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <p className="text-xs text-slate-400">
          A confirmation email has been sent to your registered address.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
