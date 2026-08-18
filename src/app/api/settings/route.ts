/**
 * Settings API - Store Configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs, getUserFromHeaders } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'

// GET /api/settings - Get all settings
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const group = searchParams.get('group')

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}
      if (group) where.group = group

      const settings = await db.setting.findMany({
        where,
        orderBy: { key: 'asc' },
      })

      // Convert to key-value object
      const settingsObj: Record<string, unknown> = {}
      const settingsByGroup: Record<string, Record<string, unknown>> = {}

      settings.forEach(setting => {
        // Parse value based on type
        let value: unknown = setting.value
        if (setting.type === 'json') {
          try {
            value = JSON.parse(setting.value)
          } catch {
            value = setting.value
          }
        } else if (setting.type === 'boolean') {
          value = setting.value === 'true'
        } else if (setting.type === 'number') {
          value = parseFloat(setting.value)
        }

        settingsObj[setting.key] = value

        if (!settingsByGroup[setting.group]) {
          settingsByGroup[setting.group] = {}
        }
        settingsByGroup[setting.group][setting.key] = value
      })

      return NextResponse.json({
        settings: settingsObj,
        settingsByGroup,
        raw: settings,
      })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }
  },
  'public'
)

// POST /api/settings - Update settings (Admin only)
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const body = await request.json()
      const { settings } = body

      if (!settings || typeof settings !== 'object') {
        return NextResponse.json(
          { error: 'Settings object is required', code: 'MISSING_SETTINGS' },
          { status: 400 }
        )
      }

      try {
        const results = []

        for (const [key, value] of Object.entries(settings)) {
          // Determine type and convert value
          let type = 'text'
          let stringValue = ''

          if (typeof value === 'boolean') {
            type = 'boolean'
            stringValue = String(value)
          } else if (typeof value === 'number') {
            type = 'number'
            stringValue = String(value)
          } else if (typeof value === 'object') {
            type = 'json'
            stringValue = JSON.stringify(value)
          } else {
            stringValue = String(value)
          }

          // Get existing setting to preserve group
          const existing = await db.setting.findUnique({
            where: { key },
          })

          const result = await db.setting.upsert({
            where: { key },
            update: {
              value: stringValue,
              type,
            },
            create: {
              key,
              value: stringValue,
              type,
              group: existing?.group || 'general',
            },
          })

          results.push(result)
        }

        // Log the action
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'update_settings',
            entityType: 'settings',
            newValue: JSON.stringify(settings),
          },
        })

        return NextResponse.json({
          success: true,
          updated: results.length,
          settings: results,
        })
      } catch (error) {
        console.error('Failed to update settings:', error)
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)

// DELETE /api/settings - Delete a setting (Admin only)
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const { searchParams } = new URL(request.url)
      const key = searchParams.get('key')

      if (!key) {
        return NextResponse.json(
          { error: 'Setting key is required', code: 'MISSING_KEY' },
          { status: 400 }
        )
      }

      try {
        await db.setting.delete({
          where: { key },
        })

        // Log the action
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'delete_setting',
            entityType: 'settings',
            entityId: key,
          },
        })

        return NextResponse.json({ success: true, message: 'Setting deleted successfully' })
      } catch (error) {
        console.error('Failed to delete setting:', error)
        return NextResponse.json(
          { error: 'Failed to delete setting' },
          { status: 500 }
        )
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)
