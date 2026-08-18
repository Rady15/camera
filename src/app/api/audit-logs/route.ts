import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'

// GET /api/audit-logs - Get audit logs (ADMIN/MANAGER ONLY)
export const GET = withRateLimit(
  protectApiRoute(
    async (request) => {
      try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const entityType = searchParams.get('entityType')
        const limit = parseInt(searchParams.get('limit') || '100')

        const where: any = {}
        if (action && action !== 'all') {
          where.action = action
        }
        if (entityType && entityType !== 'all') {
          where.entityType = entityType
        }

        const logs = await db.auditLog.findMany({
          where,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        })

        // Transform logs for frontend
        const transformedLogs = logs.map(log => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          userId: log.userId,
          userName: log.user?.name || 'System',
          userEmail: log.user?.email,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt.toISOString(),
          details: generateLogDetails(log),
        }))

        return NextResponse.json({ logs: transformedLogs })
      } catch (error) {
        console.error('Failed to fetch audit logs:', error)
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
      }
    },
    routeConfigs.managerOnly
  ),
  'admin'
)

// POST /api/audit-logs - Create audit log (ADMIN/MANAGER ONLY)
export const POST = withRateLimit(
  protectApiRoute(
    async (request) => {
      try {
        const body = await request.json()
        const { userId, action, entityType, entityId, oldValue, newValue, ipAddress, orderId } = body

        const log = await db.auditLog.create({
          data: {
            userId,
            action,
            entityType,
            entityId,
            oldValue: oldValue ? JSON.stringify(oldValue) : null,
            newValue: newValue ? JSON.stringify(newValue) : null,
            ipAddress,
            orderId,
          }
        })

        return NextResponse.json({ log })
      } catch (error) {
        console.error('Failed to create audit log:', error)
        return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 })
      }
    },
    routeConfigs.managerOnly
  ),
  'admin'
)

// Helper function to generate log details
function generateLogDetails(log: any): string {
  const entityTypeLabels: Record<string, string> = {
    product: 'Product',
    order: 'Order',
    user: 'User',
    settings: 'Settings',
    coupon: 'Coupon',
    shipping: 'Shipping Zone',
    payment: 'Payment Method',
  }

  const actionLabels: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    login: 'Logged in',
    logout: 'Logged out',
    export: 'Exported',
    import: 'Imported',
  }

  const entity = entityTypeLabels[log.entityType] || log.entityType
  const actionLabel = actionLabels[log.action] || log.action

  if (log.action === 'login') {
    return 'Successful login'
  }
  if (log.action === 'logout') {
    return 'Logged out'
  }

  // Try to parse details from newValue or oldValue
  let details = `${actionLabel} ${entity.toLowerCase()}`
  
  try {
    if (log.newValue) {
      const newVal = JSON.parse(log.newValue)
      if (newVal.name) {
        details += ` "${newVal.name}"`
      } else if (newVal.status) {
        details += ` - status: ${newVal.status}`
      }
    } else if (log.oldValue) {
      const oldVal = JSON.parse(log.oldValue)
      if (oldVal.name) {
        details += ` "${oldVal.name}"`
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return details
}
