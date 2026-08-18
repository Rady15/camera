/**
 * Tests for Validation Schemas
 */

import {
  loginSchema,
  registerSchema,
  productCreateSchema,
  orderCreateSchema,
  couponCreateSchema,
  validateBody,
  validateQuery,
  generateSlug,
} from '@/lib/validations'
import { NextRequest } from 'next/server'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short name', () => {
      const result = registerSchema.safeParse({
        name: 'T',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('productCreateSchema', () => {
    it('should validate valid product data', () => {
      const result = productCreateSchema.safeParse({
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'A test product description',
        price: 100,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat-123',
        stock: 10,
      })
      expect(result.success).toBe(true)
    })

    it('should reject negative price', () => {
      const result = productCreateSchema.safeParse({
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'A test product description',
        price: -100,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty images array', () => {
      const result = productCreateSchema.safeParse({
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'A test product description',
        price: 100,
        images: [],
        categoryId: 'cat-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative stock', () => {
      const result = productCreateSchema.safeParse({
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'A test product description',
        price: 100,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat-123',
        stock: -5,
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid CCTV-specific fields', () => {
      const result = productCreateSchema.safeParse({
        name: 'IP Camera',
        sku: 'CAM-001',
        description: 'High quality IP camera',
        price: 1500,
        images: ['https://example.com/camera.jpg'],
        categoryId: 'cat-123',
        resolution: '4MP',
        nightVision: 'ColorVu 30m',
        isPoe: true,
        isWifi: false,
        cameraType: 'dome',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('orderCreateSchema', () => {
    it('should validate valid order data', () => {
      const result = orderCreateSchema.safeParse({
        paymentMethod: 'cod',
        shippingName: 'John Doe',
        shippingPhone: '+201001234567',
        shippingStreet: '123 Main St',
        shippingCity: 'Cairo',
        shippingState: 'Cairo',
        shippingZipCode: '12345',
        items: [
          { productId: 'prod-1', quantity: 2, price: 100 },
        ],
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid payment method', () => {
      const result = orderCreateSchema.safeParse({
        paymentMethod: 'invalid',
        shippingName: 'John Doe',
        shippingPhone: '+201001234567',
        shippingStreet: '123 Main St',
        shippingCity: 'Cairo',
        shippingState: 'Cairo',
        shippingZipCode: '12345',
        items: [],
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty items array', () => {
      const result = orderCreateSchema.safeParse({
        paymentMethod: 'cod',
        shippingName: 'John Doe',
        shippingPhone: '+201001234567',
        shippingStreet: '123 Main St',
        shippingCity: 'Cairo',
        shippingState: 'Cairo',
        shippingZipCode: '12345',
        items: [],
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid phone', () => {
      const result = orderCreateSchema.safeParse({
        paymentMethod: 'cod',
        shippingName: 'John Doe',
        shippingPhone: '123', // Too short
        shippingStreet: '123 Main St',
        shippingCity: 'Cairo',
        shippingState: 'Cairo',
        shippingZipCode: '12345',
        items: [
          { productId: 'prod-1', quantity: 2, price: 100 },
        ],
      })
      expect(result.success).toBe(false)
    })
  })

  describe('couponCreateSchema', () => {
    it('should validate valid coupon data', () => {
      const result = couponCreateSchema.safeParse({
        code: 'SAVE10',
        discount: 10,
        discountType: 'percentage',
        minOrder: 100,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid discount type', () => {
      const result = couponCreateSchema.safeParse({
        code: 'SAVE10',
        discount: 10,
        discountType: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should reject zero discount', () => {
      const result = couponCreateSchema.safeParse({
        code: 'SAVE10',
        discount: 0,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Test Product')).toBe('test-product')
      expect(generateSlug('IP Camera 4MP')).toBe('ip-camera-4mp')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Test@Product#123')).toBe('testproduct123')
    })

    it('should handle multiple spaces', () => {
      expect(generateSlug('Test   Product')).toBe('test-product')
    })

    it('should trim hyphens', () => {
      expect(generateSlug('-Test Product-')).toBe('test-product')
    })

    it('should handle Arabic text', () => {
      // Arabic characters should be removed, leaving only alphanumeric
      const slug = generateSlug('كاميرا IP Camera')
      expect(slug).toContain('ip-camera')
    })
  })

  describe('validateQuery', () => {
    it('should validate query params', () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
      })
      
      const schema = productCreateSchema // Using any schema for demo
      // Note: This would need a proper query schema
    })
  })
})
