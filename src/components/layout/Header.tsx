'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { 
  ShoppingCart, Menu, X, Search, User, Heart, Shield, 
  ChevronDown, Globe, Phone, Mail, Video, Camera, 
  Settings, HardDrive, Monitor, Layers, Cpu, Radio, Cable
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { useUIStore, useCartStore, useAuthStore, PageType } from '@/store'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { cn } from '@/lib/utils'

// CCTV-specific categories with Lucide icons
const categoriesAr = [
  { name: 'كاميرات IP', slug: 'ip-cameras', icon: <Video className="h-4 w-4" /> },
  { name: 'كاميرات AHD/Analog', slug: 'analog-cameras', icon: <Camera className="h-4 w-4" /> },
  { name: 'مسجلات NVR', slug: 'nvr', icon: <HardDrive className="h-4 w-4" /> },
  { name: 'مسجلات DVR', slug: 'dvr', icon: <Cpu className="h-4 w-4" /> },
  { name: 'كاميرات WiFi', slug: 'wifi-cameras', icon: <Radio className="h-4 w-4" /> },
  { name: 'أنظمة كاملة', slug: 'systems', icon: <Layers className="h-4 w-4" /> },
  { name: 'اكسسوارات', slug: 'accessories', icon: <Settings className="h-4 w-4" /> },
  { name: 'كابلات وموصلات', slug: 'cables', icon: <Cable className="h-4 w-4" /> },
  { name: 'هارد ديسك', slug: 'storage', icon: <HardDrive className="h-4 w-4" /> },
  { name: 'شاشات عرض', slug: 'monitors', icon: <Monitor className="h-4 w-4" /> },
]

