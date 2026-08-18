import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/banners - Get all banners or filtered by position
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const activeOnly = searchParams.get('active') !== 'false'

    const banners = await db.banner.findMany({
      where: {
        ...(position ? { position } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Failed to fetch banners:', error)
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}

// POST /api/banners - Create a new banner (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, image, link, buttonText, position, order } = body

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const banner = await db.banner.create({
      data: {
        title,
        description,
        image,
        link,
        buttonText,
        position: position || 'hero',
        order: order || 0,
        isActive: true,
      },
    })

    // Log action
    await db.auditLog.create({
      data: {
        action: 'create',
        entityType: 'banner',
        entityId: banner.id,
        newValue: JSON.stringify(banner),
      }
    })

    return NextResponse.json({ banner })
  } catch (error) {
    console.error('Failed to create banner:', error)
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}

// PATCH /api/banners - Update a banner
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    const banner = await db.banner.update({
      where: { id },
      data,
    })

    // Log action
    await db.auditLog.create({
      data: {
        action: 'update',
        entityType: 'banner',
        entityId: id,
        newValue: JSON.stringify(banner),
      }
    })

    return NextResponse.json({ banner })
  } catch (error) {
    console.error('Failed to update banner:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}

// DELETE /api/banners - Delete a banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    await db.banner.delete({
      where: { id },
    })

    // Log action
    await db.auditLog.create({
      data: {
        action: 'delete',
        entityType: 'banner',
        entityId: id,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete banner:', error)
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}
