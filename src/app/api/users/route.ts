/**
 * Users API - Admin User Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs, getUserFromHeaders } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'
import { validateBody, updateUserSchema } from '@/lib/validations'

// GET /api/users - Get all users (Admin only)
export const GET = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search')
        const role = searchParams.get('role')
        const status = searchParams.get('status')

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ]
        }

        if (role) {
          where.role = role
        }

        if (status === 'active') {
          where.isActive = true
        } else if (status === 'inactive') {
          where.isActive = false
        }

        const [users, total] = await Promise.all([
          db.user.findMany({
            where,
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              role: true,
              avatar: true,
              isActive: true,
              emailVerified: true,
              lastLogin: true,
              createdAt: true,
              _count: {
                select: {
                  orders: true,
                  reviews: true,
                  wishlists: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          db.user.count({ where }),
        ])

        // Get total spent per user
        const usersWithStats = await Promise.all(
          users.map(async (user) => {
            const orders = await db.order.findMany({
              where: { userId: user.id, paymentStatus: 'paid' },
              select: { total: true },
            })
            const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
            return { ...user, totalSpent }
          })
        )

        return NextResponse.json({
          users: usersWithStats,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      } catch (error) {
        console.error('Failed to fetch users:', error)
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }
    },
    routeConfigs.staffOnly
  ),
  'admin'
)

// PATCH /api/users - Update user (Admin only)
export const PATCH = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)

      const validation = await validateBody(request, updateUserSchema)
      if (!validation.success) {
        return validation.error
      }

      const body = await request.json()
      const { userId, role, isActive, ...updateData } = body

      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required', code: 'MISSING_USER_ID' },
          { status: 400 }
        )
      }

      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { id: userId },
        })

        if (!existingUser) {
          return NextResponse.json(
            { error: 'User not found', code: 'USER_NOT_FOUND' },
            { status: 404 }
          )
        }

        // Prevent admin from deactivating themselves
        if (userId === user.id && isActive === false) {
          return NextResponse.json(
            { error: 'Cannot deactivate your own account', code: 'FORBIDDEN' },
            { status: 403 }
          )
        }

        // Prepare update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}

        if (validation.data.name) data.name = validation.data.name
        if (validation.data.phone) data.phone = validation.data.phone
        if (role !== undefined) data.role = role
        if (isActive !== undefined) data.isActive = isActive

        const updatedUser = await db.user.update({
          where: { id: userId },
          data,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            isActive: true,
          },
        })

        // Log the action
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'update_user',
            entityType: 'user',
            entityId: userId,
            oldValue: JSON.stringify(existingUser),
            newValue: JSON.stringify(updatedUser),
          },
        })

        return NextResponse.json({ user: updatedUser })
      } catch (error) {
        console.error('Failed to update user:', error)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)

// DELETE /api/users - Soft delete user (Admin only)
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('userId')

      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required', code: 'MISSING_USER_ID' },
          { status: 400 }
        )
      }

      // Prevent admin from deleting themselves
      if (userId === user.id) {
        return NextResponse.json(
          { error: 'Cannot delete your own account', code: 'FORBIDDEN' },
          { status: 403 }
        )
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { id: userId },
        })

        if (!existingUser) {
          return NextResponse.json(
            { error: 'User not found', code: 'USER_NOT_FOUND' },
            { status: 404 }
          )
        }

        const isHardDelete = searchParams.get('hard') === 'true'

        if (isHardDelete) {
          // Hard delete permanently removes the user from DB
          await db.user.delete({
            where: { id: userId },
          })
          
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: 'hard_delete_user',
              entityType: 'user',
              entityId: userId,
              oldValue: JSON.stringify(existingUser),
            },
          })
          
          return NextResponse.json({ success: true, message: 'User permanently deleted' })
        } else {
          // Soft delete by deactivating
          await db.user.update({
            where: { id: userId },
            data: { isActive: false },
          })

          // Log the action
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: 'delete_user',
              entityType: 'user',
              entityId: userId,
              oldValue: JSON.stringify(existingUser),
            },
          })

          return NextResponse.json({ success: true, message: 'User deactivated successfully' })
        }
      } catch (error) {
        console.error('Failed to delete user:', error)
        return NextResponse.json(
          { error: 'Failed to delete user' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)