export function Header() {
  const { 
    currentPage, setCurrentPage, setSearchQuery, 
    selectedCategory, setSelectedCategory, isMobileMenuOpen, setIsMobileMenuOpen, 
    setIsCartOpen 
  } = useUIStore()
  
  const { totalItems } = useCartStore()
  const { user, isAuthenticated, logout, setUser } = useAuthStore()
  const { data: session, status } = useSession()
  const { language, setLanguage, t, isRTL } = useLanguage()
  
  const [localSearch, setLocalSearch] = useState('')
  const [showAdminSetup, setShowAdminSetup] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Sync NextAuth session
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || 'User',
        role: session.user.role,
        avatar: session.user.avatar,
        phone: null,
      })
    }
  }, [status, session, setUser])

  const handleLogout = async () => {
    logout()
    await signOut({ redirect: false })
    setCurrentPage('home')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearch)
    setCurrentPage('shop')
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "shadow-md" : "shadow-none"
      )}
    >
      {/* Top bar - Ultra Minimal */}
      <div className="bg-slate-900 overflow-hidden text-slate-300 py-1.5 text-[11px] sm:text-xs font-medium border-b border-white/5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:01123456789" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-emerald-400" />
              <span>01123456789</span>
            </a>
            <a href="mailto:support@securevision.com" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="h-3 w-3 text-emerald-400" />
              <span>support@securevision.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1.5 text-emerald-400">
              <Shield className="h-3 w-3" />
              <span>ضمان عامين على جميع المنتجات</span>
            </div>
            <div className="h-3 w-[1px] bg-white/20 hidden sm:block mx-1" />
            <div className="flex items-center rounded-full bg-white/5 p-0.5">
              <button
                onClick={() => setLanguage('ar')}
                className={cn(
                  "px-2 py-0.5 rounded-full transition-all",
                  language === 'ar' ? "bg-emerald-500 text-white shadow-sm" : "hover:text-white"
                )}
              >
                العربية
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2 py-0.5 rounded-full transition-all",
                  language === 'en' ? "bg-emerald-500 text-white shadow-sm" : "hover:text-white"
                )}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header - Glassmorphism */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-4 md:gap-8">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0" 
              onClick={() => setCurrentPage('home')}
            >
              <img src="/logo.png" alt="SecureCam" className="h-10 w-auto" />
            </div>

            {/* Search Bar - Modern Rounded */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-2xl group">
              <div className="relative w-full flex items-center bg-slate-100/80 rounded-full border border-transparent focus-within:border-emerald-500/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all duration-300 overflow-hidden h-11">
                <Input
                  type="search"
                  placeholder="ابحث عن كاميرات، مسجلات، أو ملحقات..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-5 text-slate-900 text-sm h-full"
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full w-9 h-9 mr-1 transition-all"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* User */}
              {mounted && isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 rounded-full hover:bg-slate-100 text-slate-700 font-medium px-2 sm:px-4 gap-2">
                       <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:inline text-sm">{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl">
                    <div className="px-2 py-2 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">حسابي</p>
                    </div>
                    <DropdownMenuItem onClick={() => setCurrentPage('dashboard')} className="rounded-xl cursor-pointer py-2.5">
                      <User className="h-4 w-4 mr-2" />
                      لوحة التحكم
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentPage('orders')} className="rounded-xl cursor-pointer py-2.5">
                      <Layers className="h-4 w-4 mr-2" />
                      طلباتي
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem onClick={() => setCurrentPage('admin')} className="rounded-xl cursor-pointer py-2.5 text-emerald-600 font-bold">
                          <Settings className="h-4 w-4 mr-2" />
                          لوحة الإدارة
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-2.5 text-red-500 focus:text-red-500">
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : mounted && (
                <Button 
                  variant="ghost" 
                  className="h-10 rounded-full hover:bg-slate-100 text-slate-700 font-medium px-2 sm:px-4 gap-2"
                  onClick={() => setCurrentPage('login')}
                >
                  <User className="h-5 w-5 text-slate-400" />
                  <span className="hidden lg:inline text-sm">دخول / حساب جديد</span>
                </Button>
              )}

              {/* Wishlist */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-slate-100 text-slate-700"
                onClick={() => setCurrentPage('wishlist')}
              >
                <Heart className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-slate-100 text-slate-700 relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-emerald-500 text-white text-[10px] font-bold rounded-full animate-in zoom-in-50 duration-300">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-full hover:bg-slate-100">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] border-0 p-0 overflow-y-auto">
                    {/* Professional Mobile Menu */}
                    <div className="bg-slate-950 text-white min-h-full">
                        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="SecureCam" className="h-10 w-auto" />
                            </div>
                            
                            <form onSubmit={handleSearch} className="flex h-11">
                                <Input
                                    type="search"
                                    placeholder="ابحث..."
                                    className="bg-white/10 border-0 rounded-l-none text-right rounded-r-xl"
                                    dir="rtl"
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                />
                                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 rounded-r-none rounded-l-xl">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            <nav className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">التنقل</p>
                                <button onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }} className="w-full text-right py-3 text-lg font-medium border-b border-white/5 flex items-center justify-between">
                                    <span>🏠</span> الرئيسية 
                                </button>
                                <button onClick={() => { setSelectedCategory(null); setCurrentPage('shop'); setIsMobileMenuOpen(false); }} className="w-full text-right py-3 text-lg font-medium border-b border-white/5 flex items-center justify-between">
                                    <span>🛒</span> المتجر
                                </button>
                            </nav>
                            
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">الأقسام</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {categoriesAr.map((cat) => (
                                        <button 
                                            key={cat.slug}
                                            onClick={() => { 
                                                setSelectedCategory(cat.slug); 
                                                setCurrentPage('shop'); 
                                                setIsMobileMenuOpen(false); 
                                            }} 
                                            className="w-full h-12 flex items-center gap-3 px-4 rounded-xl bg-white/5 hover:bg-emerald-500/20 transition-all text-right group"
                                        >
                                            <div className="text-slate-400 group-hover:text-emerald-400 transition-colors">
                                                {cat.icon}
                                            </div>
                                            <span className="flex-1 text-sm font-medium">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Desktop */}
      <div className="bg-white border-b border-slate-100 hidden lg:block overflow-hidden">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-8 h-14">
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-2 rounded-full text-sm font-bold transition-all h-10",
                    selectedCategory ? "bg-emerald-50 text-emerald-700" : "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  )}
                >
                  <Menu className="h-4 w-4" />
                  <span>{selectedCategory ? categoriesAr.find(c => c.slug === selectedCategory)?.name : "تصفح الأقسام"}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl border-slate-100 shadow-2xl animate-in slide-in-from-top-2 duration-300">
                <div className="px-2 py-2 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">جميع الفئات</p>
                </div>
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery('')
                    setCurrentPage('shop')
                  }}
                  className="rounded-xl cursor-pointer py-3"
                >
                  <Layers className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 font-bold">كل المنتجات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5" />
                <div className="grid grid-cols-1 gap-0.5">
                  {categoriesAr.map((cat) => (
                    <DropdownMenuItem 
                      key={cat.slug} 
                      onClick={() => {
                        setSelectedCategory(cat.slug)
                        setSearchQuery('')
                        setCurrentPage('shop')
                      }}
                      className={cn(
                        "rounded-xl cursor-pointer py-2.5 hover:bg-emerald-50 focus:bg-emerald-50 group",
                        selectedCategory === cat.slug && "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                        {cat.icon}
                      </span>
                      <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Main Links */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => { setCurrentPage('home'); setSelectedCategory(null); }}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all",
                  currentPage === 'home' ? "text-emerald-600 bg-emerald-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                الرئيسية
              </button>
              <button 
                onClick={() => { setCurrentPage('shop'); setSelectedCategory(null); }}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all",
                  currentPage === 'shop' && !selectedCategory ? "text-emerald-600 bg-emerald-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                المتجر
              </button>
              <button 
                onClick={() => setCurrentPage('about')}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all",
                  currentPage === 'about' ? "text-emerald-600 bg-emerald-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                من نحن
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-bold transition-all",
                  currentPage === 'contact' ? "text-emerald-600 bg-emerald-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                اتصل بنا
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
