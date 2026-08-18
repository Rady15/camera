'use client'

import { useState } from 'react'
import { Star, MessageSquare, Send, X, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'

interface WriteReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  productImage: string
  onSuccess?: () => void
}

export function WriteReviewDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productImage,
  onSuccess,
}: WriteReviewDialogProps) {
  const { toast } = useToast()
  const { isAuthenticated, token } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to write a review',
        variant: 'destructive',
      })
      return
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating',
        variant: 'destructive',
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write your review',
        variant: 'destructive',
      })
      return
    }

    if (comment.trim().length < 10) {
      toast({
        title: 'Review Too Short',
        description: 'Please write at least 10 characters',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Review Submitted',
          description: data.isVerified 
            ? 'Thank you for your review! It has been posted.' 
            : 'Thank you for your review! It will be visible after approval.',
        })
        // Reset form
        setRating(0)
        setTitle('')
        setComment('')
        onOpenChange(false)
        onSuccess?.()
      } else {
        if (data.code === 'ALREADY_REVIEWED') {
          toast({
            title: 'Already Reviewed',
            description: 'You have already reviewed this product',
            variant: 'destructive',
          })
        } else {
          throw new Error(data.error || 'Failed to submit review')
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setRating(0)
      setTitle('')
      setComment('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Write a Review</DialogTitle>
          <DialogDescription className="text-slate-500">
            Share your experience with this product
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Product Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <img
              src={productImage || '/placeholder-product.jpg'}
              alt={productName}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div>
              <p className="font-medium text-slate-900 line-clamp-2">{productName}</p>
              <p className="text-xs text-slate-500">Share your honest feedback</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-slate-700">Your Rating *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="mr-2 text-sm text-slate-600">
                {rating === 0 && 'Select rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label className="text-slate-700">Review Title (Optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="mt-1"
              maxLength={100}
            />
            <p className="text-xs text-slate-400 mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div>
            <Label className="text-slate-700">Your Review *</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike about this product?"
              rows={4}
              className="mt-1 resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-slate-400 mt-1">{comment.length}/1000</p>
          </div>

          {/* Guidelines */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <p className="font-medium text-slate-700 mb-1">Review Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Be honest and specific about your experience</li>
              <li>Focus on the product features and quality</li>
              <li>Avoid mentioning competitors or prices</li>
              <li>Keep it family-friendly</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={submitting || rating === 0 || !comment.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 ml-2" />
                Submit Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
