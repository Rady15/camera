'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store'
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag, ChevronLeft, ChevronRight, Trash2, XCircle, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
  orders?: {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
  }[]
}

export function AdminCustomersPage() {
  const { token } = useAuthStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToManage, setCustomerToManage] = useState<Customer | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [searchQuery])

  const fetchCustomers = async () => {
    const { token: authToken } = useAuthStore.getState()
    const headers: HeadersInit | undefined = authToken ? { Authorization: `Bearer ${authToken}` } : undefined
    
    setLoading(true)
    try {
      const res = await fetch('/api/users', { headers })
      const data = await res.json()
      setCustomers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDialogOpen(true)
  }

  const handleDeactivate = async (customer: Customer) => {
    try {
      const res = await fetch(`/api/users?userId=${customer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: 'Customer deactivated' })
        setDeleteDialogOpen(false)
        fetchCustomers()
      }
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const handleHardDelete = async (customer: Customer) => {
    if (!confirm('Permanent deletion! Are you sure?')) return
    try {
      const res = await fetch(`/api/users?userId=${customer.id}&hard=true`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        toast({ title: 'Customer deleted' })
        setDeleteDialogOpen(false)
        fetchCustomers()
      }
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const toggleStatus = async (customer: Customer) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: customer.id, isActive: !customer.isActive })
      })
      if (res.ok) {
        toast({ title: customer.isActive ? 'Deactivated' : 'Activated' })
        fetchCustomers()
      }
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-slate-400">Manage customer accounts and order history</p>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Customer</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Phone</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
                <TableHead className="text-slate-400 w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={6} className="h-16 bg-slate-800/50 animate-pulse" />
                  </TableRow>
                ))
              ) : paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-emerald-600">
                          <AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{customer.email}</TableCell>
                    <TableCell className="text-slate-300">{customer.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={customer.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-slate-500/20 text-slate-400'}>
                        {customer.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={customer.isActive} 
                        onCheckedChange={() => toggleStatus(customer)}
                      />
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-white"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500"
                          onClick={() => {
                            setCustomerToManage(customer)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    No customers found
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
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

      {/* Customer Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 bg-emerald-600">
                  <AvatarFallback className="text-2xl">{selectedCustomer.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedCustomer.name}</h3>
                  <p className="text-slate-400">{selectedCustomer.email}</p>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  {selectedCustomer.email}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 text-slate-500" />
                  {selectedCustomer.phone || 'Not provided'}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Order History</h4>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div>
                          <p className="text-white font-medium">#{order.orderNumber}</p>
                          <p className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${order.total.toFixed(2)}</p>
                          <Badge className="bg-emerald-500/20 text-emerald-500">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No orders yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
       {/* Manage Customer Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              إدارة حساب العميل (حذف أو إيقاف)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              ماذا تريد أن تفعل بحساب {customerToManage?.name}؟ الإيقاف يمنع العميل من الدخول، بينما الحذف يزيل البيانات نهائياً.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              إلغاء
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => customerToManage && handleDeactivate(customerToManage)}
                className="bg-orange-600/20 text-orange-500 hover:bg-orange-600/30"
              >
                <XCircle className="h-4 w-4 ml-2" />
                إيقاف الحساب
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => customerToManage && handleHardDelete(customerToManage)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف نهائي
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
