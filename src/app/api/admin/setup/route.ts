import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/setup - Check if any admin exists
export async function GET() {
  try {
    const adminCount = await db.user.count({
      where: { role: 'admin' }
    })
    
    const userCount = await db.user.count()
    
    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount,
      userCount,
    })
  } catch (error) {
    console.error('Failed to check admin setup:', error)
    return NextResponse.json({ error: 'Failed to check admin setup' }, { status: 500 })
  }
}

// POST /api/admin/setup - Create or set first user as admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId } = body
    
    // Check if any admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'admin' }
    })
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists', admin: { id: existingAdmin.id, email: existingAdmin.email, name: existingAdmin.name } },
        { status: 400 }
      )
    }
    
    let user
    
    if (userId) {
      // Set specific user as admin
      user = await db.user.update({
        where: { id: userId },
        data: { role: 'admin' }
      })
    } else if (email) {
      // Set user by email as admin
      user = await db.user.update({
        where: { email },
        data: { role: 'admin' }
      })
    } else {
      // Set first user as admin
      const firstUser = await db.user.findFirst({
        orderBy: { createdAt: 'asc' }
      })
      
      if (!firstUser) {
        return NextResponse.json(
          { error: 'No users found. Please register first.' },
          { status: 400 }
        )
      }
      
      user = await db.user.update({
        where: { id: firstUser.id },
        data: { role: 'admin' }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Failed to setup admin:', error)
    return NextResponse.json({ error: 'Failed to setup admin' }, { status: 500 })
  }
}
