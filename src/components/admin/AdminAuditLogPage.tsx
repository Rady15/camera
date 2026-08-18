'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, User, Clock, Activity, Shield, Package, ShoppingCart, Settings, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string
  userId?: string
  userName?: string
  ipAddress?: string
  createdAt: string
  details?: string
}

const actionConfig: Record<string, { label: string; color: string; icon: any }> = {
  create: { label: 'Created', color: 'bg-emerald-500/20 text-emerald-500', icon: Activity },
  update: { label: 'Updated', color: 'bg-blue-500/20 text-blue-500', icon: Activity },
  delete: { label: 'Deleted', color: 'bg-red-500/20 text-red-500', icon: Activity },
  login: { label: 'Login', color: 'bg-purple-500/20 text-purple-500', icon: Shield },
  logout: { label: 'Logout', color: 'bg-slate-500/20 text-slate-400', icon: Shield },
  export: { label: 'Export', color: 'bg-orange-500/20 text-orange-500', icon: Activity },
}

const entityTypeConfig: Record<string, { label: string; icon: any }> = {
  product: { label: 'Product', icon: Package },
  order: { label: 'Order', icon: ShoppingCart },
  user: { label: 'User', icon: User },
  settings: { label: 'Settings', icon: Settings },
  coupon: { label: 'Coupon', icon: Activity },
}


export function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [entityFilter, setEntityFilter] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/audit-logs')
      const data = await res.json()
      if (data.logs) {
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter
    return matchesSearch && matchesAction && matchesEntity
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-slate-400">Track all administrative actions and changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-slate-400">Total Actions</p>
                <p className="text-2xl font-bold text-white">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">Product Changes</p>
                <p className="text-2xl font-bold text-white">{logs.filter(l => l.entityType === 'product').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-slate-400">Order Changes</p>
                <p className="text-2xl font-bold text-white">{logs.filter(l => l.entityType === 'order').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-slate-400">Logins Today</p>
                <p className="text-2xl font-bold text-white">{logs.filter(l => l.action === 'login').length}</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(actionConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(entityTypeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">Entity</TableHead>
                <TableHead className="text-slate-400">Details</TableHead>
                <TableHead className="text-slate-400">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
                    <p className="mt-2 text-slate-400">Loading audit logs...</p>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const actionConf = actionConfig[log.action] || { label: log.action, color: 'bg-slate-500/20 text-slate-400', icon: Activity }
                  const entityConf = entityTypeConfig[log.entityType] || { label: log.entityType, icon: Activity }
                  const ActionIcon = actionConf.icon
                  const EntityIcon = entityConf.icon
                  const { date, time } = formatDate(log.createdAt)

                  return (
                    <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-white text-sm">{date}</p>
                            <p className="text-slate-400 text-xs">{time}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <span className="text-white">{log.userName || 'System'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionConf.color}>
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {actionConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EntityIcon className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-300">{entityConf.label}</span>
                          {log.entityId && (
                            <code className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                              {log.entityId}
                            </code>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 max-w-xs truncate">
                        {log.details}
                      </TableCell>
                      <TableCell className="text-slate-400 font-mono text-sm">
                        {log.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    No logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export */}
      <div className="flex justify-end">
        <Button variant="outline" className="border-slate-700 text-slate-300">
          Export Logs
        </Button>
      </div>
    </div>
  )
}
