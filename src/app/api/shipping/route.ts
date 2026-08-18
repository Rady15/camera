/**
 * Shipping Zones API
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'

// GET /api/shipping - Get all shipping zones
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const zones = await db.shippingZone.findMany({
        orderBy: { createdAt: 'desc' },
      })

      // Parse regions JSON for each zone
      const parsedZones = zones.map(zone => ({
        ...zone,
        regions: zone.regions ? JSON.parse(zone.regions) : [],
      }))

      return NextResponse.json({ zones: parsedZones })
    } catch (error) {
      console.error('Failed to fetch shipping zones:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shipping zones' },
        { status: 500 }
      )
    }
  },
  'public'
)

// POST /api/shipping - Create new shipping zone (admin only)
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const body = await request.json()
      const { name, regions, baseRate, freeAbove, estimatedDays, isActive } = body

      if (!name || baseRate === undefined) {
        return NextResponse.json(
          { error: 'Name and base rate are required', code: 'MISSING_FIELDS' },
          { status: 400 }
        )
      }

      try {
        const zone = await db.shippingZone.create({
          data: {
            name,
            regions: JSON.stringify(regions || []),
            baseRate: parseFloat(baseRate),
            freeAbove: freeAbove ? parseFloat(freeAbove) : null,
            estimatedDays: estimatedDays || null,
            isActive: isActive !== undefined ? isActive : true,
          },
        })

        return NextResponse.json({
          zone: {
            ...zone,
            regions: JSON.parse(zone.regions),
          }
        }, { status: 201 })
      } catch (error) {
        console.error('Failed to create shipping zone:', error)
        return NextResponse.json(
          { error: 'Failed to create shipping zone' },
          { status: 500 }
        )
      }
    },
    routeConfigs.managerOnly
  ),
  'admin'
)

// PATCH /api/shipping - Update shipping zone (admin only)
export const PATCH = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const body = await request.json()
      const { zoneId, ...updateData } = body

      if (!zoneId) {
        return NextResponse.json(
          { error: 'Zone ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        const existingZone = await db.shippingZone.findUnique({
          where: { id: zoneId },
        })

        if (!existingZone) {
          return NextResponse.json(
            { error: 'Shipping zone not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        // Prepare update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}

        if (updateData.name !== undefined) data.name = updateData.name
        if (updateData.regions !== undefined) data.regions = JSON.stringify(updateData.regions)
        if (updateData.baseRate !== undefined) data.baseRate = parseFloat(updateData.baseRate)
        if (updateData.freeAbove !== undefined) data.freeAbove = updateData.freeAbove ? parseFloat(updateData.freeAbove) : null
        if (updateData.estimatedDays !== undefined) data.estimatedDays = updateData.estimatedDays || null
        if (updateData.isActive !== undefined) data.isActive = updateData.isActive

        const zone = await db.shippingZone.update({
          where: { id: zoneId },
          data,
        })

        return NextResponse.json({
          zone: {
            ...zone,
            regions: JSON.parse(zone.regions),
          }
        })
      } catch (error) {
        console.error('Failed to update shipping zone:', error)
        return NextResponse.json(
          { error: 'Failed to update shipping zone' },
          { status: 500 }
        )
      }
    },
    routeConfigs.managerOnly
  ),
  'admin'
)

// DELETE /api/shipping - Delete shipping zone (admin only)
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const { searchParams } = new URL(request.url)
      const zoneId = searchParams.get('zoneId')

      if (!zoneId) {
        return NextResponse.json(
          { error: 'Zone ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        await db.shippingZone.delete({
          where: { id: zoneId },
        })

        return NextResponse.json({ success: true, message: 'Shipping zone deleted' })
      } catch (error) {
        console.error('Failed to delete shipping zone:', error)
        return NextResponse.json(
          { error: 'Failed to delete shipping zone' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)
