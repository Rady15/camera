import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schema for brand
const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  slug: z.string().min(1, 'Slug is required').optional(),
  logo: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET /api/brands - List all brands (PUBLIC)
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const activeOnly = searchParams.get('active') === 'true'
      
      const where = activeOnly ? { isActive: true } : {}
      
      const brands = await db.brand.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: true }
          }
        }
      })

      return NextResponse.json({
        brands: brands.map(brand => ({
          ...brand,
          productCount: brand._count.products
        }))
      })
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
    }
  },
  'public'
)

// POST /api/brands - Create new brand (MANAGER+)
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      try {
        const body = await request.json()
        
        // Validate input
        const validatedData = brandSchema.parse(body)
        
        // Generate slug if not provided
        const slug = validatedData.slug || generateSlug(validatedData.name)
        
        // Check if brand already exists
        const existingBrand = await db.brand.findFirst({
          where: {
            OR: [
              { name: validatedData.name },
              { slug }
            ]
          }
        })
        
        if (existingBrand) {
          return NextResponse.json(
            { error: 'Brand with this name or slug already exists' },
            { status: 400 }
          )
        }
        
        // Create brand
        const brand = await db.brand.create({
          data: {
            name: validatedData.name,
            slug,
            logo: validatedData.logo,
            description: validatedData.description,
            isActive: validatedData.isActive ?? true,
          }
        })
        
        // Log the action
        const userId = request.headers.get('x-user-id')
        if (userId) {
          await db.auditLog.create({
            data: {
              userId,
              action: 'create_brand',
              entityType: 'brand',
              entityId: brand.id,
              newValue: JSON.stringify(brand),
            }
          })
        }
        
        return NextResponse.json({ brand }, { status: 201 })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Validation failed', details: error.errors },
            { status: 400 }
          )
        }
        console.error('Failed to create brand:', error)
        return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
      }
    },
    routeConfigs.managerOnly
  ),
  'admin'
)

// PATCH /api/brands - Update brand (MANAGER+)
export const PATCH = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      try {
        const body = await request.json()
        const { id, ...updateData } = body
        
        if (!id) {
          return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
        }
        
        // Validate input
        const validatedData = brandSchema.partial().parse(updateData)
        
        // Check if brand exists
        const existingBrand = await db.brand.findUnique({
          where: { id }
        })
        
        if (!existingBrand) {
          return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        }
        
        // Generate new slug if name changed and slug not provided
        let slug = validatedData.slug
        if (validatedData.name && !validatedData.slug) {
          slug = generateSlug(validatedData.name)
        }
        
        // Check for duplicate name/slug
        if (validatedData.name || slug) {
          const duplicate = await db.brand.findFirst({
            where: {
              AND: [
                { id: { not: id } },
                {
                  OR: [
                    ...(validatedData.name ? [{ name: validatedData.name }] : []),
                    ...(slug ? [{ slug }] : []),
                  ]
                }
              ]
            }
          })
          
          if (duplicate) {
            return NextResponse.json(
              { error: 'Brand with this name or slug already exists' },
              { status: 400 }
            )
          }
        }
        
        // Update brand
        const brand = await db.brand.update({
          where: { id },
          data: {
            ...validatedData,
            ...(slug && { slug }),
          }
        })
        
        // Log the action
        const userId = request.headers.get('x-user-id')
        if (userId) {
          await db.auditLog.create({
            data: {
              userId,
              action: 'update_brand',
              entityType: 'brand',
              entityId: brand.id,
              oldValue: JSON.stringify(existingBrand),
              newValue: JSON.stringify(brand),
            }
          })
        }
        
        return NextResponse.json({ brand })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Validation failed', details: error.errors },
            { status: 400 }
          )
        }
        console.error('Failed to update brand:', error)
        return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
      }
    },
    routeConfigs.managerOnly
  ),
  'admin'
)

// DELETE /api/brands - Delete brand (ADMIN ONLY)
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        if (!id) {
          return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
        }
        
        // Check if brand exists
        const existingBrand = await db.brand.findUnique({
          where: { id },
          include: {
            _count: {
              select: { products: true }
            }
          }
        })
        
        if (!existingBrand) {
          return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        }
        
        // Check if brand has products
        if (existingBrand._count.products > 0) {
          return NextResponse.json(
            { error: `Cannot delete brand with ${existingBrand._count.products} products. Remove products first or reassign them.` },
            { status: 400 }
          )
        }
        
        // Delete brand
        await db.brand.delete({
          where: { id }
        })
        
        // Log the action
        const userId = request.headers.get('x-user-id')
        if (userId) {
          await db.auditLog.create({
            data: {
              userId,
              action: 'delete_brand',
              entityType: 'brand',
              entityId: id,
              oldValue: JSON.stringify(existingBrand),
            }
          })
        }
        
        return NextResponse.json({ message: 'Brand deleted successfully' })
      } catch (error) {
        console.error('Failed to delete brand:', error)
        return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
      }
    },
    routeConfigs.adminOnly
  ),
  'admin'
)
