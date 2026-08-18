'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Settings,
  AlertCircle,
  TestTube,
  ShieldCheck,
  MoveUp,
  MoveDown,
  Wallet,
  Banknote,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface PaymentMethod {
  id: string
  name: string
  code: string
  description?: string
  icon?: string
  isActive: boolean
  isTestMode: boolean
  settings?: Record<string, string>
  displayOrder: number
  createdAt: string
  updatedAt: string
}

const paymentIcons = [
  { code: 'credit-card', icon: CreditCard, label: 'Credit Card' },
  { code: 'wallet', icon: Wallet, label: 'Wallet' },
  { code: 'banknote', icon: Banknote, label: 'Cash' },
  { code: 'smartphone', icon: Smartphone, label: 'Mobile' },
]

const defaultPaymentMethods = [
  { code: 'paymob', name: 'Paymob', icon: 'wallet' },
  { code: 'cod', name: 'Cash on Delivery', icon: 'banknote' },
  { code: 'vodafone-cash', name: 'Vodafone Cash', icon: 'smartphone' },
  { code: 'fawry', name: 'Fawry', icon: 'wallet' },
]

export function AdminPaymentMethodsPage() {
  const { toast } = useToast()
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    icon: 'credit-card',
    isActive: true,
    isTestMode: true,
    settings: {} as Record<string, string>,
    displayOrder: 0,
  })

  useEffect(() => {
    fetchMethods()
  }, [])

  const fetchMethods = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment-methods')
      const data = await res.json()
      setMethods(data.methods || [])
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payment methods',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMethod = () => {
    setEditingMethod(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      icon: 'credit-card',
      isActive: true,
      isTestMode: true,
      settings: {},
      displayOrder: methods.length,
    })
    setDialogOpen(true)
  }

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      code: method.code,
      description: method.description || '',
      icon: method.icon || 'credit-card',
      isActive: method.isActive,
      isTestMode: method.isTestMode,
      settings: method.settings || {},
      displayOrder: method.displayOrder,
    })
    setDialogOpen(true)
  }

  const handleSaveMethod = async () => {
    if (!formData.name || !formData.code) {
      toast({
        title: 'Error',
        description: 'Name and code are required',
        variant: 'destructive',
      })
      return
    }

    try {
      const methodData = {
        name: formData.name,
        code: formData.code.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description || null,
        icon: formData.icon,
        isActive: formData.isActive,
        isTestMode: formData.isTestMode,
        settings: formData.settings,
        displayOrder: formData.displayOrder,
      }

      if (editingMethod) {
        const res = await fetch('/api/payment-methods', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            methodId: editingMethod.id,
            ...methodData,
          }),
        })
        if (res.ok) {
          toast({ title: 'Payment method updated' })
        } else {
          const error = await res.json()
          throw new Error(error.error || 'Failed to update')
        }
      } else {
        const res = await fetch('/api/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodData),
        })
        if (res.ok) {
          toast({ title: 'Payment method created' })
        } else {
          const error = await res.json()
          throw new Error(error.error || 'Failed to create')
        }
      }

      setDialogOpen(false)
      fetchMethods()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save payment method',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteMethod = async () => {
    if (!deletingMethod) return

    try {
      const res = await fetch(`/api/payment-methods?methodId=${deletingMethod.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'Payment method deleted' })
        setDeleteDialogOpen(false)
        setDeletingMethod(null)
        fetchMethods()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete payment method',
        variant: 'destructive',
      })
    }
  }

  const toggleMethodStatus = async (method: PaymentMethod) => {
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          methodId: method.id,
          isActive: !method.isActive,
        }),
      })
      if (res.ok) {
        toast({
          title: method.isActive ? 'Method disabled' : 'Method enabled',
        })
        fetchMethods()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update method status',
        variant: 'destructive',
      })
    }
  }

  const toggleTestMode = async (method: PaymentMethod) => {
    try {
      const res = await fetch('/api/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          methodId: method.id,
          isTestMode: !method.isTestMode,
        }),
      })
      if (res.ok) {
        toast({
          title: method.isTestMode ? 'Live mode enabled' : 'Test mode enabled',
        })
        fetchMethods()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update test mode',
        variant: 'destructive',
      })
    }
  }

  const moveMethodOrder = async (method: PaymentMethod, direction: 'up' | 'down') => {
    const currentIndex = methods.findIndex((m) => m.id === method.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= methods.length) return

    const targetMethod = methods[targetIndex]

    try {
      // Swap display orders
      await Promise.all([
        fetch('/api/payment-methods', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            methodId: method.id,
            displayOrder: targetMethod.displayOrder,
          }),
        }),
        fetch('/api/payment-methods', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            methodId: targetMethod.id,
            displayOrder: method.displayOrder,
          }),
        }),
      ])
      fetchMethods()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      })
    }
  }

  const filteredMethods = methods.filter(
    (method) =>
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getIconComponent = (iconCode?: string) => {
    const found = paymentIcons.find((p) => p.code === iconCode)
    return found?.icon || CreditCard
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
          <p className="text-slate-400">Configure payment gateways and options</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddMethod}>
          <Plus className="h-4 w-4 ml-2" />
          Add Method
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Methods</p>
                <p className="text-2xl font-bold text-white">{methods.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Check className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-2xl font-bold text-white">{methods.filter((m) => m.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TestTube className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Test Mode</p>
                <p className="text-2xl font-bold text-white">{methods.filter((m) => m.isTestMode).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Live Mode</p>
                <p className="text-2xl font-bold text-white">{methods.filter((m) => !m.isTestMode).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search payment methods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Methods Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400 w-12">Order</TableHead>
                <TableHead className="text-slate-400">Method</TableHead>
                <TableHead className="text-slate-400">Code</TableHead>
                <TableHead className="text-slate-400">Mode</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={6} className="h-16">
                      <Skeleton className="h-8 w-full bg-slate-800" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredMethods.length > 0 ? (
                filteredMethods.map((method, index) => {
                  const IconComponent = getIconComponent(method.icon)
                  return (
                    <TableRow key={method.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-500 hover:text-white"
                            onClick={() => moveMethodOrder(method, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-500 hover:text-white"
                            onClick={() => moveMethodOrder(method, 'down')}
                            disabled={index === filteredMethods.length - 1}
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg">
                            <IconComponent className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{method.name}</p>
                            {method.description && (
                              <p className="text-sm text-slate-400 line-clamp-1">{method.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-slate-800 rounded text-sm text-slate-300">
                          {method.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            method.isTestMode
                              ? 'bg-orange-500/20 text-orange-500'
                              : 'bg-purple-500/20 text-purple-500'
                          }
                        >
                          {method.isTestMode ? (
                            <>
                              <TestTube className="h-3 w-3 ml-1" />
                              Test
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3 w-3 ml-1" />
                              Live
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={method.isActive}
                            onCheckedChange={() => toggleMethodStatus(method)}
                          />
                          <Badge
                            className={
                              method.isActive
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'bg-slate-500/20 text-slate-400'
                            }
                          >
                            {method.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white"
                            onClick={() => handleEditMethod(method)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-orange-400"
                            onClick={() => toggleTestMode(method)}
                            title={method.isTestMode ? 'Switch to Live' : 'Switch to Test'}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-400"
                            onClick={() => {
                              setDeletingMethod(method)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    <CreditCard className="h-8 w-8 mx-auto mb-2" />
                    <p>No payment methods found</p>
                    <Button
                      variant="link"
                      className="text-emerald-500"
                      onClick={handleAddMethod}
                    >
                      Add your first method
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure payment gateway settings and options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Paymob"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., paymob"
                    className="bg-slate-800 border-slate-700 text-white font-mono"
                    disabled={!!editingMethod}
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the payment method"
                  rows={2}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
              </div>
              <div>
                <Label className="text-slate-300">Icon</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {paymentIcons.map((icon) => {
                    const IconComp = icon.icon
                    return (
                      <button
                        key={icon.code}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: icon.code })}
                        className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                          formData.icon === icon.code
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <IconComp className="h-5 w-5" />
                        <span className="text-xs">{icon.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Status Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Active</Label>
                  <p className="text-sm text-slate-400">Enable for checkout</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Test Mode</Label>
                  <p className="text-sm text-slate-400">Use sandbox/test environment</p>
                </div>
                <Switch
                  checked={formData.isTestMode}
                  onCheckedChange={(checked) => setFormData({ ...formData, isTestMode: checked })}
                />
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Quick Add Buttons */}
            {!editingMethod && (
              <div>
                <Label className="text-slate-300 mb-2 block">Quick Add</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultPaymentMethods.map((pm) => (
                    <Button
                      key={pm.code}
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-slate-300"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          name: pm.name,
                          code: pm.code,
                          icon: pm.icon,
                        })
                      }}
                    >
                      {pm.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSaveMethod}
              disabled={!formData.name || !formData.code}
            >
              {editingMethod ? 'Update Method' : 'Add Method'}
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
              Delete Payment Method
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{deletingMethod?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMethod}>
              <Trash2 className="h-4 w-4 ml-2" />
              Delete Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
