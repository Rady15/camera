/**
 * Next.js Middleware - Security Protection Layer
 * Protects admin routes and sensitive pages
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { jwtVerify } from 'jose'

// Rate limiting store (in-memory, resets on server restart)
// For production, use Redis or @upstash/ratelimit
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configurations
const rateLimits = {
  // General API requests
  api: { windowMs: 60 * 1000, maxRequests: 100 },
  // Authentication endpoints
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  // Admin endpoints
  admin: { windowMs: 60 * 1000, maxRequests: 50 },
}

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/auth',
  '/auth/login',
  '/auth/register',
  '/products',
  '/categories',
  '/brands',
  '/cart',
  '/about',
  '/contact',
  '/api/auth',
  '/api/products',
  '/api/categories',
  '/api/brands',
  '/api/seed',
]

// Check if path matches public paths
function isPublicPath(pathname: string): boolean {
  // Exact match
  if (publicPaths.includes(pathname)) return true
  
  // Check for dynamic public paths
  if (pathname.startsWith('/products/')) return true
  if (pathname.startsWith('/categories/')) return true
  if (pathname.startsWith('/brands/')) return true
  if (pathname.startsWith('/api/products')) return true
  if (pathname.startsWith('/api/categories')) return true
  if (pathname.startsWith('/api/brands')) return true
  if (pathname.startsWith('/api/auth/')) return true
  
  // Static files
  if (pathname.startsWith('/_next/')) return true
  if (pathname.startsWith('/favicon')) return true
  if (pathname.startsWith('/images/')) return true
  
  return false
}

// Check if path is an admin path
function isAdminPath(pathname: string): boolean {
  if (pathname === '/api/admin/setup') return false
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
}

// Check if path is an auth API path
function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/auth/login') || 
         pathname.startsWith('/api/auth/register')
}

// Get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIp) return realIp
  
  return '127.0.0.1'
}

// Check rate limit
function checkRateLimit(
  ip: string, 
  type: 'api' | 'auth' | 'admin'
): { allowed: boolean; retryAfter?: number } {
  const config = rateLimits[type]
  const now = Date.now()
  const key = `${ip}:${type}`
  
  // Clean up expired entries (10% chance)
  if (Math.random() < 0.1) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k)
    }
  }
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true }
  }
  
  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) }
  }
  
  entry.count++
  rateLimitStore.set(key, entry)
  return { allowed: true }
}

/**
 * Verify JWT token from Authorization header
 */
async function verifyJwtFromHeader(request: NextRequest): Promise<{ id: string; role: string; email: string } | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production')
    const { payload } = await jwtVerify(token, secret)
    
    return payload as unknown as { id: string; role: string; email: string }
  } catch {
    // Token is invalid or expired
    return null
  }
}

/**
 * Get authenticated user from either NextAuth session or JWT token
 */
async function getAuthenticatedUser(request: NextRequest): Promise<{
  id: string
  role: string
  email: string
} | null> {
  // First, try NextAuth session token
  const nextAuthToken = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  if (nextAuthToken) {
    return {
      id: nextAuthToken.id as string,
      role: nextAuthToken.role as string,
      email: nextAuthToken.email as string,
    }
  }
  
  // Second, try JWT from Authorization header
  const jwtUser = await verifyJwtFromHeader(request)
  if (jwtUser) {
    return jwtUser
  }
  
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)
  
  // ========================================
  // 1. DISABLE SEED ROUTE IN PRODUCTION
  // ========================================
  if (pathname === '/api/seed' && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production', code: 'DISABLED' },
      { status: 403 }
    )
  }
  
  // ========================================
  // 2. RATE LIMITING
  // ========================================
  let rateLimitType: 'api' | 'auth' | 'admin' = 'api'
  
  if (isAdminPath(pathname)) {
    rateLimitType = 'admin'
  } else if (isAuthApiPath(pathname)) {
    rateLimitType = 'auth'
  }
  
  const rateCheck = checkRateLimit(ip, rateLimitType)
  
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.', 
        code: 'RATE_LIMITED',
        retryAfter: rateCheck.retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfter || 60),
          'X-RateLimit-Limit': String(rateLimits[rateLimitType].maxRequests),
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }
  
  // ========================================
  // 3. ADMIN ROUTES PROTECTION
  // ========================================
  if (isAdminPath(pathname)) {
    // Get authenticated user (supports both NextAuth and JWT token)
    const user = await getAuthenticatedUser(request)
    
    // Not authenticated
    if (!user) {
      // API routes return JSON
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }
      
      // Page routes redirect to login
      const loginUrl = new URL('/auth', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      loginUrl.searchParams.set('error', 'AdminAccessRequired')
      return NextResponse.redirect(loginUrl)
    }
    
    // Not admin role (check role hierarchy: admin > manager > support > customer)
    if (user.role !== 'admin' && user.role !== 'manager') {
      // API routes return JSON
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required', code: 'FORBIDDEN' },
          { status: 403 }
        )
      }
      
      // Page routes redirect with error
      const homeUrl = new URL('/', request.url)
      homeUrl.searchParams.set('error', 'InsufficientPermissions')
      return NextResponse.redirect(homeUrl)
    }
    
    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role)
      response.headers.set('x-user-email', user.email)
      return response
    }
  }
  
  // ========================================
  // 4. SECURITY HEADERS
  // ========================================
  const response = NextResponse.next()
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy (basic)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https: http:;
    connect-src 'self' https:;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    '/api/admin/:path*',
    // Auth routes
    '/api/auth/login',
    '/api/auth/register',
    // Protected API routes
    '/api/orders/:path*',
    '/api/cart/:path*',
    '/api/wishlist/:path*',
    '/api/user/:path*',
    '/api/seed',
    // Products API (partial protection)
    '/api/products',
  ],
}
