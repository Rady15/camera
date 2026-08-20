'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Package,
  Check,
  X,
  Globe,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface ShippingZone {
  id: string
  name: string
  regions: string[]
  baseRate: number
  freeAbove: number | null
  estimatedDays: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const egyptianRegions = [
  'Cairo',
  'Alexandria',
  'Giza',
  'Qalyubia',
  'Port Said',
  'Suez',
  'Dakahlia',
  'Sharqia',
  'Gharbia',
  'Monufia',
  'Beheira',
  'Ismailia',
  'Kafr El Sheikh',
  'Damietta',
  'Fayoum',
  'Beni Suef',
  'Minya',
  'Assiut',
  'Sohag',
  'Qena',
  'Luxor',
  'Aswan',
  'Red Sea',
  'New Valley',
  'Matrouh',
  'North Sinai',
  'South Sinai',
]

export function AdminShippingPage() {
  const { toast } = useToast()
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [deletingZone, setDeletingZone] = useState<ShippingZone | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    regions: [] as string[],
    baseRate: '',
    freeAbove: '',
    estimatedDays: '',
    isActive: true,
  })

  useEffect(() => {
    fetchZones()
  }, [])

  const fetchZones = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/shipping')
      const data = await res.json()
      setZones(data.zones || [])
    } catch (error) {
      console.error('Failed to fetch shipping zones:', error)
      toast({
        title: 'Error',
        description: 'Failed to load shipping zones',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddZone = () => {
    setEditingZone(null)
    setFormData({
      name: '',
      regions: [],
      baseRate: '',
      freeAbove: '',
      estimatedDays: '',
      isActive: true,
    })
    setDialogOpen(true)
  }

  const handleEditZone = (zone: ShippingZone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      regions: zone.regions || [],
      baseRate: zone.baseRate.toString(),
      freeAbove: zone.freeAbove?.toString() || '',
      estimatedDays: zone.estimatedDays || '',
      isActive: zone.isActive,
    })
    setDialogOpen(true)
  }

  const handleSaveZone = async () => {
    if (!formData.name || !formData.baseRate) {
      toast({
        title: 'Error',
        description: 'Name and base rate are required',
        variant: 'destructive',
      })
      return
    }

    try {
      const zoneData = {
        name: formData.name,
        regions: formData.regions,
        baseRate: parseFloat(formData.baseRate),
        freeAbove: formData.freeAbove ? parseFloat(formData.freeAbove) : null,
        estimatedDays: formData.estimatedDays || null,
        isActive: formData.isActive,
      }

      if (editingZone) {
        const res = await fetch('/api/shipping', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zoneId: editingZone.id,
            ...zoneData,
          }),
        })
        if (res.ok) {
          toast({ title: 'Shipping zone updated' })
        } else {
          throw new Error('Failed to update')
        }
      } else {
        const res = await fetch('/api/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zoneData),
        })
        if (res.ok) {
          toast({ title: 'Shipping zone created' })
        } else {
          throw new Error('Failed to create')
        }
      }

      setDialogOpen(false)
      fetchZones()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save shipping zone',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteZone = async () => {
    if (!deletingZone) return

    try {
      const res = await fetch(`/api/shipping?zoneId=${deletingZone.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'Shipping zone deleted' })
        setDeleteDialogOpen(false)
        setDeletingZone(null)
        fetchZones()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete shipping zone',
        variant: 'destructive',
      })
    }
  }

  const toggleZoneStatus = async (zone: ShippingZone) => {
    try {
      const res = await fetch('/api/shipping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneId: zone.id,
          isActive: !zone.isActive,
        }),
      })
      if (res.ok) {
        toast({
          title: zone.isActive ? 'Zone deactivated' : 'Zone activated',
        })
        fetchZones()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update zone status',
        variant: 'destructive',
      })
    }
  }

  const toggleRegion = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }))
  }

  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.regions.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Shipping Management</h1>
          <p className="text-slate-400">Configure shipping zones and delivery rates</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddZone}>
          <Plus className="h-4 w-4 ml-2" />
          Add Zone
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Truck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Zones</p>
                <p className="text-2xl font-bold text-white">{zones.length}</p>
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
                <p className="text-sm text-slate-400">Active Zones</p>
                <p className="text-2xl font-bold text-white">{zones.filter((z) => z.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Globe className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Regions Covered</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(zones.flatMap((z) => z.regions)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Min. Rate</p>
                <p className="text-2xl font-bold text-white">
                  ${Math.min(...zones.map((z) => z.baseRate), 0).toFixed(2)}
                </p>
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
              placeholder="Search zones or regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Zones Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Zone Name</TableHead>
                <TableHead className="text-slate-400">Regions</TableHead>
                <TableHead className="text-slate-400">Base Rate</TableHead>
                <TableHead className="text-slate-400">Free Above</TableHead>
                <TableHead className="text-slate-400">Est. Delivery</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <TableRow key={i} className="border-slate-800">
                    <TableCell colSpan={7} className="h-16">
                      <Skeleton className="h-8 w-full bg-slate-800" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredZones.length > 0 ? (
                filteredZones.map((zone) => (
                  <TableRow key={zone.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-white">{zone.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {zone.regions.slice(0, 3).map((region) => (
                          <Badge key={region} variant="outline" className="text-xs border-slate-700 text-slate-300">
                            {region}
                          </Badge>
                        ))}
                        {zone.regions.length > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                            +{zone.regions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      ${zone.baseRate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {zone.freeAbove ? `$${zone.freeAbove.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {zone.estimatedDays || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={zone.isActive}
                          onCheckedChange={() => toggleZoneStatus(zone)}
                        />
                        <Badge
                          className={
                            zone.isActive
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : 'bg-slate-500/20 text-slate-400'
                          }
                        >
                          {zone.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-white"
                          onClick={() => handleEditZone(zone)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-400"
                          onClick={() => {
                            setDeletingZone(zone)
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
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <Truck className="h-8 w-8 mx-auto mb-2" />
                    <p>No shipping zones found</p>
                    <Button
                      variant="link"
                      className="text-emerald-500"
                      onClick={handleAddZone}
                    >
                      Create your first zone
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Define a shipping zone with regions and delivery rates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Zone Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Greater Cairo"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Estimated Delivery</Label>
                  <Input
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                    placeholder="e.g., 2-3 days"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Pricing</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Base Rate (SAR) *</Label>
                  <Input
                    type="number"
                    value={formData.baseRate}
                    onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Free Shipping Above (SAR)</Label>
                  <Input
                    type="number"
                    value={formData.freeAbove}
                    onChange={(e) => setFormData({ ...formData, freeAbove: e.target.value })}
                    placeholder="e.g., 500"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Regions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Regions</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300"
                  onClick={() => {
                    if (formData.regions.length === egyptianRegions.length) {
                      setFormData({ ...formData, regions: [] })
                    } else {
                      setFormData({ ...formData, regions: [...egyptianRegions] })
                    }
                  }}
                >
                  {formData.regions.length === egyptianRegions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-800 rounded-lg">
                {egyptianRegions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      formData.regions.includes(region)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                {formData.regions.length} region(s) selected
              </p>
            </div>

            <Separator className="bg-slate-700" />

            {/* Status */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Active Status</Label>
                <p className="text-sm text-slate-400">Enable this zone for checkout</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
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
              onClick={handleSaveZone}
              disabled={!formData.name || !formData.baseRate}
            >
              {editingZone ? 'Update Zone' : 'Create Zone'}
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
              Delete Shipping Zone
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{deletingZone?.name}"? This action cannot be undone.
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
            <Button variant="destructive" onClick={handleDeleteZone}>
              <Trash2 className="h-4 w-4 ml-2" />
              Delete Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
