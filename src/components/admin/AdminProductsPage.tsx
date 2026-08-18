'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  Video,
  Wifi,
  Moon,
  Check,
  AlertTriangle,
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
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ImageUploader } from './ImageUploader'

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  barcode?: string
  description: string
  price: number
  comparePrice?: number
  costPrice?: number
  wholesalePrice?: number
  images: string[]
  categoryId: string
  category: { id: string; name: string }
  brandId?: string
  brand?: { id: string; name: string }
  stock: number
  lowStockThreshold: number
  stockStatus: string
  resolution?: string
  nightVision?: string
  viewingAngle?: string
  weatherRating?: string
  storage?: string
  isPoe: boolean
  isWifi: boolean
  hasAudio: boolean
  hasTwoWayAudio: boolean
  smartDetection?: string[]
  specifications?: Record<string, string>
  isActive: boolean
  featured: boolean
  rating: number
  reviewCount: number
  viewCount: number
  salesCount: number
  videoUrl?: string
  demoStreamUrl?: string
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

const resolutionOptions = ['2MP (1080p)', '4MP (2K)', '8MP (4K)', '12MP']
const nightVisionOptions = ['IR 20m', 'IR 30m', 'IR 50m', 'ColorVu', 'Starlight', 'Full Color']
const weatherRatingOptions = ['IP65', 'IP66', 'IP67', 'IP68', 'Indoor Only']
const cameraTypeOptions = ['Bullet', 'Dome', 'PTZ', 'Turret', 'Hidden', 'Box', 'Fisheye']
const lensTypeOptions = ['Fixed', 'Varifocal', 'Motorized']
const stockStatusOptions = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'pre_order', label: 'Pre-Order' },
  { value: 'coming_soon', label: 'Coming Soon' },
]
const smartDetectionOptions = ['Human Detection', 'Vehicle Detection', 'Face Detection', 'Perimeter Protection', 'Line Crossing', 'Region Intrusion']

