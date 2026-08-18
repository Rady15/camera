/**
 * Tests for Rate Limiting
 */

import { checkRateLimit, rateLimitConfigs, rateLimitResponse } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

// Mock NextRequest
function createMockRequest(options: {
  ip?: string
  forwardedFor?: string
} = {}): NextRequest {
  const headers = new Headers()
  if (options.forwardedFor) {
    headers.set('x-forwarded-for', options.forwardedFor)
  }
  if (options.ip) {
    headers.set('x-real-ip', options.ip)
  }
  
  return new NextRequest('http://localhost:3000/api/test', { headers })
}

describe('Rate Limiting', () => {
  describe('rateLimitConfigs', () => {
    it('should have public config', () => {
      expect(rateLimitConfigs.public).toBeDefined()
      expect(rateLimitConfigs.public.windowMs).toBe(60000)
      expect(rateLimitConfigs.public.maxRequests).toBe(100)
    })

    it('should have auth config with stricter limits', () => {
      expect(rateLimitConfigs.auth).toBeDefined()
      expect(rateLimitConfigs.auth.windowMs).toBe(900000) // 15 minutes
      expect(rateLimitConfigs.auth.maxRequests).toBe(10)
    })

    it('should have admin config', () => {
      expect(rateLimitConfigs.admin).toBeDefined()
      expect(rateLimitConfigs.admin.maxRequests).toBe(50)
    })

    it('should have checkout config with strictest limits', () => {
      expect(rateLimitConfigs.checkout).toBeDefined()
      expect(rateLimitConfigs.checkout.maxRequests).toBe(5)
    })
  })

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const request = createMockRequest({ ip: '127.0.0.1' })
      const result = checkRateLimit(request, 'public')
      expect(result.allowed).toBe(true)
    })

    it('should track requests by IP', () => {
      const request1 = createMockRequest({ ip: '192.168.1.1' })
      const request2 = createMockRequest({ ip: '192.168.1.2' })
      
      // Different IPs should have separate limits
      const result1 = checkRateLimit(request1, 'public')
      const result2 = checkRateLimit(request2, 'public')
      
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
    })

    it('should use x-forwarded-for header', () => {
      const request = createMockRequest({ forwardedFor: '10.0.0.1' })
      const result = checkRateLimit(request, 'public')
      expect(result.allowed).toBe(true)
    })
  })

  describe('rateLimitResponse', () => {
    it('should return 429 status', () => {
      const response = rateLimitResponse(60)
      expect(response.status).toBe(429)
    })

    it('should include retry-after header', () => {
      const response = rateLimitResponse(120)
      expect(response.headers.get('Retry-After')).toBe('120')
    })

    it('should include error message in body', async () => {
      const response = rateLimitResponse(60)
      const body = await response.json()
      expect(body.error).toBeDefined()
      expect(body.code).toBe('RATE_LIMITED')
      expect(body.retryAfter).toBe(60)
    })
  })
})
