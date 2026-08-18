/**
 * Tests for Auth Middleware
 */

import { hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-middleware'

describe('Auth Middleware', () => {
  describe('hasRequiredRole', () => {
    it('should return true when user has exact required role', () => {
      expect(hasRequiredRole('admin', ['admin'])).toBe(true)
      expect(hasRequiredRole('manager', ['manager'])).toBe(true)
      expect(hasRequiredRole('customer', ['customer'])).toBe(true)
    })

    it('should return true when user has higher role than required', () => {
      expect(hasRequiredRole('admin', ['manager'])).toBe(true)
      expect(hasRequiredRole('admin', ['support'])).toBe(true)
      expect(hasRequiredRole('manager', ['support'])).toBe(true)
    })

    it('should return false when user has lower role than required', () => {
      expect(hasRequiredRole('customer', ['admin'])).toBe(false)
      expect(hasRequiredRole('support', ['admin'])).toBe(false)
      expect(hasRequiredRole('customer', ['manager'])).toBe(false)
    })

    it('should return true when any of the required roles match', () => {
      expect(hasRequiredRole('manager', ['admin', 'manager'])).toBe(true)
      expect(hasRequiredRole('support', ['admin', 'support'])).toBe(true)
      expect(hasRequiredRole('admin', ['manager', 'support'])).toBe(true)
    })

    it('should handle unknown roles', () => {
      expect(hasRequiredRole('unknown', ['admin'])).toBe(false)
      expect(hasRequiredRole('admin', ['unknown'])).toBe(true) // admin can access anything
    })
  })

  describe('unauthorizedResponse', () => {
    it('should return 401 status with default message', () => {
      const response = unauthorizedResponse()
      expect(response.status).toBe(401)
    })

    it('should return custom message', () => {
      const response = unauthorizedResponse('Custom error message')
      expect(response.status).toBe(401)
    })
  })

  describe('forbiddenResponse', () => {
    it('should return 403 status with default message', () => {
      const response = forbiddenResponse()
      expect(response.status).toBe(403)
    })

    it('should return custom message', () => {
      const response = forbiddenResponse('Custom forbidden message')
      expect(response.status).toBe(403)
    })
  })
})
