'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Package, TrendingDown, Clock, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  lowStockThreshold: number
  stockStatus: string
  category: { name: string }
  price: number
}

export function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchInventory()
  }, [filter])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=200')
      const data = await res.json()
      let filteredProducts = data.products || []
      
      if (filter === 'low') {
        filteredProducts = filteredProducts.filter((p: Product) => p.stock <= p.lowStockThreshold && p.stock > 0)
      } else if (filter === 'out') {
        filteredProducts = filteredProducts.filter((p: Product) => p.stock === 0)
      }
      
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > p.lowStockThreshold).length,
    lowStock: products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  }

  const getStockLevel = (stock: number, threshold: number) => {
    if (stock === 0) return { level: 0, color: 'bg-red-500', text: 'Out of Stock' }
    if (stock <= threshold) return { level: 25, color: 'bg-yellow-500', text: 'Low Stock' }
    if (stock <= threshold * 2) return { level: 50, color: 'bg-orange-500', text: 'Medium' }
    return { level: 100, color: 'bg-emerald-500', text: 'In Stock' }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
        <p className="text-slate-400">Monitor stock levels and manage warehouse inventory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Products</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">In Stock</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.inStock}</p>
              </div>
              <Package className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.lowStock}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Out of Stock</p>
                <p className="text-2xl font-bold text-red-500">{stats.outOfStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="low">Low Stock Only</SelectItem>
                <SelectItem value="out">Out of Stock Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Product</TableHead>
                <TableHead className="text-slate-400">SKU</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Stock Level</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={6} className="h-16 bg-slate-800/50 animate-pulse" />
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product) => {
                  const stockInfo = getStockLevel(product.stock, product.lowStockThreshold)
                  return (
                    <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="text-white font-medium">{product.name}</TableCell>
                      <TableCell className="text-slate-400">{product.sku}</TableCell>
                      <TableCell className="text-slate-400">{product.category?.name}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Stock</span>
                            <span className="text-white">{product.stock}</span>
                          </div>
                          <Progress value={stockInfo.level} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${stockInfo.color}/20 ${stockInfo.color.replace('bg-', 'text-')}`}>
                          {stockInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
