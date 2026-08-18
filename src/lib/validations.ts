/**
 * Zod Validation Schemas for API Endpoints
 * All input validation schemas for the SecureCam e-commerce platform
 */

import { z } from 'zod'

// ==================== USER/AUTH Schemas ====================

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
})

export const addressSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  street: z.string().min(5, 'العنوان مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  state: z.string().min(2, 'المحافظة مطلوبة'),
  zipCode: z.string().min(5, 'الرمز البريدي مطلوب'),
  country: z.string().default('Egypt'),
  isDefault: z.boolean().optional(),
})

// ==================== PRODUCT Schemas ====================

export const productCreateSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب').max(500),
  slug: z.string().min(2).max(500).optional(),
  sku: z.string().min(1, 'رمز المنتج SKU مطلوب').max(100),
  barcode: z.string().max(100).optional().nullable(),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  
  // Pricing - must be positive
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  comparePrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  wholesalePrice: z.number().positive().optional().nullable(),
  
  // Images
  images: z.array(z.string().url()).min(1, 'يجب إضافة صورة واحدة على الأقل'),
  mainImage: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  demoStreamUrl: z.string().url().optional().nullable(),
  
  // Categorization
  categoryId: z.string().min(1, 'الفئة مطلوبة'),
  brandId: z.string().optional().nullable(),
  
  // Inventory
  stock: z.number().int().min(0, 'المخزون لا يمكن أن يكون سالباً').default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'pre_order', 'coming_soon']).default('in_stock'),
  
  // CCTV-specific specs
  resolution: z.string().max(50).optional().nullable(),
  nightVision: z.string().max(100).optional().nullable(),
  viewingAngle: z.string().max(100).optional().nullable(),
  weatherRating: z.string().max(50).optional().nullable(),
  storage: z.string().max(100).optional().nullable(),
  isPoe: z.boolean().default(false),
  isWifi: z.boolean().default(false),
  hasAudio: z.boolean().default(false),
  hasTwoWayAudio: z.boolean().default(false),
  smartDetection: z.array(z.string()).optional().nullable(),
  specifications: z.record(z.unknown()).optional().nullable(),
  
  // Camera Type
  cameraType: z.enum(['bullet', 'dome', 'ptz', 'turret', 'hidden', 'box']).optional().nullable(),
  
  // Lens
  lensType: z.enum(['Fixed', 'Varifocal']).optional().nullable(),
  focalLength: z.string().max(50).optional().nullable(),
  
  // Status
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
})

export const productUpdateSchema = productCreateSchema.partial()

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  resolution: z.string().optional(),
  isPoe: z.coerce.boolean().optional(),
  isWifi: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name', 'newest', 'popular']).default('newest'),
})

// ==================== CATEGORY Schemas ====================

export const categoryCreateSchema = z.object({
  name: z.string().min(2, 'اسم الفئة مطلوب').max(255),
  slug: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

// ==================== BRAND Schemas ====================

export const brandCreateSchema = z.object({
  name: z.string().min(2, 'اسم الماركة مطلوب').max(255),
  slug: z.string().min(2).max(255).optional(),
  logo: z.string().url().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export const brandUpdateSchema = brandCreateSchema.partial()

// ==================== ORDER Schemas ====================

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive('الكمية يجب أن تكون أكبر من صفر'),
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
})

export const orderCreateSchema = z.object({
  // Payment
  paymentMethod: z.enum(['cod', 'stripe', 'paypal', 'paymob', 'fawry'], {
    errorMap: () => ({ message: 'طريقة الدفع غير صحيحة' }),
  }),
  couponCode: z.string().optional().nullable(),
  
  // Shipping
  shippingName: z.string().min(2, 'اسم المستلم مطلوب'),
  shippingPhone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  shippingEmail: z.string().email('البريد الإلكتروني غير صحيح').optional().nullable(),
  shippingStreet: z.string().min(5, 'العنوان مطلوب'),
  shippingCity: z.string().min(2, 'المدينة مطلوبة'),
  shippingState: z.string().min(2, 'المحافظة مطلوبة'),
  shippingZipCode: z.string().min(5, 'الرمز البريدي مطلوب'),
  shippingCountry: z.string().default('Egypt'),
  
  // Items
  items: z.array(orderItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
  
  // Notes
  customerNotes: z.string().optional().nullable(),
})

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'pending',
    'pending_payment',
    'payment_failed',
    'awaiting_confirmation',
    'confirmed',
    'processing',
    'ready_to_ship',
    'shipped',
    'delivered',
    'partially_delivered',
    'returned',
    'refunded',
    'cancelled',
  ]),
  internalNotes: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  trackingUrl: z.string().url().optional().nullable(),
  shippingProvider: z.string().optional().nullable(),
})

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  userId: z.string().optional(),
  all: z.coerce.boolean().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

// ==================== COUPON Schemas ====================

export const couponCreateSchema = z.object({
  code: z.string().min(2, 'كود الخصم مطلوب').max(50),
  description: z.string().optional(),
  discount: z.number().positive('قيمة الخصم يجب أن تكون أكبر من صفر'),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  minOrder: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().optional().nullable(),
  firstPurchaseOnly: z.boolean().default(false),
  active: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
})

export const couponUpdateSchema = couponCreateSchema.partial()

export const couponValidateSchema = z.object({
  code: z.string().min(1, 'كود الخصم مطلوب'),
  subtotal: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  items: z.array(z.object({
    productId: z.string(),
    categoryId: z.string().optional(),
    quantity: z.number().int().positive(),
  })).optional(),
})

// ==================== REVIEW Schemas ====================

export const reviewCreateSchema = z.object({
  productId: z.string().min(1, 'المنتج مطلوب'),
  rating: z.number().int().min(1, 'التقييم يجب أن يكون بين 1 و 5').max(5),
  title: z.string().max(255).optional(),
  comment: z.string().min(3, 'التعليق يجب أن يكون 3 أحرف على الأقل'),
  images: z.array(z.string().url()).max(5).optional(),
})

export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(255).optional(),
  comment: z.string().min(10).optional(),
  images: z.array(z.string().url()).max(5).optional(),
})

// ==================== SETTINGS Schemas ====================

export const settingCreateSchema = z.object({
  key: z.string().min(1, 'المفتاح مطلوب').max(100),
  value: z.string(),
  type: z.enum(['text', 'json', 'boolean', 'number']).default('text'),
  group: z.string().default('general'),
})

export const settingUpdateSchema = settingCreateSchema.partial()

// ==================== Helper Functions ====================

/**
 * Validate request body against a Zod schema
 * Returns either the validated data or an error response
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (!result.success) {
      const { NextResponse } = await import('next/server')
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Validation failed', code: 'VALIDATION_ERROR', details: errors },
          { status: 400 }
        ),
      }
    }
    
    return { success: true, data: result.data }
  } catch {
    const { NextResponse } = await import('next/server')
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid JSON body', code: 'INVALID_JSON' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: Record<string, string[]> } {
  const params = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(params)
  
  if (!result.success) {
    const errors: Record<string, string[]> = {}
    result.error.errors.forEach(e => {
      const field = e.path.join('.')
      if (!errors[field]) errors[field] = []
      errors[field].push(e.message)
    })
    return { success: false, error: errors }
  }
  
  return { success: true, data: result.data }
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
