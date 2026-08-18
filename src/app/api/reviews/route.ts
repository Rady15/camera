/**
 * Reviews API - Product Reviews
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { protectApiRoute, routeConfigs, getUserFromHeaders } from '@/lib/auth-middleware'
import { withRateLimit } from '@/lib/rate-limit'
import { validateBody, reviewCreateSchema, reviewUpdateSchema } from '@/lib/validations'

// GET /api/reviews - Get reviews for a product or all reviews (admin)
export const GET = withRateLimit(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const productId = searchParams.get('productId')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const approved = searchParams.get('approved')

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {}

      if (productId) {
        where.productId = productId
      }

      // Only show approved reviews to public
      if (approved === 'true' || !approved) {
        where.isApproved = true
      } else if (approved === 'false') {
        where.isApproved = false
      }

      const [reviews, total] = await Promise.all([
        db.review.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.review.count({ where }),
      ])

      // Calculate average rating for product
      let averageRating = 0
      let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

      if (productId) {
        const allReviews = await db.review.findMany({
          where: { productId, isApproved: true },
          select: { rating: true },
        })

        if (allReviews.length > 0) {
          averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          
          allReviews.forEach(r => {
            ratingDistribution[r.rating as keyof typeof ratingDistribution]++
          })
        }
      }

      return NextResponse.json({
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: productId ? {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: total,
          ratingDistribution,
        } : undefined,
      })
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }
  },
  'public'
)

// POST /api/reviews - Create review (authenticated users)
export const POST = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)

      const validation = await validateBody(request, reviewCreateSchema)
      if (!validation.success) {
        return validation.error
      }

      const data = validation.data

      try {
        // Check if product exists
        const product = await db.product.findUnique({
          where: { id: data.productId },
        })

        if (!product) {
          return NextResponse.json(
            { error: 'المنتج غير موجود', code: 'PRODUCT_NOT_FOUND' },
            { status: 404 }
          )
        }

        // Check if user already reviewed this product
        const existingReview = await db.review.findUnique({
          where: {
            userId_productId: {
              userId: user.id,
              productId: data.productId,
            },
          },
        })

        if (existingReview) {
          return NextResponse.json(
            { error: 'لقد قمت بتقييم هذا المنتج من قبل', code: 'ALREADY_REVIEWED' },
            { status: 400 }
          )
        }

        // Check if user has purchased this product (verified purchase)
        const verifiedPurchase = await db.orderItem.findFirst({
          where: {
            productId: data.productId,
            order: {
              userId: user.id,
              status: 'delivered',
            },
          },
        })

        const review = await db.review.create({
          data: {
            userId: user.id,
            productId: data.productId,
            orderId: verifiedPurchase?.orderId,
            rating: data.rating,
            title: data.title,
            comment: data.comment,
            images: data.images ? JSON.stringify(data.images) : null,
            isVerified: !!verifiedPurchase,
            isApproved: true, // Auto-approve for now, can be changed
          },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        })

        // Update product rating
        const allReviews = await db.review.findMany({
          where: { productId: data.productId, isApproved: true },
          select: { rating: true },
        })

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

        await db.product.update({
          where: { id: data.productId },
          data: {
            rating: avgRating,
            reviewCount: allReviews.length,
          },
        })

        return NextResponse.json({ review }, { status: 201 })
      } catch (error) {
        console.error('Failed to create review:', error)
        return NextResponse.json(
          { error: 'Failed to create review' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'auth'
)

// PATCH /api/reviews - Update review (owner or admin)
export const PATCH = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const body = await request.json()
      const { reviewId, ...updateData } = body

      if (!reviewId) {
        return NextResponse.json(
          { error: 'Review ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        const existingReview = await db.review.findUnique({
          where: { id: reviewId },
        })

        if (!existingReview) {
          return NextResponse.json(
            { error: 'Review not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        // Check ownership or admin
        if (existingReview.userId !== user.id && user.role !== 'admin') {
          return NextResponse.json(
            { error: 'Forbidden', code: 'FORBIDDEN' },
            { status: 403 }
          )
        }

        // Prepare update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {}

        if (updateData.rating !== undefined) data.rating = updateData.rating
        if (updateData.title !== undefined) data.title = updateData.title
        if (updateData.comment !== undefined) data.comment = updateData.comment
        if (updateData.images !== undefined) data.images = updateData.images ? JSON.stringify(updateData.images) : null
        
        // Admin-only fields
        if (user.role === 'admin') {
          if (updateData.isApproved !== undefined) data.isApproved = updateData.isApproved
          if (updateData.adminReply !== undefined) {
            data.adminReply = updateData.adminReply
            data.adminReplyAt = new Date()
          }
        }

        const review = await db.review.update({
          where: { id: reviewId },
          data,
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        })

        return NextResponse.json({ review })
      } catch (error) {
        console.error('Failed to update review:', error)
        return NextResponse.json(
          { error: 'Failed to update review' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'public'
)

// DELETE /api/reviews - Delete review (owner or admin)
export const DELETE = withRateLimit(
  protectApiRoute(
    async (request: NextRequest) => {
      const user = getUserFromHeaders(request)
      const { searchParams } = new URL(request.url)
      const reviewId = searchParams.get('reviewId')

      if (!reviewId) {
        return NextResponse.json(
          { error: 'Review ID is required', code: 'MISSING_ID' },
          { status: 400 }
        )
      }

      try {
        const existingReview = await db.review.findUnique({
          where: { id: reviewId },
        })

        if (!existingReview) {
          return NextResponse.json(
            { error: 'Review not found', code: 'NOT_FOUND' },
            { status: 404 }
          )
        }

        // Check ownership or admin
        if (existingReview.userId !== user.id && user.role !== 'admin') {
          return NextResponse.json(
            { error: 'Forbidden', code: 'FORBIDDEN' },
            { status: 403 }
          )
        }

        await db.review.delete({
          where: { id: reviewId },
        })

        // Update product rating
        const allReviews = await db.review.findMany({
          where: { productId: existingReview.productId, isApproved: true },
          select: { rating: true },
        })

        const avgRating = allReviews.length > 0 
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
          : 0

        await db.product.update({
          where: { id: existingReview.productId },
          data: {
            rating: avgRating,
            reviewCount: allReviews.length,
          },
        })

        return NextResponse.json({ success: true, message: 'Review deleted successfully' })
      } catch (error) {
        console.error('Failed to delete review:', error)
        return NextResponse.json(
          { error: 'Failed to delete review' },
          { status: 500 }
        )
      }
    },
    routeConfigs.authenticated
  ),
  'public'
)
