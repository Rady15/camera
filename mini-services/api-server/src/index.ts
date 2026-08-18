import express from 'express'
import cors from 'cors'
import prisma from './db.js'
import { hash, compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = 3001
const JWT_SECRET = process.env.JWT_SECRET || 'securecam-secret-key-2024'

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://21.0.7.220:3000'],
  credentials: true
}))
app.use(express.json())

// ==================== SEED DATABASE ON START ====================

async function seedDatabase() {
  try {
    const existingProducts = await prisma.product.count()
    
    if (existingProducts > 0) {
      console.log('✅ Database already seeded')
      return
    }

    console.log('🌱 Seeding database...')

    // Categories
    const categories = [
      { name: 'كاميرات IP', slug: 'ip-cameras', description: 'كاميرات IP عالية الجودة' },
      { name: 'كاميرات AHD/Analog', slug: 'analog-cameras', description: 'كاميرات تناظرية' },
      { name: 'مسجلات NVR', slug: 'nvr', description: 'مسجلات شبكية' },
      { name: 'مسجلات DVR', slug: 'dvr', description: 'مسجلات رقمية' },
      { name: 'كاميرات WiFi', slug: 'wifi-cameras', description: 'كاميرات لاسلكية' },
      { name: 'أنظمة كاملة', slug: 'systems', description: 'أنظمة متكاملة' },
      { name: 'اكسسوارات', slug: 'accessories', description: 'ملحقات' },
      { name: 'كابلات وموصلات', slug: 'cables', description: 'كابلات' },
      { name: 'هارد ديسك', slug: 'storage', description: 'أقراص صلبة' },
      { name: 'شاشات عرض', slug: 'monitors', description: 'شاشات' },
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description },
        create: cat
      })
    }

    // Brands
    const brands = [
      { name: 'Hikvision', slug: 'hikvision', description: 'الرائدة عالمياً' },
      { name: 'Dahua', slug: 'dahua', description: 'حلول متقدمة' },
      { name: 'EZVIZ', slug: 'ezviz', description: 'كاميرات ذكية' },
      { name: 'Tiandy', slug: 'tiandy', description: 'تقنيات مبتكرة' },
      { name: 'Uniview', slug: 'uniview', description: 'مراقبة احترافية' },
    ]

    for (const brand of brands) {
      await prisma.brand.upsert({
        where: { slug: brand.slug },
        update: { name: brand.name, description: brand.description },
        create: brand
      })
    }

    const dbCategories = await prisma.category.findMany()
    const categoryMap = new Map(dbCategories.map(c => [c.slug, c.id]))
    const dbBrands = await prisma.brand.findMany()
    const brandMap = new Map(dbBrands.map(b => [b.name, b.id]))

    // Products
    const products = [
      {
        name: 'كاميرا Hikvision IP Dome 4MP',
        description: 'كاميرا IP Dome بدقة 4MP مع رؤية ليلية ColorVu حتى 30 متر',
        price: 1850, comparePrice: 2200,
        categorySlug: 'ip-cameras', brandName: 'Hikvision',
        stock: 50, sku: 'HK-DOME-4MP-001', featured: true,
        resolution: '4MP', nightVision: 'ColorVu 30m', weatherRating: 'IP67',
        isPoe: true, cameraType: 'Dome',
      },
      {
        name: 'كاميرا Dahua IP Bullet 8MP 4K',
        description: 'كاميرا IP Bullet بدقة 8MP 4K مع رؤية ليلية IR حتى 50 متر',
        price: 2450, comparePrice: 2900,
        categorySlug: 'ip-cameras', brandName: 'Dahua',
        stock: 35, sku: 'DH-BLT-8MP-001', featured: true,
        resolution: '8MP', nightVision: 'IR 50m', weatherRating: 'IP67',
        isPoe: true, cameraType: 'Bullet',
      },
      {
        name: 'كاميرا EZVIZ WiFi C6N Pro',
        description: 'كاميرا WiFi ذكية بدقة 2MP مع دوران 360°',
        price: 650, comparePrice: 800,
        categorySlug: 'wifi-cameras', brandName: 'EZVIZ',
        stock: 100, sku: 'EZV-C6N-001', featured: true,
        resolution: '2MP', nightVision: 'IR 10m', isWifi: true,
      },
      {
        name: 'مسجل Hikvision NVR 8 قنوات 4K',
        description: 'مسجل شبكي 8 قنوات يدعم كاميرات IP حتى 8MP',
        price: 3500, comparePrice: 4000,
        categorySlug: 'nvr', brandName: 'Hikvision',
        stock: 25, sku: 'HK-NVR-8CH-001', featured: true,
      },
      {
        name: 'نظام مراقبة Hikvision 4 كاميرات',
        description: 'نظام مراقبة متكامل: 4 كاميرات IP + NVR',
        price: 7500, comparePrice: 9000,
        categorySlug: 'systems', brandName: 'Hikvision',
        stock: 15, sku: 'SYS-HK-4CAM-001', featured: true,
      },
    ]

    const sampleImages = [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&h=600&fit=crop',
    ]

    for (let i = 0; i < products.length; i++) {
      const p = products[i]
      const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${i}`
      await prisma.product.create({
        data: {
          name: p.name, slug, description: p.description,
          price: p.price, comparePrice: p.comparePrice,
          images: JSON.stringify([sampleImages[i % 2]]),
          categoryId: categoryMap.get(p.categorySlug)!,
          brandId: p.brandName ? brandMap.get(p.brandName) : null,
          stock: p.stock, sku: p.sku, featured: p.featured,
          resolution: p.resolution, nightVision: p.nightVision,
          weatherRating: p.weatherRating, isPoe: p.isPoe || false,
          isWifi: p.isWifi || false, cameraType: p.cameraType,
          rating: 4 + Math.random(), reviewCount: Math.floor(Math.random() * 50) + 5,
        }
      })
    }

    // Admin user
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'admin' } })
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          name: 'مدير النظام',
          email: 'admin@securecam.com',
          password: await hash('admin123', 12),
          role: 'admin',
        }
      })
    }

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('Seed error:', error)
  }
}

// Run seed on startup
seedDatabase()

// ==================== ROUTES ====================

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'Email exists' })
    
    const user = await prisma.user.create({
      data: { name, email, password: await hash(password, 12), phone, role: 'customer' }
    })
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: { id: user.id, name, email, role: user.role }, token })
  } catch (e) {
    res.status(500).json({ error: 'Failed to register' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user?.password || !await compare(password, user.password)) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ user: { id: user.id, name: user.name, email, role: user.role }, token })
  } catch (e) {
    res.status(500).json({ error: 'Failed to login' })
  }
})

// Products
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured, limit, search } = req.query
    const where: any = { isActive: true }
    if (category) where.category = { slug: category }
    if (featured === 'true') where.featured = true
    if (search) where.OR = [
      { name: { contains: search as string } },
      { description: { contains: search as string } }
    ]
    
    const products = await prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : undefined
    })
    
    res.json({ products: products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      smartDetection: p.smartDetection ? JSON.parse(p.smartDetection) : null,
    }))})
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, brand: true }
    })
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json({ product: { ...product, images: JSON.parse(product.images || '[]') }})
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    res.json({ categories })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Orders
app.get('/api/orders', async (req, res) => {
  try {
    const { all, limit } = req.query
    const orders = await prisma.order.findMany({
      where: all !== 'true' ? {} : {},
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : undefined
    })
    res.json({ orders })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const { items, shipping, paymentMethod, subtotal, shippingCost, tax, total, userId } = req.body
    
    if (!items?.length) return res.status(400).json({ error: 'No items' })
    if (!shipping?.name || !shipping?.phone) return res.status(400).json({ error: 'Missing shipping' })
    
    const orderNumber = `SV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    const orderItems = items.map((item: any) => ({
      productId: item.productId || null,
      productName: item.productName || 'Product',
      productImage: item.productImage || null,
      price: item.price || 0,
      quantity: item.quantity || 1,
      subtotal: (item.price || 0) * (item.quantity || 1),
    }))
    
    const order = await prisma.order.create({
      data: {
        orderNumber, userId: userId || null,
        status: 'pending', paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        subtotal: subtotal || 0, tax: tax || 0, shipping: shippingCost || 0, total: total || 0,
        shippingName: shipping.name, shippingPhone: shipping.phone,
        shippingEmail: shipping.email || null,
        shippingStreet: shipping.street || '', shippingCity: shipping.city || '',
        shippingState: shipping.state || '', shippingZipCode: shipping.zipCode || '',
        shippingCountry: shipping.country || 'Egypt',
        items: { create: orderItems }
      },
      include: { items: true }
    })
    
    res.json({ order })
  } catch (e) {
    res.status(500).json({ error: 'Failed to create order', details: String(e) })
  }
})

// Admin
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [productCount, orderCount, userCount, orders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({ select: { total: true } })
    ])
    res.json({ productCount, orderCount, userCount, totalRevenue: orders.reduce((s, o) => s + o.total, 0) })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

app.post('/api/admin/setup', async (req, res) => {
  try {
    const existing = await prisma.user.findFirst({ where: { role: 'admin' } })
    if (existing) return res.status(400).json({ error: 'Admin exists' })
    
    const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })
    if (!firstUser) return res.status(400).json({ error: 'No users' })
    
    const user = await prisma.user.update({ where: { id: firstUser.id }, data: { role: 'admin' } })
    res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } })
  } catch (e) {
    res.status(500).json({ error: 'Failed' })
  }
})

// Seed endpoint
app.post('/api/seed', async (req, res) => {
  await seedDatabase()
  res.json({ success: true, message: 'Database seeded' })
})

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 SecureCam API Server: http://localhost:${PORT}`)
})

export default app