export function AdminProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    wholesalePrice: '',
    categoryId: '',
    brandId: '',
    stock: '',
    lowStockThreshold: '5',
    stockStatus: 'in_stock',
    resolution: '',
    nightVision: '',
    viewingAngle: '',
    weatherRating: '',
    storage: '',
    cameraType: '',
    lensType: '',
    focalLength: '',
    isPoe: false,
    isWifi: false,
    hasAudio: false,
    hasTwoWayAudio: false,
    smartDetection: [] as string[],
    featured: false,
    isActive: true,
    videoUrl: '',
    demoStreamUrl: '',
    images: [] as string[],
    logo: '',
  })

  const [uploading, setUploading] = useState(false)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      setFormData({ ...formData, logo: data.url })
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [searchQuery, selectedCategory, stockFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory && selectedCategory !== 'all') params.append('categoryId', selectedCategory)
      params.append('limit', '100')
      
      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      let filteredProducts = data.products || []
      
      if (stockFilter === 'low') {
        filteredProducts = filteredProducts.filter((p: Product) => p.stock <= p.lowStockThreshold)
      } else if (stockFilter === 'out') {
        filteredProducts = filteredProducts.filter((p: Product) => p.stock === 0)
      }
      
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands?active=true')
      const data = await res.json()
      setBrands(data.brands || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      setBrands([])
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      description: '',
      price: '',
      comparePrice: '',
      costPrice: '',
      wholesalePrice: '',
      categoryId: '',
      brandId: '',
      stock: '',
      lowStockThreshold: '5',
      stockStatus: 'in_stock',
      resolution: '',
      nightVision: '',
      viewingAngle: '',
      weatherRating: '',
      storage: '',
      cameraType: '',
      lensType: '',
      focalLength: '',
      isPoe: false,
      isWifi: false,
      hasAudio: false,
      hasTwoWayAudio: false,
      smartDetection: [],
      featured: false,
      isActive: true,
      videoUrl: '',
      demoStreamUrl: '',
      images: [],
      logo: '',
    })
    setDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || '',
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      wholesalePrice: product.wholesalePrice?.toString() || '',
      categoryId: product.categoryId,
      brandId: product.brandId || '',
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      stockStatus: product.stockStatus,
      resolution: product.resolution || '',
      nightVision: product.nightVision || '',
      viewingAngle: product.viewingAngle || '',
      weatherRating: product.weatherRating || '',
      storage: product.storage || '',
      cameraType: (product as any).cameraType || '',
      lensType: (product as any).lensType || '',
      focalLength: (product as any).focalLength || '',
      isPoe: product.isPoe,
      isWifi: product.isWifi,
      hasAudio: product.hasAudio,
      hasTwoWayAudio: product.hasTwoWayAudio,
      smartDetection: product.smartDetection || [],
      featured: product.featured,
      isActive: product.isActive,
      videoUrl: product.videoUrl || '',
      demoStreamUrl: product.demoStreamUrl || '',
      images: product.images || [],
      logo: (product as any).logo || '',
    })
    setDialogOpen(true)
  }

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode || null,
        description: formData.description,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : null,
        categoryId: formData.categoryId,
        brandId: formData.brandId || null,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        stockStatus: formData.stockStatus,
        resolution: formData.resolution || null,
        nightVision: formData.nightVision || null,
        viewingAngle: formData.viewingAngle || null,
        weatherRating: formData.weatherRating || null,
        storage: formData.storage || null,
        cameraType: formData.cameraType || null,
        lensType: formData.lensType || null,
        focalLength: formData.focalLength || null,
        isPoe: formData.isPoe,
        isWifi: formData.isWifi,
        hasAudio: formData.hasAudio,
        hasTwoWayAudio: formData.hasTwoWayAudio,
        smartDetection: formData.smartDetection,
        featured: formData.featured,
        isActive: formData.isActive,
        videoUrl: formData.videoUrl || null,
        demoStreamUrl: formData.demoStreamUrl || null,
        images: formData.images,
      }

      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
        toast({ title: 'Product updated successfully' })
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
        toast({ title: 'Product created successfully' })
      }

      setDialogOpen(false)
      fetchProducts()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      toast({ title: 'Product deleted' })
      fetchProducts()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedProducts.length} products?`)) return
    
    try {
      await Promise.all(selectedProducts.map(id => fetch(`/api/products/${id}`, { method: 'DELETE' })))
      toast({ title: `${selectedProducts.length} products deleted` })
      setSelectedProducts([])
      fetchProducts()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some products',
        variant: 'destructive',
      })
    }
  }

  const toggleSmartDetection = (detection: string) => {
    setFormData(prev => ({
      ...prev,
      smartDetection: prev.smartDetection.includes(detection)
        ? prev.smartDetection.filter(d => d !== detection)
        : [...prev.smartDetection, detection],
    }))
  }

  // Pagination
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStockBadge = (stock: number, threshold: number) => {
    if (stock === 0) return <Badge className="bg-red-500/20 text-red-500">Out of Stock</Badge>
    if (stock <= threshold) return <Badge className="bg-yellow-500/20 text-yellow-500">Low Stock ({stock})</Badge>
    return <Badge className="bg-emerald-500/20 text-emerald-500">In Stock ({stock})</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-slate-400">Manage your CCTV cameras and accessories catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Stock" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg">
          <span className="text-slate-300">{selectedProducts.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300" onClick={() => setSelectedProducts([])}>
            Cancel
          </Button>
        </div>
      )}

      {/* Products Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProducts(paginatedProducts.map(p => p.id))
                      } else {
                        setSelectedProducts([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="text-slate-400">Product</TableHead>
                <TableHead className="text-slate-400">SKU</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Price</TableHead>
                <TableHead className="text-slate-400">Stock</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={8} className="h-16 bg-slate-800/50 animate-pulse" />
                  </TableRow>
                ))
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="h-6 w-6 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          {product.featured && (
                            <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{product.sku}</TableCell>
                    <TableCell className="text-slate-300">{product.category?.name}</TableCell>
                    <TableCell className="text-white">${product.price.toFixed(2)}</TableCell>
                    <TableCell>{getStockBadge(product.stock, product.lowStockThreshold)}</TableCell>
                    <TableCell>
                      <Badge className={product.isActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/20 text-slate-400'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-slate-700 cursor-pointer"
                            onClick={() => handleDeleteProduct(product.id)}
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
                  <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>No products found</p>
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, products.length)} of {products.length} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="border-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? 'bg-emerald-600' : 'border-slate-700 text-slate-300'}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="border-slate-700 text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Fill in the product details. All required fields are marked with *.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Hikvision DS-2CD2147G2-L"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">SKU *</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., HK-2147G2L-W"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-slate-300">Barcode</Label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Optional"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Product Images</Label>
                <ImageUploader
                  images={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">Brand Logo (Cloud Upload)</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="Logo URL"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                      {uploading ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <span>📁</span>
                      )}
                      {uploading ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
                {formData.logo && (
                  <div className="mt-2">
                    <img src={formData.logo} alt="Logo preview" className="h-16 w-auto object-contain border border-slate-600 rounded" />
                  </div>
                )}
              </div>
              <div>
                <Label className="text-slate-300">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Pricing</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-slate-300">Price ($) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Compare Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Cost Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="For profit margin"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Wholesale Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.wholesalePrice}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    placeholder="For wholesale customers"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Categorization */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Categorization</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Brand</Label>
                  <Select value={formData.brandId} onValueChange={(v) => setFormData({ ...formData, brandId: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Inventory</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Stock Quantity *</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Low Stock Threshold</Label>
                  <Input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="5"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Stock Status</Label>
                  <Select value={formData.stockStatus} onValueChange={(v) => setFormData({ ...formData, stockStatus: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {stockStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* CCTV-Specific Specs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Camera Specifications
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Resolution</Label>
                  <Select value={formData.resolution} onValueChange={(v) => setFormData({ ...formData, resolution: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {resolutionOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Night Vision</Label>
                  <Select value={formData.nightVision} onValueChange={(v) => setFormData({ ...formData, nightVision: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select night vision type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {nightVisionOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Viewing Angle</Label>
                  <Input
                    value={formData.viewingAngle}
                    onChange={(e) => setFormData({ ...formData, viewingAngle: e.target.value })}
                    placeholder="e.g., 104° / 2.8mm"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Weather Rating</Label>
                  <Select value={formData.weatherRating} onValueChange={(v) => setFormData({ ...formData, weatherRating: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select weather rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {weatherRatingOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Storage</Label>
                  <Input
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    placeholder="e.g., MicroSD 256GB / NVR"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Camera Type</Label>
                  <Select value={formData.cameraType} onValueChange={(v) => setFormData({ ...formData, cameraType: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select camera type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {cameraTypeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Lens Type</Label>
                  <Select value={formData.lensType} onValueChange={(v) => setFormData({ ...formData, lensType: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select lens type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {lensTypeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300">Focal Length</Label>
                  <Input
                    value={formData.focalLength}
                    onChange={(e) => setFormData({ ...formData, focalLength: e.target.value })}
                    placeholder="e.g., 2.8mm / 2.8-12mm"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Features Checkboxes */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPoe"
                    checked={formData.isPoe}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPoe: !!checked })}
                  />
                  <Label htmlFor="isPoe" className="text-slate-300 flex items-center gap-1">
                    <Wifi className="h-4 w-4" /> PoE Support
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isWifi"
                    checked={formData.isWifi}
                    onCheckedChange={(checked) => setFormData({ ...formData, isWifi: !!checked })}
                  />
                  <Label htmlFor="isWifi" className="text-slate-300 flex items-center gap-1">
                    <Wifi className="h-4 w-4" /> WiFi
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAudio"
                    checked={formData.hasAudio}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasAudio: !!checked })}
                  />
                  <Label htmlFor="hasAudio" className="text-slate-300">Built-in Mic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTwoWayAudio"
                    checked={formData.hasTwoWayAudio}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasTwoWayAudio: !!checked })}
                  />
                  <Label htmlFor="hasTwoWayAudio" className="text-slate-300">Two-Way Audio</Label>
                </div>
              </div>

              {/* Smart Detection */}
              <div>
                <Label className="text-slate-300 mb-2 block">Smart Detection Features</Label>
                <div className="flex flex-wrap gap-2">
                  {smartDetectionOptions.map((detection) => (
                    <Badge
                      key={detection}
                      className={`cursor-pointer transition-colors ${
                        formData.smartDetection.includes(detection)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                      onClick={() => toggleSmartDetection(detection)}
                    >
                      {formData.smartDetection.includes(detection) && <Check className="h-3 w-3 mr-1" />}
                      {detection}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Video className="h-5 w-5" />
                Media & Demo
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Video URL (YouTube/Vimeo)</Label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Demo Stream URL</Label>
                  <Input
                    value={formData.demoStreamUrl}
                    onChange={(e) => setFormData({ ...formData, demoStreamUrl: e.target.value })}
                    placeholder="RTSP/ONVIF URL"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Status</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive" className="text-slate-300">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                  />
                  <Label htmlFor="featured" className="text-slate-300">Featured</Label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveProduct}>
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
