'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Tag, Calendar, Users, Percent, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

interface Coupon {
  id: string
  code: string
  description?: string
  discount: number
  discountType: string
  minOrder: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  active: boolean
  expiresAt?: string
}

const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME15',
    description: 'New customer discount',
    discount: 15,
    discountType: 'percentage',
    minOrder: 50,
    usageLimit: 1000,
    usageCount: 234,
    active: true,
  },
  {
    id: '2',
    code: 'FLASH40',
    description: 'Flash sale - limited time',
    discount: 40,
    discountType: 'percentage',
    minOrder: 100,
    maxDiscount: 100,
    usageLimit: 500,
    usageCount: 456,
    active: true,
  },
  {
    id: '3',
    code: 'SAVE20',
    description: 'Fixed discount on all orders',
    discount: 20,
    discountType: 'fixed',
    minOrder: 100,
    usageLimit: undefined,
    usageCount: 89,
    active: true,
  },
]

export function AdminCouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: '',
    discountType: 'percentage',
    minOrder: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
  })

  const handleAddCoupon = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      description: '',
      discount: '',
      discountType: 'percentage',
      minOrder: '',
      maxDiscount: '',
      usageLimit: '',
      expiresAt: '',
    })
    setDialogOpen(true)
  }

  const handleSaveCoupon = () => {
    const newCoupon: Coupon = {
      id: editingCoupon?.id || Date.now().toString(),
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount: parseFloat(formData.discount),
      discountType: formData.discountType,
      minOrder: parseFloat(formData.minOrder) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      usageCount: editingCoupon?.usageCount || 0,
      active: true,
    }

    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? newCoupon : c))
    } else {
      setCoupons([...coupons, newCoupon])
    }

    setDialogOpen(false)
    toast({ title: editingCoupon ? 'Coupon updated' : 'Coupon created' })
  }

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id))
    toast({ title: 'Coupon deleted' })
  }

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons & Discounts</h1>
          <p className="text-slate-400">Create and manage promotional codes</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddCoupon}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-slate-400">Active Coupons</p>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => c.active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">Total Uses</p>
                <p className="text-2xl font-bold text-white">{coupons.reduce((sum, c) => sum + c.usageCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Percent className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-slate-400">Percentage</p>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => c.discountType === 'percentage').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-slate-400">Fixed Amount</p>
                <p className="text-2xl font-bold text-white">{coupons.filter(c => c.discountType === 'fixed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Code</TableHead>
                <TableHead className="text-slate-400">Discount</TableHead>
                <TableHead className="text-slate-400">Min. Order</TableHead>
                <TableHead className="text-slate-400">Usage</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div>
                      <p className="font-mono font-bold text-white">{coupon.code}</p>
                      <p className="text-sm text-slate-400">{coupon.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discount}% off`
                      : `$${coupon.discount} off`
                    }
                  </TableCell>
                  <TableCell className="text-slate-300">
                    ${coupon.minOrder}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {coupon.usageCount} / {coupon.usageLimit || '∞'}
                  </TableCell>
                  <TableCell>
                    <Badge className={coupon.active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/20 text-slate-400'}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-400"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-slate-300">Coupon Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE20"
                className="bg-slate-800 border-slate-700 text-white font-mono"
              />
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Summer sale discount"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Discount Type</Label>
                <Select value={formData.discountType} onValueChange={(v) => setFormData({ ...formData, discountType: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Min. Order ($)</Label>
                <Input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  placeholder="0"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Max Discount ($)</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="No limit"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Usage Limit</Label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="No limit"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveCoupon}>
                {editingCoupon ? 'Update' : 'Create'} Coupon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
