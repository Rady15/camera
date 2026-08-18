/**
 * Rate Limiting for API Routes
 * Simple in-memory rate limiting for development
 * For production, use Redis-based solutions like @upstash/ratelimit
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (resets on server restart)
// For production, replace with Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configurations
export const rateLimitConfigs = {
  // Public API routes - more lenient
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Authentication routes - stricter
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },
  // Admin routes - moderate
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
  },
  // Checkout/Payment - very strict
  checkout: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
}

export type RateLimitConfigName = keyof typeof rateLimitConfigs
export type RateLimitConfig = typeof rateLimitConfigs[RateLimitConfigName]

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback for development
  return '127.0.0.1'
}

/**
 * Clean up expired entries from the store
 */
function cleanupStore(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Check rate limit for a request
 * Returns null if allowed, or an object with limit info if blocked
 */
export function checkRateLimit(
  request: NextRequest,
  configName: RateLimitConfigName = 'public',
  identifier?: string
): { allowed: true } | { allowed: false; retryAfter: number } {
  const config = rateLimitConfigs[configName]
  return checkRateLimitWithConfig(request, config, identifier)
}

/**
 * Check rate limit with custom config
 */
export function checkRateLimitWithConfig(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): { allowed: true } | { allowed: false; retryAfter: number } {
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupStore()
  }
  
  const ip = getClientIp(request)
  const key = identifier ? `${ip}:${identifier}` : ip
  const now = Date.now()
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return { allowed: true }
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)
  
  return { allowed: true }
}

/**
 * Create rate limit response
 */
export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(rateLimitConfigs.public.maxRequests),
        'X-RateLimit-Remaining': '0',
      },
    }
  )
}

/**
 * Rate limit middleware wrapper for API routes
 * 
 * @example
 * ```ts
 * export const POST = withRateLimit(
 *   async (request) => {
 *     // Your handler code
 *     return NextResponse.json({ success: true })
 *   },
 *   'auth' // Use auth rate limit config
 * )
 * ```
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
  configName: RateLimitConfigName = 'public',
  identifier?: string
): (request: NextRequest, context?: unknown) => Promise<NextResponse> {
  return async (request: NextRequest, context?: unknown) => {
    const result = checkRateLimit(request, configName, identifier)
    
    if (!result.allowed) {
      return rateLimitResponse(result.retryAfter)
    }
    
    return handler(request, context)
  }
}

/**
 * Combined rate limit and auth protection wrapper
 * Applies rate limiting first, then auth
 * 
 * @example
 * ```ts
 * export const POST = withAuthAndRateLimit(
 *   async (request, context) => {
 *     // Your handler code
 *     return NextResponse.json({ success: true })
 *   },
 *   { requiredRoles: ['admin'] },
 *   'admin' // rate limit config
 * )
 * ```
 */
export function withAuthAndRateLimit(
  handler: (request: NextRequest, context: unknown) => Promise<NextResponse>,
  authConfig: { requiredRoles?: string[]; public?: boolean; authenticated?: boolean },
  rateLimitConfig: RateLimitConfigName = 'public'
): (request: NextRequest, context: unknown) => Promise<NextResponse> {
  // Import protectApiRoute dynamically to avoid circular dependency
  return withRateLimit(
    async (request: NextRequest, context: unknown) => {
      const { protectApiRoute } = await import('./auth-middleware')
      const protectedHandler = protectApiRoute(handler, authConfig)
      return protectedHandler(request, context)
    },
    rateLimitConfig
  )
}
