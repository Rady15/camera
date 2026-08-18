'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Check,
  X,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'

interface Review {
  id: string
  userId: string
  productId: string
  product?: {
    id: string
    name: string
    images: string[]
  }
  user: {
    id: string
    name: string
    avatar?: string
  }
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerified: boolean
  isApproved: boolean
  adminReply?: string
  adminReplyAt?: string
  createdAt: string
  updatedAt: string
}

interface ReviewsStats {
  totalReviews: number
  approvedReviews: number
  pendingReviews: number
  averageRating: number
}

export function AdminReviewsPage() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<ReviewsStats>({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    averageRating: 0,
  })
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    fetchReviews()
  }, [currentPage, statusFilter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      
      if (statusFilter === 'approved') {
        params.append('approved', 'true')
      } else if (statusFilter === 'pending') {
        params.append('approved', 'false')
      } else {
        params.append('approved', 'all')
      }

      const res = await fetch(`/api/reviews?${params.toString()}`)
      const data = await res.json()

      if (data.reviews) {
        // Fetch product details for each review
        const reviewsWithProducts = await Promise.all(
          data.reviews.map(async (review: Review) => {
            try {
              const productRes = await fetch(`/api/products/${review.productId}`)
              const productData = await productRes.json()
              return { ...review, product: productData.product }
            } catch {
              return review
            }
          })
        )
        
        let filteredReviews = reviewsWithProducts
        if (searchQuery) {
          filteredReviews = reviewsWithProducts.filter(
            (r: Review) =>
              r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        
        setReviews(filteredReviews)
        setTotalPages(data.pagination?.totalPages || 1)
        
        // Calculate stats
        const allReviewsRes = await fetch('/api/reviews?limit=1000&approved=all')
        const allReviewsData = await allReviewsRes.json()
        const allReviews = allReviewsData.reviews || []
        
        setStats({
          totalReviews: allReviews.length,
          approvedReviews: allReviews.filter((r: Review) => r.isApproved).length,
          pendingReviews: allReviews.filter((r: Review) => !r.isApproved).length,
          averageRating: allReviews.length > 0
            ? allReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / allReviews.length
            : 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string, approve: boolean) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          isApproved: approve,
        }),
      })

      if (res.ok) {
        toast({
          title: approve ? 'Review approved' : 'Review disapproved',
          description: approve 
            ? 'The review is now visible to customers' 
            : 'The review is now hidden from customers',
        })
        fetchReviews()
      } else {
        throw new Error('Failed to update review')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update review status',
        variant: 'destructive',
      })
    }
  }

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return

    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview.id,
          adminReply: replyText.trim(),
        }),
      })

      if (res.ok) {
        toast({
          title: 'Reply sent',
          description: 'Your reply has been added to the review',
        })
        setReplyDialogOpen(false)
        setReplyText('')
        setSelectedReview(null)
        fetchReviews()
      } else {
        throw new Error('Failed to send reply')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedReview) return

    try {
      const res = await fetch(`/api/reviews?reviewId=${selectedReview.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({
          title: 'Review deleted',
          description: 'The review has been permanently removed',
        })
        setDeleteDialogOpen(false)
        setSelectedReview(null)
        fetchReviews()
      } else {
        throw new Error('Failed to delete review')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      })
    }
  }

  const openReplyDialog = (review: Review) => {
    setSelectedReview(review)
    setReplyText(review.adminReply || '')
    setReplyDialogOpen(true)
  }

  const openDeleteDialog = (review: Review) => {
    setSelectedReview(review)
    setDeleteDialogOpen(true)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews Management</h1>
          <p className="text-slate-400">Manage product reviews and customer feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Star className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Reviews</p>
                <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-white">{stats.approvedReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Avg Rating</p>
                <p className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'approved' | 'pending')}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Product</TableHead>
                <TableHead className="text-slate-400">Rating</TableHead>
                <TableHead className="text-slate-400">Review</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400 w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={7} className="h-20">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24 bg-slate-800" />
                          <Skeleton className="h-3 w-16 bg-slate-800" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <TableRow key={review.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-slate-700">
                          <AvatarFallback className="bg-emerald-600 text-white">
                            {review.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{review.user.name}</p>
                          {review.isVerified && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              <Check className="h-3 w-3 ml-1" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {review.product?.images?.[0] && (
                          <img
                            src={review.product.images[0]}
                            alt={review.product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-white text-sm line-clamp-1">{review.product?.name || 'Unknown Product'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {review.title && (
                          <p className="font-medium text-white text-sm">{review.title}</p>
                        )}
                        <p className="text-slate-400 text-sm line-clamp-2">{review.comment}</p>
                        {review.adminReply && (
                          <div className="mt-2 p-2 bg-emerald-500/10 rounded text-xs">
                            <p className="text-emerald-400 font-medium">Admin Reply:</p>
                            <p className="text-slate-300">{review.adminReply}</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          review.isApproved
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-orange-500/20 text-orange-500'
                        }
                      >
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">
                      {formatDate(review.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-slate-800 border-slate-700">
                          {review.isApproved ? (
                            <DropdownMenuItem
                              className="text-orange-400 hover:bg-slate-700 cursor-pointer"
                              onClick={() => handleApprove(review.id, false)}
                            >
                              <ThumbsDown className="h-4 w-4 ml-2" />
                              Disapprove
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-emerald-400 hover:bg-slate-700 cursor-pointer"
                              onClick={() => handleApprove(review.id, true)}
                            >
                              <ThumbsUp className="h-4 w-4 ml-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                            onClick={() => openReplyDialog(review)}
                          >
                            <MessageSquare className="h-4 w-4 ml-2" />
                            {review.adminReply ? 'Edit Reply' : 'Reply'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-slate-700 cursor-pointer"
                            onClick={() => openDeleteDialog(review)}
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <Star className="h-8 w-8 mx-auto mb-2" />
                    <p>No reviews found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="border-slate-700 text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">Reply to Review</DialogTitle>
            <DialogDescription className="text-slate-400">
              Your reply will be visible to all customers viewing this review.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 pt-4">
              {/* Review Summary */}
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8 bg-slate-700">
                    <AvatarFallback className="bg-emerald-600 text-white text-sm">
                      {selectedReview.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm font-medium">{selectedReview.user.name}</p>
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <p className="text-slate-300 text-sm">{selectedReview.comment}</p>
              </div>

              {/* Reply Input */}
              <div>
                <Label className="text-slate-300">Your Reply</Label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a professional response..."
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReplyDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleReply}
              disabled={!replyText.trim()}
            >
              <MessageSquare className="h-4 w-4 ml-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Review
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="p-4 bg-slate-800 rounded-lg my-4">
              <p className="text-slate-300 text-sm line-clamp-3">{selectedReview.comment}</p>
              <p className="text-slate-500 text-xs mt-2">by {selectedReview.user.name}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
