'use client'

import { useState, useEffect } from 'react'
import {
  Users, Search, Filter, MoreHorizontal, Shield, UserCog, Mail, Phone,
  Calendar, ShoppingBag, Star, Edit, Trash2, Check, X, AlertCircle,
  ChevronLeft, ChevronRight, Key, Eye, EyeOff, RefreshCw, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  avatar: string | null
  isActive: boolean
  emailVerified: Date | null
  lastLogin: Date | null
  createdAt: Date
  _count?: {
    orders: number
    reviews: number
    wishlists: number
  }
  totalSpent?: number
}

const roleConfig: Record<string, { label: string; color: string; description: string }> = {
  admin: { label: 'Admin', color: 'bg-red-500/20 text-red-500', description: 'Full system access' },
  manager: { label: 'Manager', color: 'bg-purple-500/20 text-purple-500', description: 'Store management' },
  support: { label: 'Support', color: 'bg-blue-500/20 text-blue-500', description: 'Customer support' },
  customer: { label: 'Customer', color: 'bg-slate-500/20 text-slate-400', description: 'Regular customer' },
}

export function AdminUsersPage() {
  const { toast } = useToast()
  const { user: currentUser, token } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    role: '',
    isActive: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, statusFilter])

  const fetchUsers = async () => {
    const { token: authToken } = useAuthStore.getState()
    const headers: HeadersInit | undefined = authToken ? { Authorization: `Bearer ${authToken}` } : undefined
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '10')
      if (searchQuery) params.append('search', searchQuery)
      if (roleFilter !== 'all') params.append('role', roleFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/users?${params.toString()}`, { headers })
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalUsers(data.pagination?.total || 0)
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchUsers()
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive,
    })
    setEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: editFormData.name,
          phone: editFormData.phone,
          role: editFormData.role,
          isActive: editFormData.isActive,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'User updated',
          description: 'User information has been updated successfully',
        })
        setEditDialogOpen(false)
        fetchUsers()
      } else {
        throw new Error(data.error || 'Failed to update user')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      })
    }
  }

  const handleDeactivateUser = async () => {
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/users?userId=${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'User deactivated',
          description: 'User has been deactivated successfully',
        })
        setDeleteDialogOpen(false)
        fetchUsers()
      } else {
        throw new Error(data.error || 'Failed to deactivate user')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate user',
        variant: 'destructive',
      })
    }
  }

  const handleHardDeleteUser = async () => {
    if (!selectedUser) return
    if (!confirm('Warning: Permanent deletion cannot be undone. All data for this user will be removed. Proceed?')) return

    try {
      const res = await fetch(`/api/users?userId=${selectedUser.id}&hard=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'User removed',
          description: 'User has been permanently deleted from the database',
        })
        setDeleteDialogOpen(false)
        fetchUsers()
      } else {
        throw new Error(data.error || 'Failed to delete user')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive',
      })
    }
  }

  const toggleUserStatus = async (user: User) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          isActive: !user.isActive,
        }),
      })

      if (res.ok) {
        toast({
          title: user.isActive ? 'User deactivated' : 'User activated',
        })
        fetchUsers()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate stats
  const stats = {
    total: totalUsers,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.isActive).length,
    newThisMonth: users.filter(u => {
      const created = new Date(u.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Permissions</h1>
          <p className="text-slate-400">Manage user accounts and access permissions</p>
        </div>
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300"
          onClick={fetchUsers}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 ml-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
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
                <p className="text-sm text-slate-400">Active Users</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Admins</p>
                <p className="text-2xl font-bold text-white">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">New This Month</p>
                <p className="text-2xl font-bold text-white">{stats.newThisMonth}</p>
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
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Orders</TableHead>
                <TableHead className="text-slate-400">Total Spent</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
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
                          <Skeleton className="h-3 w-32 bg-slate-800" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user) => {
                  const roleConf = roleConfig[user.role] || roleConfig.customer
                  return (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 bg-slate-700">
                            <AvatarFallback className="bg-emerald-600 text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleConf.color}>{roleConf.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => toggleUserStatus(user)}
                            disabled={user.id === currentUser?.id}
                          />
                          <Badge
                            className={
                              user.isActive
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'bg-slate-500/20 text-slate-400'
                            }
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4 text-slate-500" />
                          {user._count?.orders || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-emerald-500 font-medium">
                        {formatCurrency(user.totalSpent || 0)}
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem
                              className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 ml-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                            >
                              <Key className="h-4 w-4 ml-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-slate-300 hover:bg-slate-700 cursor-pointer"
                            >
                              <Mail className="h-4 w-4 ml-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-slate-700 cursor-pointer"
                              onClick={() => {
                                setSelectedUser(user)
                                setDeleteDialogOpen(true)
                              }}
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              Manage User (Delete/Stop)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>No users found</p>
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
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
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
            <span className="text-slate-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              {/* User Avatar */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
                <Avatar className="h-12 w-12 bg-slate-700">
                  <AvatarFallback className="bg-emerald-600 text-white text-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <Label className="text-slate-300">Name</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Phone */}
              <div>
                <Label className="text-slate-300">Phone</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  dir="ltr"
                />
              </div>

              {/* Role */}
              <div>
                <Label className="text-slate-300">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{config.label}</span>
                          <span className="text-xs text-slate-400">{config.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Active Status</Label>
                  <p className="text-sm text-slate-400">Allow user to login</p>
                </div>
                <Switch
                  checked={editFormData.isActive}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, isActive: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSaveUser}
            >
              Save Changes
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
              إدارة حساب المستخدم (حذف أو إيقاف)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              ماذا تريد أن تفعل بهذا الحساب؟ الإيقاف يمنع الدخول، بينما الحذف يزيل البيانات نهائياً.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="p-4 bg-slate-800 rounded-lg my-4 text-right">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-slate-700">
                  <AvatarFallback className="bg-emerald-600 text-white">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-300 w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="secondary" 
                onClick={handleDeactivateUser}
                className="flex-1 sm:flex-none bg-orange-600/20 text-orange-500 hover:bg-orange-600/30"
              >
                <XCircle className="h-4 w-4 ml-2" />
                إيقاف الحساب
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleHardDeleteUser}
                className="flex-1 sm:flex-none"
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
