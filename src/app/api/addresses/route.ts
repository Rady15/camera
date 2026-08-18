/**
 * Addresses API - User Shipping Addresses
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs, getUserFromHeaders } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'
import { validateBody, addressSchema } from '@/lib/validations'

// GET /api/addresses - Get user addresses
export const GET = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)

      try {
        const addresses = await db.address.findMany({
          where: { userId: user.id },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' },
          ],
        })

        return NextResponse.json({ addresses })
      } catch (error) {
        console.error('Failed to fetch addresses:', error)
        return NextResponse.json(
          { error: 'Failed to fetch addresses' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'public'
)

// POST /api/addresses - Create new address
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)

      const validation = await validateBody(request, addressSchema)
      if (!validation.success) {
        return validation.error
      }

      const data = validation.data

      try {
        // If this is set as default, remove default from other addresses
        if (data.isDefault) {
          await db.address.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
          })
        }

        // Check if this is the first address, make it default
        const existingCount = await db.address.count({
          where: { userId: user.id },
        })

        const address = await db.address.create({
          data: {
            userId: user.id,
            name: data.name,
            phone: data.phone,
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country || 'Egypt',
            isDefault: data.isDefault ?? existingCount === 0,
          },
        })

        return NextResponse.json({ address }, { status: 201 })
      } catch (error) {
        console.error('Failed to create address:', error)
        return NextResponse.json(
          { error: 'Failed to create address' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'public'
)

// PATCH /api/addresses - Update address
export const PATCH = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const body = await request.json()
      const { addressId, ...updateData } = body

      if (!addressId) {
        return NextResponse.json(
          { error: 'Address ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        // Verify ownership
        const existingAddress = await db.address.findFirst({
          where: { id: addressId, userId: user.id },
        })

        if (!existingAddress) {
          return NextResponse.json(
            { error: 'Address not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        // If setting as default, remove default from others
        if (updateData.isDefault) {
          await db.address.updateMany({
            where: { userId: user.id, isDefault: true },
            data: { isDefault: false },
          })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}
        if (updateData.name) data.name = updateData.name
        if (updateData.phone) data.phone = updateData.phone
        if (updateData.street) data.street = updateData.street
        if (updateData.city) data.city = updateData.city
        if (updateData.state) data.state = updateData.state
        if (updateData.zipCode) data.zipCode = updateData.zipCode
        if (updateData.country) data.country = updateData.country
        if (updateData.isDefault !== undefined) data.isDefault = updateData.isDefault

        const address = await db.address.update({
          where: { id: addressId },
          data,
        })

        return NextResponse.json({ address })
      } catch (error) {
        console.error('Failed to update address:', error)
        return NextResponse.json(
          { error: 'Failed to update address' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'public'
)

// DELETE /api/addresses - Delete address
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const { searchParams } = new URL(request.url)
      const addressId = searchParams.get('addressId')

      if (!addressId) {
        return NextResponse.json(
          { error: 'Address ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        // Verify ownership
        const existingAddress = await db.address.findFirst({
          where: { id: addressId, userId: user.id },
        })

        if (!existingAddress) {
          return NextResponse.json(
            { error: 'Address not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        await db.address.delete({
          where: { id: addressId },
        })

        // If deleted address was default, set another as default
        if (existingAddress.isDefault) {
          const nextAddress = await db.address.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
          })

          if (nextAddress) {
            await db.address.update({
              where: { id: nextAddress.id },
              data: { isDefault: true },
            })
          }
        }

        return NextResponse.json({ success: true, message: 'Address deleted successfully' })
      } catch (error) {
        console.error('Failed to delete address:', error)
        return NextResponse.json(
          { error: 'Failed to delete address' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'public'
)
