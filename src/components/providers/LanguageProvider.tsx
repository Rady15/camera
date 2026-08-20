'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ar' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.shop': 'المتجر',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.dashboard': 'لوحة التحكم',
    'nav.logout': 'تسجيل الخروج',
    'nav.wishlist': 'المفضلة',
    'nav.cart': 'سلة التسوق',
    'nav.admin': 'لوحة الإدارة',
    
    // Hero Section
    'hero.title': 'احمِ ما يهمك',
    'hero.titleHighlight': 'بأحدث التقنيات',
    'hero.subtitle': 'اكتشف مجموعتنا المتميزة من كاميرات المراقبة وأنظمة الأمان. من المراقبة الداخلية إلى الأمان الخارجي، لدينا الحل الأمثل لاحتياجاتك.',
    'hero.shopNow': 'تسوق الآن',
    'hero.learnMore': 'اعرف المزيد',
    'hero.products': 'منتج',
    'hero.customers': 'عميل',
    'hero.satisfaction': 'رضا العملاء',
    
    // Categories
    'categories.title': 'تصفح حسب الفئة',
    'categories.subtitle': 'اختر من مجموعة واسعة من كاميرات المراقبة',
    'categories.indoor': 'كاميرات داخلية',
    'categories.outdoor': 'كاميرات خارجية',
    'categories.ptz': 'كاميرات متحركة',
    'categories.nvr': 'أجهزة التسجيل',
    'categories.accessories': 'الإكسسوارات',
    
    // Products
    'products.featured': 'منتجات مميزة',
    'products.newArrivals': 'وصل حديثاً',
    'products.bestseller': 'الأكثر مبيعاً',
    'products.addToCart': 'أضف للسلة',
    'products.addToWishlist': 'أضف للمفضلة',
    'products.outOfStock': 'غير متوفر',
    'products.inStock': 'متوفر',
    'products.viewDetails': 'عرض التفاصيل',
    'products.egp': 'ريال',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.continue': 'متابعة التسوق',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.shipping': 'الشحن',
    'cart.total': 'المجموع',
    'cart.checkout': 'إتمام الشراء',
    'cart.removeItem': 'إزالة',
    
    // Checkout
    'checkout.title': 'إتمام الشراء',
    'checkout.shipping': 'عنوان الشحن',
    'checkout.payment': 'طريقة الدفع',
    'checkout.review': 'مراجعة الطلب',
    'checkout.placeOrder': 'تأكيد الطلب',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.name': 'الاسم الكامل',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.haveAccount': 'لديك حساب بالفعل؟',
    'auth.orContinueWith': 'أو تابع باستخدام',
    
    // Footer
    'footer.description': 'متجر متخصص في توفير أحدث أنظمة المراقبة والأمان بأفضل الأسعار وخدمة عملاء متميزة.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.customerService': 'خدمة العملاء',
    'footer.contactUs': 'اتصل بنا',
    'footer.shippingPolicy': 'سياسة الشحن',
    'footer.returnPolicy': 'سياسة الإرجاع',
    'footer.faq': 'الأسئلة الشائعة',
    'footer.followUs': 'تابعنا',
    'footer.rights': 'جميع الحقوق محفوظة',
    
    // Search
    'search.placeholder': 'ابحث عن منتجات...',
    'search.search': 'بحث',
    
    // Stats
    'stats.freeShipping': 'شحن مجاني',
    'stats.freeShippingDesc': 'للطلبات فوق 500 ريال',
    'stats.support': 'دعم فني',
    'stats.supportDesc': '24/7 خدمة العملاء',
    'stats.warranty': 'ضمان سنتين',
    'stats.warrantyDesc': 'على جميع المنتجات',
    'stats.installation': 'تركيب مجاني',
    'stats.installationDesc': 'في القاهرة والجيزة',
    
    // Features
    'features.4kUltraHD': 'دقة فائقة 4K',
    'features.nightVision': 'رؤية ليلية',
    'features.smartDetection': 'كشف ذكي',
    'features.remoteAccess': 'وصول عن بعد',
    
    // Filters
    'filter.all': 'الكل',
    'filter.category': 'الفئة',
    'filter.price': 'السعر',
    'filter.brand': 'الماركة',
    'filter.sortBy': 'ترتيب حسب',
    'filter.priceRange': 'نطاق السعر',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.products': 'المنتجات',
    'admin.orders': 'الطلبات',
    'admin.customers': 'العملاء',
    'admin.reports': 'التقارير',
    'admin.settings': 'الإعدادات',
    
    // Misc
    'misc.loading': 'جاري التحميل...',
    'misc.error': 'حدث خطأ',
    'misc.success': 'تم بنجاح',
    'misc.save': 'حفظ',
    'misc.cancel': 'إلغاء',
    'misc.delete': 'حذف',
    'misc.edit': 'تعديل',
    'misc.add': 'إضافة',
    'misc.back': 'رجوع',
    'misc.next': 'التالي',
    'misc.previous': 'السابق',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.shop': 'Shop',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Cart',
    'nav.admin': 'Admin Panel',
    
    // Hero Section
    'hero.title': 'Protect What',
    'hero.titleHighlight': 'Matters Most',
    'hero.subtitle': 'Discover our premium collection of CCTV cameras and surveillance systems. From indoor monitoring to outdoor security, we have the perfect solution for your needs.',
    'hero.shopNow': 'Shop Now',
    'hero.learnMore': 'Learn More',
    'hero.products': 'Products',
    'hero.customers': 'Customers',
    'hero.satisfaction': 'Satisfaction',
    
    // Categories
    'categories.title': 'Browse by Category',
    'categories.subtitle': 'Choose from a wide range of surveillance cameras',
    'categories.indoor': 'Indoor Cameras',
    'categories.outdoor': 'Outdoor Cameras',
    'categories.ptz': 'PTZ Cameras',
    'categories.nvr': 'NVR Systems',
    'categories.accessories': 'Accessories',
    
    // Products
    'products.featured': 'Featured Products',
    'products.newArrivals': 'New Arrivals',
    'products.bestseller': 'Bestseller',
    'products.addToCart': 'Add to Cart',
    'products.addToWishlist': 'Add to Wishlist',
    'products.outOfStock': 'Out of Stock',
    'products.inStock': 'In Stock',
    'products.viewDetails': 'View Details',
    'products.egp': 'SAR',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continue': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.removeItem': 'Remove',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping Address',
    'checkout.payment': 'Payment Method',
    'checkout.review': 'Review Order',
    'checkout.placeOrder': 'Place Order',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.orContinueWith': 'Or continue with',
    
    // Footer
    'footer.description': 'Specialized store providing the latest surveillance and security systems at the best prices with excellent customer service.',
    'footer.quickLinks': 'Quick Links',
    'footer.customerService': 'Customer Service',
    'footer.contactUs': 'Contact Us',
    'footer.shippingPolicy': 'Shipping Policy',
    'footer.returnPolicy': 'Return Policy',
    'footer.faq': 'FAQ',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All Rights Reserved',
    
    // Search
    'search.placeholder': 'Search products...',
    'search.search': 'Search',
    
    // Stats
    'stats.freeShipping': 'Free Shipping',
    'stats.freeShippingDesc': 'Orders over 500 SAR',
    'stats.support': 'Technical Support',
    'stats.supportDesc': '24/7 Customer Service',
    'stats.warranty': '2 Year Warranty',
    'stats.warrantyDesc': 'On all products',
    'stats.installation': 'Free Installation',
    'stats.installationDesc': 'In Cairo & Giza',
    
    // Features
    'features.4kUltraHD': '4K Ultra HD',
    'features.nightVision': 'Night Vision',
    'features.smartDetection': 'Smart Detection',
    'features.remoteAccess': 'Remote Access',
    
    // Filters
    'filter.all': 'All',
    'filter.category': 'Category',
    'filter.price': 'Price',
    'filter.brand': 'Brand',
    'filter.sortBy': 'Sort By',
    'filter.priceRange': 'Price Range',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.customers': 'Customers',
    'admin.reports': 'Reports',
    'admin.settings': 'Settings',
    
    // Misc
    'misc.loading': 'Loading...',
    'misc.error': 'An error occurred',
    'misc.success': 'Success',
    'misc.save': 'Save',
    'misc.cancel': 'Cancel',
    'misc.delete': 'Delete',
    'misc.edit': 'Edit',
    'misc.add': 'Add',
    'misc.back': 'Back',
    'misc.next': 'Next',
    'misc.previous': 'Previous',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar')

  useEffect(() => {
    // Initialize from localStorage on mount
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLanguage(savedLang)
    }
  }, [])

  useEffect(() => {
    // Sync language to localStorage when it changes
    localStorage.setItem('language', language)
  }, [language])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const isRTL = language === 'ar'

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
