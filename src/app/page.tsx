'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartSidebar } from '@/components/cart/CartSidebar'
import { ShopPage } from '@/components/products/ShopPage'
import { ProductDetailPage } from '@/components/products/ProductDetailPage'
import { CheckoutPage } from '@/components/cart/CartPage'
import { AuthPage } from '@/components/auth/AuthPage'
import { UserDashboard } from '@/components/auth/UserDashboard'
import { AboutPage } from '@/components/shared/AboutPage'
import { ContactPage } from '@/components/shared/ContactPage'
import { WishlistPage } from '@/components/shared/WishlistPage'
import { HomePage } from '@/components/home/HomePage'
import { useUIStore, PageType } from '@/store'
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })),
  { ssr: false }
)

// Seed data on module load
let dataSeeded = false
if (typeof window !== 'undefined' && !dataSeeded) {
  dataSeeded = true
  fetch('/api/seed', { method: 'POST' }).catch(() => {})
}

export default function Home() {
  const { currentPage } = useUIStore()

  const renderPage = (page: PageType) => {
    switch (page) {
      case 'home':
        return <HomePage />
      case 'shop':
        return <ShopPage />
      case 'product':
        return <ProductDetailPage />
      case 'cart':
        return <CheckoutPage />
      case 'checkout':
        return <CheckoutPage />
      case 'login':
      case 'register':
        return <AuthPage />
      case 'dashboard':
      case 'orders':
        return <UserDashboard />
      case 'wishlist':
        return <WishlistPage />
      case 'about':
        return <AboutPage />
      case 'contact':
        return <ContactPage />
      default:
        return <HomePage />
    }
  }

  const isAuthPage = currentPage === 'login' || currentPage === 'register'
  const isAdminPage = currentPage === 'admin' || currentPage === 'admin-products' || 
                      currentPage === 'admin-orders' || currentPage === 'admin-users'

  if (isAdminPage) {
    return <AdminDashboard />
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        {renderPage(currentPage)}
      </main>
      {!isAuthPage && <Footer />}
      <CartSidebar />
    </div>
  )
}
