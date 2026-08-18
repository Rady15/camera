/**
 * Tests for Products API
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/products/route'

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

// Mock auth middleware
jest.mock('@/lib/auth-middleware', () => ({
  protectApiRoute: (handler: (...args: unknown[]) => unknown) => handler,
  routeConfigs: {
    public: { public: true },
    adminOnly: { requiredRoles: ['admin'] },
  },
  getUserFromHeaders: () => ({ id: 'user-1', role: 'admin' }),
}))

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: (...args: unknown[]) => unknown) => handler,
  checkRateLimit: () => ({ allowed: true }),
}))

// Import after mocking
import { db } from '@/lib/db'

const mockDb = db as jest.Mocked<typeof db>

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          sku: 'TEST-001',
          description: 'Test description',
          price: 100,
          images: '["https://example.com/image.jpg"]',
          categoryId: 'cat-1',
          stock: 10,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: 'cat-1', name: 'Test Category', slug: 'test-category' },
          brand: null,
        },
      ]

      mockDb.product.findMany.mockResolvedValue(mockProducts as unknown as Awaited<ReturnType<typeof mockDb.product.findMany>>)

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toBeDefined()
      expect(Array.isArray(data.products)).toBe(true)
    })

    it('should filter by category slug', async () => {
      mockDb.product.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/products?category=ip-cameras')
      await GET(request)

      expect(mockDb.product.findMany).toHaveBeenCalled()
      const callArg = mockDb.product.findMany.mock.calls[0][0]
      expect(callArg.where.category).toEqual({ slug: 'ip-cameras' })
    })

    it('should filter by featured flag', async () => {
      mockDb.product.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/products?featured=true')
      await GET(request)

      expect(mockDb.product.findMany).toHaveBeenCalled()
      const callArg = mockDb.product.findMany.mock.calls[0][0]
      expect(callArg.where.featured).toBe(true)
    })

    it('should search in product name and description', async () => {
      mockDb.product.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/products?search=camera')
      await GET(request)

      expect(mockDb.product.findMany).toHaveBeenCalled()
      const callArg = mockDb.product.findMany.mock.calls[0][0]
      expect(callArg.where.OR).toBeDefined()
      expect(callArg.where.OR).toHaveLength(3)
    })

    it('should filter by price range', async () => {
      mockDb.product.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/products?minPrice=500&maxPrice=2000')
      await GET(request)

      expect(mockDb.product.findMany).toHaveBeenCalled()
      const callArg = mockDb.product.findMany.mock.calls[0][0]
      expect(callArg.where.price.gte).toBe(500)
      expect(callArg.where.price.lte).toBe(2000)
    })

    it('should filter in-stock products only', async () => {
      mockDb.product.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/products?inStock=true')
      await GET(request)

      expect(mockDb.product.findMany).toHaveBeenCalled()
      const callArg = mockDb.product.findMany.mock.calls[0][0]
      expect(callArg.where.stock).toEqual({ gt: 0 })
    })
  })

  describe('POST /api/products', () => {
    it('should create a product with valid data', async () => {
      const mockProduct = {
        id: '1',
        name: 'New Product',
        slug: 'new-product',
        sku: 'NEW-001',
        description: 'New product description',
        price: 200,
        images: '["https://example.com/image.jpg"]',
        categoryId: 'cat-1',
        stock: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'cat-1', name: 'Test', slug: 'test' },
        brand: null,
      }

      mockDb.product.findUnique.mockResolvedValue(null) // SKU doesn't exist
      mockDb.product.create.mockResolvedValue(mockProduct as unknown as Awaited<ReturnType<typeof mockDb.product.create>>)
      mockDb.auditLog.create.mockResolvedValue({} as never)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          sku: 'NEW-001',
          description: 'New product description',
          price: 200,
          images: ['https://example.com/image.jpg'],
          categoryId: 'cat-1',
          stock: 5,
        }),
      })

      // Set headers for auth
      request.headers.set('x-user-id', 'user-1')
      request.headers.set('x-user-role', 'admin')

      const response = await POST(request)
      
      expect(response.status).toBe(201)
    })

    it('should reject duplicate SKU', async () => {
      mockDb.product.findUnique.mockResolvedValue({
        id: 'existing',
        sku: 'EXISTING-001',
      } as unknown as Awaited<ReturnType<typeof mockDb.product.findUnique>>)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          sku: 'EXISTING-001',
          description: 'New product description',
          price: 200,
          images: ['https://example.com/image.jpg'],
          categoryId: 'cat-1',
        }),
      })

      request.headers.set('x-user-id', 'user-1')
      request.headers.set('x-user-role', 'admin')

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should reject invalid price', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          sku: 'NEW-001',
          description: 'New product description',
          price: -100, // Invalid negative price
          images: ['https://example.com/image.jpg'],
          categoryId: 'cat-1',
        }),
      })

      request.headers.set('x-user-id', 'user-1')
      request.headers.set('x-user-role', 'admin')

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })

    it('should reject empty images array', async () => {
      mockDb.product.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          sku: 'NEW-001',
          description: 'New product description',
          price: 200,
          images: [], // Empty array
          categoryId: 'cat-1',
        }),
      })

      request.headers.set('x-user-id', 'user-1')
      request.headers.set('x-user-role', 'admin')

      const response = await POST(request)
      
      expect(response.status).toBe(400)
    })
  })
})
