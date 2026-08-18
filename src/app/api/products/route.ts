import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products - Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const categories = searchParams.get('categories')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')
    const sort = searchParams.get('sort')
    const ids = searchParams.get('ids')
    const brandId = searchParams.get('brandId')
    const resolution = searchParams.get('resolution')
    const isPoe = searchParams.get('isPoe')
    const isWifi = searchParams.get('isWifi')

    // Build where clause
    let where: any = { isActive: true }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (category) {
      where.category = { slug: category }
    }
    
    if (categories) {
      where.categoryId = { in: categories.split(',') }
    }
    
    if (featured === 'true') {
      where.featured = true
    }
    
    if (ids) {
      where.id = { in: ids.split(',') }
    }

    if (brandId) {
      where.brandId = brandId
    }

    if (resolution) {
      where.resolution = resolution
    }

    if (isPoe === 'true') {
      where.isPoe = true
    }

    if (isWifi === 'true') {
      where.isWifi = true
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    if (sort === 'price-desc') orderBy = { price: 'desc' }
    if (sort === 'rating') orderBy = { rating: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }
    if (sort === 'featured') orderBy = { featured: 'desc' }

    const products = await db.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        brand: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy,
      take: limit ? parseInt(limit) : undefined,
    })

    // Parse images from JSON string
    const productsWithParsedImages = products.map(product => ({
      ...product,
      images: JSON.parse(product.images),
      specifications: product.specifications ? JSON.parse(product.specifications) : null,
      smartDetection: product.smartDetection ? JSON.parse(product.smartDetection) : null,
    }))

    return NextResponse.json({ products: productsWithParsedImages })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      name, 
      description, 
      price, 
      comparePrice, 
      costPrice,
      wholesalePrice,
      images, 
      categoryId, 
      brandId,
      stock, 
      lowStockThreshold,
      stockStatus,
      sku, 
      barcode,
      specifications,
      // CCTV-specific fields
      resolution,
      nightVision,
      viewingAngle,
      weatherRating,
      storage,
      isPoe,
      isWifi,
      hasAudio,
      hasTwoWayAudio,
      smartDetection,
      cameraType,
      lensType,
      focalLength,
      videoUrl,
      demoStreamUrl,
      featured,
      isActive,
      logo,
    } = body
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const product = await db.product.create({
      data: {
        name,
        slug: `${slug}-${Date.now()}`,
        description,
        price,
        comparePrice,
        costPrice,
        wholesalePrice,
        images: JSON.stringify(images || []),
        categoryId,
        brandId,
        stock,
        lowStockThreshold: lowStockThreshold || 5,
        stockStatus: stockStatus || 'in_stock',
        sku,
        barcode,
        specifications: specifications ? JSON.stringify(specifications) : null,
        // CCTV-specific fields
        resolution,
        nightVision,
        viewingAngle,
        weatherRating,
        storage,
        isPoe: isPoe || false,
        isWifi: isWifi || false,
        hasAudio: hasAudio || false,
        hasTwoWayAudio: hasTwoWayAudio || false,
        smartDetection: smartDetection ? JSON.stringify(smartDetection) : null,
        cameraType,
        lensType,
        focalLength,
        videoUrl,
        demoStreamUrl,
        featured: featured || false,
        isActive: isActive !== undefined ? isActive : true,
        logo,
      },
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
        smartDetection: product.smartDetection ? JSON.parse(product.smartDetection) : null,
      } 
    })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
