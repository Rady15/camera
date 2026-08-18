/**
 * API Route Protection Middleware
 * Provides authentication and role-based authorization for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verify } from 'jsonwebtoken'

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<string, number> = {
  customer: 1,
  support: 2,
  manager: 3,
  admin: 4,
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'

interface JWTPayload {
  id: string
  email: string
  role: string
  name: string
}

// Route configuration for protection
export interface RouteConfig {
  // Required role(s) to access this route
  requiredRoles?: string[]
  // Allow unauthenticated access (public routes)
  public?: boolean
  // Allow any authenticated user
  authenticated?: boolean
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  return requiredRoles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role] || 0
    return userLevel >= requiredLevel
  })
}

/**
 * Get current session from request
 */
export async function getSessionFromRequest() {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

/**
 * Verify JWT token from Authorization header
 */
export function verifyJwtToken(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = verify(token, JWT_SECRET) as JWTPayload
    
    return decoded
  } catch (error) {
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
  email?: string
  name?: string
} | null> {
  // First, try NextAuth session
  const session = await getSessionFromRequest()
  if (session?.user) {
    return {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      name: session.user.name,
    }
  }
  
  // Second, try JWT token from Authorization header
  const jwtPayload = verifyJwtToken(request)
  if (jwtPayload) {
    return {
      id: jwtPayload.id,
      role: jwtPayload.role,
      email: jwtPayload.email,
      name: jwtPayload.name,
    }
  }
  
  return null
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: 401 }
  )
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden - Insufficient permissions') {
  return NextResponse.json(
    { error: message, code: 'FORBIDDEN' },
    { status: 403 }
  )
}

/**
 * Create bad request response
 */
export function badRequestResponse(message: string, details?: unknown) {
  return NextResponse.json(
    { error: message, code: 'BAD_REQUEST', details },
    { status: 400 }
  )
}

/**
 * Create rate limit response
 */
export function rateLimitResponse(retryAfter: number = 60) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
    { 
      status: 429,
      headers: { 'Retry-After': String(retryAfter) }
    }
  )
}

/**
 * Protect an API route handler
 * Supports both NextAuth session and JWT token authentication
 * 
 * @example
 * ```ts
 * // In your API route
 * export const GET = protectApiRoute(
 *   async (request, context) => {
 *     // Your handler code
 *     return NextResponse.json({ data: 'protected data' })
 *   },
 *   { requiredRoles: ['admin'] }
 * )
 * ```
 */
export function protectApiRoute<T = unknown>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>,
  config: RouteConfig = {}
): (request: NextRequest, context: T) => Promise<NextResponse> {
  return async (request: NextRequest, context: T) => {
    // If route is public, allow access
    if (config.public) {
      return handler(request, context)
    }

    // Get authenticated user (from session or JWT token)
    const user = await getAuthenticatedUser(request)

    // Check if user is authenticated
    if (!user) {
      return unauthorizedResponse('You must be logged in to access this resource')
    }

    // If only authentication is required (any logged-in user)
    if (config.authenticated && !config.requiredRoles) {
      // Add user info to request headers for use in handler
      request.headers.set('x-user-id', user.id)
      request.headers.set('x-user-role', user.role)
      return handler(request, context)
    }

    // Check role-based access
    if (config.requiredRoles && config.requiredRoles.length > 0) {
      const userRole = user.role
      
      if (!hasRequiredRole(userRole, config.requiredRoles)) {
        return forbiddenResponse(`This action requires ${config.requiredRoles.join(' or ')} role`)
      }
    }

    // Add user info to request headers
    request.headers.set('x-user-id', user.id)
    request.headers.set('x-user-role', user.role)

    return handler(request, context)
  }
}

/**
 * Extract user info from request headers (set by protectApiRoute)
 */
export function getUserFromHeaders(request: NextRequest) {
  return {
    id: request.headers.get('x-user-id'),
    role: request.headers.get('x-user-role'),
  }
}

/**
 * Common route configurations
 */
export const routeConfigs = {
  // Public routes (no auth required)
  public: { public: true } as RouteConfig,
  
  // Any authenticated user
  authenticated: { authenticated: true } as RouteConfig,
  
  // Admin only
  adminOnly: { requiredRoles: ['admin'] } as RouteConfig,
  
  // Manager and above
  managerOnly: { requiredRoles: ['admin', 'manager'] } as RouteConfig,
  
  // Staff (support, manager, admin)
  staffOnly: { requiredRoles: ['admin', 'manager', 'support'] } as RouteConfig,
  
  // Customer and above (any logged in user with role)
  customerOnly: { requiredRoles: ['customer', 'support', 'manager', 'admin'] } as RouteConfig,
}

/**
 * Log API access for audit
 */
export async function logApiAccess(
  request: NextRequest,
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string
) {
  try {
    const { db } = await import('@/lib/db')
    
    await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent'),
      }
    })
  } catch (error) {
    console.error('Failed to log API access:', error)
  }
}
