'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Tag,
  Truck,
  CreditCard,
  BarChart3,
  Star,
  UserCog,
  Settings,
  Camera,
  FileText,
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Shield,
  Home,
  RefreshCw,
  Building2,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { signOut } from 'next-auth/react'
import { useUIStore, useAuthStore, PageType } from '@/store'
import { AdminDashboardHome } from './AdminDashboardHome'
import { AdminProductsPage } from './AdminProductsPage'
import { AdminOrdersPage } from './AdminOrdersPage'
import { AdminCustomersPage } from './AdminCustomersPage'
import { AdminInventoryPage } from './AdminInventoryPage'
import { AdminCouponsPage } from './AdminCouponsPage'
import { AdminReportsPage } from './AdminReportsPage'
import { AdminSettingsPage } from './AdminSettingsPage'
import { AdminAuditLogPage } from './AdminAuditLogPage'
import { AdminReviewsPage } from './AdminReviewsPage'
import { AdminShippingPage } from './AdminShippingPage'
import { AdminPaymentMethodsPage } from './AdminPaymentMethodsPage'
import { AdminUsersPage } from './AdminUsersPage'
import { AdminDemoCamerasPage } from './AdminDemoCamerasPage'
import { AdminBrandsPage } from './AdminBrandsPage'
import { AdminBannersPage } from './AdminBannersPage'

type AdminPage = 
  | 'dashboard' 
  | 'products' 
  | 'orders' 
  | 'customers' 
  | 'inventory' 
  | 'coupons' 
  | 'shipping'
  | 'payments'
  | 'reports' 
  | 'reviews' 
  | 'users' 
  | 'settings' 
  | 'demo-cameras'
  | 'audit-log'
  | 'brands'
  | 'banners'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'brands', label: 'Brands', icon: Building2 },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'users', label: 'Users & Permissions', icon: UserCog },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'demo-cameras', label: 'Demo Cameras', icon: Camera },
  { id: 'banners', label: 'Banners & Hero', icon: ImageIcon },
  { id: 'audit-log', label: 'Audit Log', icon: FileText },
]

// Sidebar Content Component - defined outside to prevent re-creation
interface SidebarContentProps {
  currentPage: AdminPage
  setCurrentPage: (page: AdminPage) => void
  setSidebarOpen: (open: boolean) => void
  setMainPage: (page: PageType) => void
}

function SidebarContent({ currentPage, setCurrentPage, setSidebarOpen, setMainPage }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6 border-b border-slate-800">
        <Shield className="h-8 w-8 text-emerald-500" />
        <div>
          <span className="text-lg font-bold text-white">SecureVision</span>
          <p className="text-xs text-slate-500">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentPage(item.id as AdminPage)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Back to Store */}
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="outline"
          className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => setMainPage('home')}
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Store
        </Button>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const { setCurrentPage: setMainPage } = useUIStore()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setMainPage('home')
    }
  }, [isAuthenticated, user, setMainPage])

  const handleLogout = async () => {
    logout()
    await signOut({ redirect: false })
    setMainPage('home')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboardHome />
      case 'products':
        return <AdminProductsPage />
      case 'brands':
        return <AdminBrandsPage />
      case 'orders':
        return <AdminOrdersPage />
      case 'customers':
        return <AdminCustomersPage />
      case 'inventory':
        return <AdminInventoryPage />
      case 'coupons':
        return <AdminCouponsPage />
      case 'shipping':
        return <AdminShippingPage />
      case 'payments':
        return <AdminPaymentMethodsPage />
      case 'reviews':
        return <AdminReviewsPage />
      case 'reports':
        return <AdminReportsPage />
      case 'users':
        return <AdminUsersPage />
      case 'settings':
        return <AdminSettingsPage />
      case 'demo-cameras':
        return <AdminDemoCamerasPage />
      case 'audit-log':
        return <AdminAuditLogPage />
      case 'banners':
        return <AdminBannersPage />
      default:
        return <AdminDashboardHome />
    }
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
        <SidebarContent 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setSidebarOpen={setSidebarOpen}
          setMainPage={setMainPage}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-800">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setSidebarOpen={setSidebarOpen}
            setMainPage={setMainPage}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search products, orders, customers..."
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh */}
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <RefreshCw className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <div className="max-h-64 overflow-y-auto p-4 text-center text-slate-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-white">
                    <Avatar className="h-8 w-8 bg-emerald-600">
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-white">
                    <div>
                      <p>{user?.name}</p>
                      <p className="text-xs text-slate-400 font-normal">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                    onClick={() => setMainPage('dashboard')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    View Store
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                    <UserCog className="h-4 w-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-slate-700 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
