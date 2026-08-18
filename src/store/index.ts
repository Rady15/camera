import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  images: string[]
  logo: string | null
  categoryId: string
  category: { id: string; name: string; slug: string }
  stock: number
  sku: string
  featured: boolean
  specifications: Record<string, string> | null
  rating: number
  reviewCount: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  avatar: string | null
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingName: string
  shippingPhone: string
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingZipCode: string
  shippingCountry: string
  notes: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  confirmedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  deliveryMethod: 'courier' | 'pickup'
  pickupBranch: string | null
  createdAt: string
  items: {
    id: string
    productId: string
    productName: string
    productImage: string
    price: number
    quantity: number
  }[]
}

export interface Address {
  id: string
  name: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

// Page types for navigation
export type PageType = 
  | 'home' 
  | 'shop' 
  | 'product' 
  | 'cart' 
  | 'checkout' 
  | 'login' 
  | 'register'
  | 'dashboard' 
  | 'orders'
  | 'wishlist'
  | 'admin'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-users'
  | 'about'
  | 'contact'

// UI Store
interface UIStore {
  currentPage: PageType
  selectedProductId: string | null
  searchQuery: string
  selectedCategory: string | null
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  
  setCurrentPage: (page: PageType) => void
  setSelectedProductId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  setIsCartOpen: (open: boolean) => void
  setIsMobileMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentPage: 'home',
  selectedProductId: null,
  searchQuery: '',
  selectedCategory: null,
  isCartOpen: false,
  isMobileMenuOpen: false,
  
  setCurrentPage: (page) => set({ currentPage: page, isMobileMenuOpen: false }),
  setSelectedProductId: (id) => set({ selectedProductId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setIsCartOpen: (open) => set({ isCartOpen: open }),
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
}))

// Auth Store
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Hydration flag set to false when loading from local storage is done
        if (state) {
          state.setLoading(false)
        }
      },
    }
  )
)

// Cart Store
interface CartStore {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(item => item.product.id === product.id)
        
        let newItems: CartItem[]
        if (existingItem) {
          newItems = items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
              : item
          )
        } else {
          newItems = [...items, { product, quantity: Math.min(quantity, product.stock) }]
        }
        
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        
        set({ items: newItems, totalItems, totalPrice })
      },
      
      removeItem: (productId) => {
        const items = get().items.filter(item => item.product.id !== productId)
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        
        set({ items, totalItems, totalPrice })
      },
      
      updateQuantity: (productId, quantity) => {
        const items = get().items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) }
            : item
        )
        
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        
        set({ items, totalItems, totalPrice })
      },
      
      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Wishlist Store
interface WishlistStore {
  items: string[] // product IDs
  
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (productId) => {
        const items = get().items
        if (!items.includes(productId)) {
          set({ items: [...items, productId] })
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(id => id !== productId) })
      },
      
      isInWishlist: (productId) => get().items.includes(productId),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)
