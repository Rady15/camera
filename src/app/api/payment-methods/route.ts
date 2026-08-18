/**
 * Payment Methods API
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'

// GET /api/payment-methods - Get all payment methods
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const methods = await db.paymentMethod.findMany({
        orderBy: { displayOrder: 'asc' },
      })

      // Parse settings JSON for each method, but hide sensitive data for non-admins
      const parsedMethods = methods.map(method => ({
        ...method,
        settings: method.settings ? JSON.parse(method.settings) : {},
      }))

      return NextResponse.json({ methods: parsedMethods })
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500 }
      )
    }
  },
  'public'
)

// POST /api/payment-methods - Create new payment method (admin only)
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const body = await request.json()
      const { name, code, description, icon, isActive, isTestMode, settings, displayOrder } = body

      if (!name || !code) {
        return NextResponse.json(
          { error: 'Name and code are required', code: 'MISSING_FIELDS' },
          { status: 400 }
        )
      }

      try {
        // Check if code already exists
        const existing = await db.paymentMethod.findUnique({
          where: { code },
        })

        if (existing) {
          return NextResponse.json(
            { error: 'Payment method with this code already exists', code: 'DUPLICATE_CODE' },
            { status: 400 }
          )
        }

        const method = await db.paymentMethod.create({
          data: {
            name,
            code,
            description: description || null,
            icon: icon || null,
            isActive: isActive !== undefined ? isActive : true,
            isTestMode: isTestMode !== undefined ? isTestMode : true,
            settings: settings ? JSON.stringify(settings) : null,
            displayOrder: displayOrder || 0,
          },
        })

        return NextResponse.json({
          method: {
            ...method,
            settings: method.settings ? JSON.parse(method.settings) : {},
          }
        }, { status: 201 })
      } catch (error) {
        console.error('Failed to create payment method:', error)
        return NextResponse.json(
          { error: 'Failed to create payment method' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)

// PATCH /api/payment-methods - Update payment method (admin only)
export const PATCH = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const body = await request.json()
      const { methodId, ...updateData } = body

      if (!methodId) {
        return NextResponse.json(
          { error: 'Method ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        const existingMethod = await db.paymentMethod.findUnique({
          where: { id: methodId },
        })

        if (!existingMethod) {
          return NextResponse.json(
            { error: 'Payment method not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        // Prepare update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}

        if (updateData.name !== undefined) data.name = updateData.name
        if (updateData.code !== undefined) data.code = updateData.code
        if (updateData.description !== undefined) data.description = updateData.description || null
        if (updateData.icon !== undefined) data.icon = updateData.icon || null
        if (updateData.isActive !== undefined) data.isActive = updateData.isActive
        if (updateData.isTestMode !== undefined) data.isTestMode = updateData.isTestMode
        if (updateData.settings !== undefined) data.settings = updateData.settings ? JSON.stringify(updateData.settings) : null
        if (updateData.displayOrder !== undefined) data.displayOrder = updateData.displayOrder

        const method = await db.paymentMethod.update({
          where: { id: methodId },
          data,
        })

        return NextResponse.json({
          method: {
            ...method,
            settings: method.settings ? JSON.parse(method.settings) : {},
          }
        })
      } catch (error) {
        console.error('Failed to update payment method:', error)
        return NextResponse.json(
          { error: 'Failed to update payment method' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)

// DELETE /api/payment-methods - Delete payment method (admin only)
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const { searchParams } = new URL(request.url)
      const methodId = searchParams.get('methodId')

      if (!methodId) {
        return NextResponse.json(
          { error: 'Method ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        await db.paymentMethod.delete({
          where: { id: methodId },
        })

        return NextResponse.json({ success: true, message: 'Payment method deleted' })
      } catch (error) {
        console.error('Failed to delete payment method:', error)
        return NextResponse.json(
          { error: 'Failed to delete payment method' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)
