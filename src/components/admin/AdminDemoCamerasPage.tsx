'use client'

import { useState, useEffect } from 'react'
import {
  Camera, Video, Play, Pause, RefreshCw, Maximize2, Volume2, VolumeX,
  Settings, Wifi, WifiOff, AlertCircle, Grid, List, Search, Filter,
  Plus, Edit, Trash2, ExternalLink, Check, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface DemoCamera {
  id: string
  name: string
  location: string
  streamUrl: string
  thumbnailUrl: string
  isActive: boolean
  isLive: boolean
  resolution: string
  cameraType: string
  lastChecked: string
}

// Mock demo cameras with real demo stream URLs
const demoCameras: DemoCamera[] = [
  {
    id: '1',
    name: 'Office Entrance',
    location: 'Main Building - Ground Floor',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=225&fit=crop',
    isActive: true,
    isLive: true,
    resolution: '4K',
    cameraType: 'bullet',
    lastChecked: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Parking Lot A',
    location: 'Outdoor - North Side',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop',
    isActive: true,
    isLive: true,
    resolution: '8MP',
    cameraType: 'dome',
    lastChecked: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Server Room',
    location: 'IT Department - Room 101',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop',
    isActive: true,
    isLive: true,
    resolution: '2MP',
    cameraType: 'turret',
    lastChecked: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Reception Area',
    location: 'Main Building - Lobby',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop',
    isActive: true,
    isLive: true,
    resolution: '4MP',
    cameraType: 'ptz',
    lastChecked: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Warehouse',
    location: 'Storage Facility - Zone B',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=225&fit=crop',
    isActive: true,
    isLive: true,
    resolution: '4K',
    cameraType: 'bullet',
    lastChecked: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Garden Area',
    location: 'Outdoor - East Wing',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=225&fit=crop',
    isActive: false,
    isLive: false,
    resolution: '2MP',
    cameraType: 'dome',
    lastChecked: new Date(Date.now() - 3600000).toISOString(),
  },
]

// Demo stream URLs for different camera views
const demoStreamUrls = [
  'https://www.youtube.com/embed/jNQXAC9IVRw?autoplay=1&mute=1&controls=0',
  'https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1&mute=1&controls=0',
  'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0',
  'https://www.youtube.com/embed/JGwWNGJdvx8?autoplay=1&mute=1&controls=0',
  'https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&mute=1&controls=0',
  'https://www.youtube.com/embed/RgKAFK5djSk?autoplay=1&mute=1&controls=0',
]

export function AdminDemoCamerasPage() {
  const { toast } = useToast()
  const [cameras, setCameras] = useState<DemoCamera[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'offline'>('all')
  const [selectedCamera, setSelectedCamera] = useState<DemoCamera | null>(null)
  const [fullscreenCamera, setFullscreenCamera] = useState<DemoCamera | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    // Simulate loading demo cameras
    setTimeout(() => {
      setCameras(demoCameras)
      setLoading(false)
    }, 1000)
  }, [])

  const refreshCameraStatus = async (cameraId: string) => {
    toast({
      title: 'Refreshing...',
      description: 'Checking camera connection status',
    })

    // Simulate API call
    setTimeout(() => {
      setCameras(prev => prev.map(cam => 
        cam.id === cameraId 
          ? { ...cam, isLive: Math.random() > 0.1, lastChecked: new Date().toISOString() }
          : cam
      ))
      toast({
        title: 'Status updated',
        description: 'Camera status has been refreshed',
      })
    }, 1500)
  }

  const filteredCameras = cameras.filter(camera => {
    const matchesSearch = camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          camera.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'live' && camera.isLive) ||
                          (statusFilter === 'offline' && !camera.isLive)
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: cameras.length,
    live: cameras.filter(c => c.isLive).length,
    offline: cameras.filter(c => !c.isLive).length,
    totalViews: cameras.length * 128, // Mock view count
  }

  const getCameraIcon = (type: string) => {
    switch (type) {
      case 'bullet': return '🔫'
      case 'dome': return '🔵'
      case 'ptz': return '🔄'
      case 'turret': return '👁️'
      default: return '📹'
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Demo Cameras</h1>
          <p className="text-slate-400">Manage live camera demo streams</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 ml-2" />
            Add Camera
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Camera className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Cameras</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Wifi className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Live Streams</p>
                <p className="text-2xl font-bold text-white">{stats.live}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <WifiOff className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Offline</p>
                <p className="text-2xl font-bold text-white">{stats.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Video className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Views</p>
                <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
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
                placeholder="Search cameras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live Only</SelectItem>
                <SelectItem value="offline">Offline Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Camera Grid/List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800">
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full bg-slate-800 rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-24 bg-slate-800" />
                  <Skeleton className="h-3 w-32 bg-slate-800" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCameras.map((camera) => (
            <Card key={camera.id} className="bg-slate-900 border-slate-800 overflow-hidden group">
              <div className="relative aspect-video bg-slate-800">
                {camera.isLive ? (
                  <iframe
                    src={camera.streamUrl}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <img
                      src={camera.thumbnailUrl}
                      alt={camera.name}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <WifiOff className="h-12 w-12 text-red-500" />
                    </div>
                  </div>
                )}
                
                {/* Overlay Controls */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 text-white hover:bg-black/70"
                    onClick={() => refreshCameraStatus(camera.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 text-white hover:bg-black/70"
                    onClick={() => setFullscreenCamera(camera)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={camera.isLive ? 'bg-emerald-500' : 'bg-red-500'}>
                    {camera.isLive ? (
                      <>
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse ml-1" />
                        LIVE
                      </>
                    ) : (
                      'OFFLINE'
                    )}
                  </Badge>
                </div>

                {/* Resolution Badge */}
                <div className="absolute bottom-2 left-2">
                  <Badge variant="outline" className="bg-black/50 border-0 text-white text-xs">
                    {camera.resolution}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                      <span>{getCameraIcon(camera.cameraType)}</span>
                      {camera.name}
                    </h3>
                    <p className="text-sm text-slate-400">{camera.location}</p>
                  </div>
                  <Switch
                    checked={camera.isActive}
                    onCheckedChange={() => {
                      setCameras(prev => prev.map(c => 
                        c.id === camera.id ? { ...c, isActive: !c.isActive } : c
                      ))
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 flex-1"
                    onClick={() => setSelectedCamera(camera)}
                  >
                    <Settings className="h-4 w-4 ml-1" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300"
                    onClick={() => refreshCameraStatus(camera.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">Camera</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">Location</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">Type</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">Resolution</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">Status</th>
                  <th className="text-right p-4 text-slate-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCameras.map((camera) => (
                  <tr key={camera.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-slate-800 rounded overflow-hidden">
                          <img
                            src={camera.thumbnailUrl}
                            alt={camera.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-white">{camera.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{camera.location}</td>
                    <td className="p-4">
                      <span className="mr-1">{getCameraIcon(camera.cameraType)}</span>
                      <span className="text-slate-300">{camera.cameraType}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="border-slate-700 text-slate-300">
                        {camera.resolution}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={camera.isLive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}>
                        {camera.isLive ? 'Live' : 'Offline'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-white"
                          onClick={() => setFullscreenCamera(camera)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-white"
                          onClick={() => setSelectedCamera(camera)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Camera View */}
      {fullscreenCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-slate-900">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-semibold">{fullscreenCamera.name}</h2>
              <Badge className={fullscreenCamera.isLive ? 'bg-emerald-500' : 'bg-red-500'}>
                {fullscreenCamera.isLive ? 'LIVE' : 'OFFLINE'}
              </Badge>
              <span className="text-slate-400 text-sm">{fullscreenCamera.location}</span>
            </div>
            <Button
              variant="ghost"
              className="text-white"
              onClick={() => setFullscreenCamera(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 bg-black">
            {fullscreenCamera.isLive ? (
              <iframe
                src={fullscreenCamera.streamUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <WifiOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-white text-xl">Camera Offline</p>
                  <p className="text-slate-400">This camera is currently not available</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 p-4 bg-slate-900">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={() => refreshCameraStatus(fullscreenCamera.id)}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={() => setSelectedCamera(fullscreenCamera)}
            >
              <Settings className="h-4 w-4 ml-2" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Camera Settings Dialog */}
      <Dialog open={!!selectedCamera && !fullscreenCamera} onOpenChange={() => setSelectedCamera(null)}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">Camera Settings</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure camera stream settings
            </DialogDescription>
          </DialogHeader>
          {selectedCamera && (
            <div className="space-y-4 pt-4">
              <div>
                <Label className="text-slate-300">Camera Name</Label>
                <Input
                  value={selectedCamera.name}
                  className="bg-slate-800 border-slate-700 text-white"
                  readOnly
                />
              </div>
              <div>
                <Label className="text-slate-300">Location</Label>
                <Input
                  value={selectedCamera.location}
                  className="bg-slate-800 border-slate-700 text-white"
                  readOnly
                />
              </div>
              <div>
                <Label className="text-slate-300">Stream URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedCamera.streamUrl}
                    className="bg-slate-800 border-slate-700 text-white font-mono text-xs"
                    dir="ltr"
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-700 text-slate-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Type</Label>
                  <Input
                    value={selectedCamera.cameraType}
                    className="bg-slate-800 border-slate-700 text-white"
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Resolution</Label>
                  <Input
                    value={selectedCamera.resolution}
                    className="bg-slate-800 border-slate-700 text-white"
                    readOnly
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Active</Label>
                  <p className="text-sm text-slate-400">Enable this camera stream</p>
                </div>
                <Switch checked={selectedCamera.isActive} />
              </div>
              <div className="text-sm text-slate-400">
                <p>Last checked: {new Date(selectedCamera.lastChecked).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedCamera(null)}
              className="border-slate-700 text-slate-300"
            >
              Close
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Camera Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Demo Camera</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new camera to the demo system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-slate-300">Camera Name *</Label>
              <Input
                placeholder="e.g., Main Entrance"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Location *</Label>
              <Input
                placeholder="e.g., Building A - Floor 1"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Stream URL</Label>
              <Input
                placeholder="https://..."
                className="bg-slate-800 border-slate-700 text-white font-mono text-xs"
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Camera Type</Label>
                <Select defaultValue="bullet">
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="bullet">Bullet</SelectItem>
                    <SelectItem value="dome">Dome</SelectItem>
                    <SelectItem value="ptz">PTZ</SelectItem>
                    <SelectItem value="turret">Turret</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Resolution</Label>
                <Select defaultValue="4mp">
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="2mp">2MP</SelectItem>
                    <SelectItem value="4mp">4MP</SelectItem>
                    <SelectItem value="8mp">8MP</SelectItem>
                    <SelectItem value="4k">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                toast({ title: 'Camera added successfully' })
                setAddDialogOpen(false)
              }}
            >
              Add Camera
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
