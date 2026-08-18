'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Package,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'

interface Brand {
  id: string
  name: string
  slug: string
  logo?: string | null
  description?: string | null
  isActive: boolean
  productCount: number
  createdAt: string
}

export function AdminBrandsPage() {
  const { toast } = useToast()
  const { token } = useAuthStore()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    fetchBrands()
  }, [searchQuery])

  const fetchBrands = async () => {
    const { token: authToken } = useAuthStore.getState()
    const headers: HeadersInit | undefined = authToken ? { Authorization: `Bearer ${authToken}` } : undefined
    
    setLoading(true)
    try {
      const res = await fetch('/api/brands', { headers })
      const data = await res.json()
      
      let filteredBrands = data.brands || []
      if (searchQuery) {
        filteredBrands = filteredBrands.filter((b: Brand) => 
          b.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      setBrands(filteredBrands)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      toast({
        title: 'Error',
        description: 'Failed to load brands',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrand = () => {
    setEditingBrand(null)
    setFormData({
      name: '',
      slug: '',
      logo: '',
      description: '',
      isActive: true,
    })
    setDialogOpen(true)
  }

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      description: brand.description || '',
      isActive: brand.isActive,
    })
    setDialogOpen(true)
  }

  const handleSaveBrand = async () => {
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Brand name is required',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const url = '/api/brands'
      const method = editingBrand ? 'PATCH' : 'POST'
      const body = editingBrand 
        ? { id: editingBrand.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save brand')
      }

      toast({
        title: editingBrand ? 'Brand updated' : 'Brand created',
        description: `Brand "${formData.name}" has been ${editingBrand ? 'updated' : 'created'} successfully`,
      })

      setDialogOpen(false)
      fetchBrands()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save brand',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (brand: Brand) => {
    try {
      const res = await fetch('/api/brands', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: brand.id,
          isActive: !brand.isActive,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update brand')
      }

      toast({
        title: 'Brand updated',
        description: `Brand "${brand.name}" is now ${brand.isActive ? 'inactive' : 'active'}`,
      })

      fetchBrands()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update brand status',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return

    try {
      const res = await fetch(`/api/brands?id=${brandToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete brand')
      }

      toast({
        title: 'Brand deleted',
        description: `Brand "${brandToDelete.name}" has been deleted`,
      })

      setDeleteDialogOpen(false)
      setBrandToDelete(null)
      fetchBrands()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete brand',
        variant: 'destructive',
      })
    }
  }

  const stats = {
    total: brands.length,
    active: brands.filter(b => b.isActive).length,
    inactive: brands.filter(b => !b.isActive).length,
    totalProducts: brands.reduce((sum, b) => sum + b.productCount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Brands Management</h1>
          <p className="text-slate-400">Manage product brands and manufacturers</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddBrand}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Brands</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <ToggleRight className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <ToggleLeft className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Inactive</p>
                <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Package className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Products</p>
                <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
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
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brands Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Brand</TableHead>
                <TableHead className="text-slate-400">Slug</TableHead>
                <TableHead className="text-slate-400">Products</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={5} className="h-16 bg-slate-800/50 animate-pulse" />
                  </TableRow>
                ))
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <TableRow key={brand.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          <img 
                            src={brand.logo} 
                            alt={brand.name}
                            className="w-10 h-10 object-contain rounded bg-white p-1"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{brand.name}</p>
                          {brand.description && (
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">
                              {brand.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 font-mono text-sm">
                      {brand.slug}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-700 text-slate-300">
                        {brand.productCount} products
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleToggleActive(brand)}
                      >
                        <Switch 
                          checked={brand.isActive} 
                          onCheckedChange={() => handleToggleActive(brand)}
                        />
                        <span className={brand.isActive ? 'text-emerald-500' : 'text-slate-500'}>
                          {brand.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem 
                            className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                            onClick={() => handleEditBrand(brand)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-slate-700 cursor-pointer"
                            onClick={() => handleDeleteClick(brand)}
                            disabled={brand.productCount > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                    <Building2 className="h-8 w-8 mx-auto mb-2" />
                    <p>No brands found</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-slate-700 text-slate-300"
                      onClick={handleAddBrand}
                    >
                      Add your first brand
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Brand Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingBrand ? 'Update brand information' : 'Create a new brand for your products'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-slate-300">Brand Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hikvision"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated if empty"
                className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Used in URLs, auto-generated from name</p>
            </div>
            <div>
              <Label className="text-slate-300">Logo URL</Label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the brand..."
                rows={3}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Active</Label>
                <p className="text-sm text-slate-400">Enable this brand for products</p>
              </div>
              <Switch 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-700 text-slate-300"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSaveBrand}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingBrand ? 'Update Brand' : 'Create Brand'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Brand</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{brandToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-400">
              This action cannot be undone. The brand will be permanently removed.
            </p>
            {brandToDelete && brandToDelete.productCount > 0 && (
              <p className="text-sm text-red-400 mt-2">
                Warning: This brand has {brandToDelete.productCount} products. You must reassign or delete them first.
              </p>
            )}
          </div>
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
              onClick={handleDeleteBrand}
              disabled={brandToDelete?.productCount ? brandToDelete.productCount > 0 : false}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
