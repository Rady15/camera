import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        brand: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images),
        specifications: product.specifications ? JSON.parse(product.specifications) : null,
        smartDetection: product.smartDetection ? JSON.parse(product.smartDetection) : null,
      }
    })
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

// PATCH /api/products/[id] - Update a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Build update data object
    const updateData: any = {}
    
    // Basic fields
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.price !== undefined) updateData.price = body.price
    if (body.comparePrice !== undefined) updateData.comparePrice = body.comparePrice
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice
    if (body.wholesalePrice !== undefined) updateData.wholesalePrice = body.wholesalePrice
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.brandId !== undefined) updateData.brandId = body.brandId
    if (body.stock !== undefined) updateData.stock = body.stock
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = body.lowStockThreshold
    if (body.stockStatus !== undefined) updateData.stockStatus = body.stockStatus
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.barcode !== undefined) updateData.barcode = body.barcode
    
    // Images - handle as JSON string
    if (body.images !== undefined) {
      updateData.images = Array.isArray(body.images) ? JSON.stringify(body.images) : body.images
    }
    
    // Specifications - handle as JSON string
    if (body.specifications !== undefined) {
      updateData.specifications = body.specifications ? JSON.stringify(body.specifications) : null
    }
    
    // CCTV-specific fields
    if (body.resolution !== undefined) updateData.resolution = body.resolution
    if (body.nightVision !== undefined) updateData.nightVision = body.nightVision
    if (body.viewingAngle !== undefined) updateData.viewingAngle = body.viewingAngle
    if (body.weatherRating !== undefined) updateData.weatherRating = body.weatherRating
    if (body.storage !== undefined) updateData.storage = body.storage
    if (body.isPoe !== undefined) updateData.isPoe = body.isPoe
    if (body.isWifi !== undefined) updateData.isWifi = body.isWifi
    if (body.hasAudio !== undefined) updateData.hasAudio = body.hasAudio
    if (body.hasTwoWayAudio !== undefined) updateData.hasTwoWayAudio = body.hasTwoWayAudio
    if (body.cameraType !== undefined) updateData.cameraType = body.cameraType
    if (body.lensType !== undefined) updateData.lensType = body.lensType
    if (body.focalLength !== undefined) updateData.focalLength = body.focalLength
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl
    if (body.demoStreamUrl !== undefined) updateData.demoStreamUrl = body.demoStreamUrl
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    
    // Smart Detection - handle as JSON string
    if (body.smartDetection !== undefined) {
      updateData.smartDetection = body.smartDetection ? JSON.stringify(body.smartDetection) : null
    }
    
    // Update slug if name changed
    if (body.name) {
      const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      updateData.slug = `${slug}-${Date.now()}`
    }
    
    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        brand: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images),
        specifications: product.specifications ? JSON.parse(product.specifications) : null,
        smartDetection: product.smartDetection ? JSON.parse(product.smartDetection) : null,
      }
    })
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
