'use client'

import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { useUIStore, PageType } from '@/store'
import { useLanguage } from '@/components/providers/LanguageProvider'

const footerLinksAr = {
  shop: [
    { name: 'كاميرات داخلية', page: 'shop' as PageType },
    { name: 'كاميرات خارجية', page: 'shop' as PageType },
    { name: 'كاميرات لاسلكية', page: 'shop' as PageType },
    { name: 'أجهزة التسجيل NVR', page: 'shop' as PageType },
    { name: 'الإكسسوارات', page: 'shop' as PageType },
  ],
  support: [
    { name: 'مركز المساعدة', page: 'contact' as PageType },
    { name: 'معلومات الشحن', page: 'about' as PageType },
    { name: 'الاستبدال والإرجاع', page: 'about' as PageType },
    { name: 'تتبع الطلب', page: 'orders' as PageType },
    { name: 'اتصل بنا', page: 'contact' as PageType },
  ],
  company: [
    { name: 'من نحن', page: 'about' as PageType },
    { name: 'الوظائف', page: 'about' as PageType },
    { name: 'المدونة', page: 'home' as PageType },
  ],
}

const footerLinksEn = {
  shop: [
    { name: 'Indoor Cameras', page: 'shop' as PageType },
    { name: 'Outdoor Cameras', page: 'shop' as PageType },
    { name: 'Wireless Cameras', page: 'shop' as PageType },
    { name: 'DVR / NVR Systems', page: 'shop' as PageType },
    { name: 'Accessories', page: 'shop' as PageType },
  ],
  support: [
    { name: 'Help Center', page: 'contact' as PageType },
    { name: 'Shipping Info', page: 'about' as PageType },
    { name: 'Returns', page: 'about' as PageType },
    { name: 'Track Order', page: 'orders' as PageType },
    { name: 'Contact Us', page: 'contact' as PageType },
  ],
  company: [
    { name: 'About Us', page: 'about' as PageType },
    { name: 'Careers', page: 'about' as PageType },
    { name: 'Blog', page: 'home' as PageType },
  ],
}

export function Footer() {
  const { setCurrentPage } = useUIStore()
  const { language, isRTL } = useLanguage()

  const footerLinks = language === 'ar' ? footerLinksAr : footerLinksEn

  return (
    <footer className="bg-[#1e3a5f] text-white mt-auto border-t border-[#2a4a6f]">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SecureCam" className="h-10 w-auto" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {language === 'ar' 
                ? 'متجرك الموثوق لكاميرات المراقبة وأنظمة الأمان الاحترافية. نحمي ما يهمك منذ 2010.'
                : 'Your trusted source for professional security cameras and surveillance systems. Protecting what matters most since 2010.'
              }
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">
              {language === 'ar' ? 'المتجر' : 'Shop'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => setCurrentPage(link.page)}
                    className="text-slate-300 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">
              {language === 'ar' ? 'الدعم' : 'Support'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => setCurrentPage(link.page)}
                    className="text-slate-300 hover:text-yellow-400 transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Phone className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <span dir="ltr">01123456789</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-sm">
                <Mail className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                <span>support@securevision.com</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300 text-sm">
                <MapPin className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>
                  {language === 'ar' 
                    ? '123 شارع الأمان، القاهرة، مصر'
                    : '123 Security Boulevard, Cairo, Egypt'
                  }
                </span>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-sm text-slate-400 mb-2">
                {language === 'ar' ? 'طرق الدفع المتاحة:' : 'Available Payment Methods:'}
              </p>
              <div className="flex gap-2">
                <div className="bg-white/10 px-3 py-1 rounded text-xs">Visa</div>
                <div className="bg-white/10 px-3 py-1 rounded text-xs">Mastercard</div>
                <div className="bg-white/10 px-3 py-1 rounded text-xs">PayPal</div>
                <div className="bg-white/10 px-3 py-1 rounded text-xs">
                  {language === 'ar' ? 'عند الاستلام' : 'COD'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2a4a6f] bg-[#162d4a]">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <p className="text-slate-400 text-sm">
              © 2025 {language === 'ar' ? 'SecureCam. جميع الحقوق محفوظة.' : 'SecureCam. All rights reserved.'}
            </p>
            <div className="flex gap-6">
              <button className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </button>
              <button className="text-slate-400 hover:text-yellow-400 transition-colors text-sm">
                {language === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
