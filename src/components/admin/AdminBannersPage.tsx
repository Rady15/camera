import { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Layout,
  Layers,
  Monitor,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Upload,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Banner {
  id: string
  title: string | null
  description: string | null
  image: string
  link: string | null
  buttonText: string | null
  position: string
  order: number
  isActive: boolean
  createdAt: string
}

const positions = [
  { value: 'hero', label: 'Main Hero Slide' },
  { value: 'middle', label: 'Middle Promo Banner' },
  { value: 'side', label: 'Side Advertisement' },
  { value: 'bottom', label: 'Bottom Banner' },
]

export function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    buttonText: '',
    position: 'hero',
    order: 0,
    isActive: true,
  })
  const [filterPosition, setFilterPosition] = useState<string>('all')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners?active=false')
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const method = editingBanner ? 'PATCH' : 'POST'
      const body = editingBanner ? { ...formData, id: editingBanner.id } : formData
      
      const res = await fetch('/api/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      if (res.ok) {
        setIsDialogOpen(false)
        setEditingBanner(null)
        setFormData({
          title: '',
          description: '',
          image: '',
          link: '',
          buttonText: '',
          position: 'hero',
          order: 0,
          isActive: true,
        })
        fetchBanners()
      }
    } catch (error) {
      console.error('Failed to save banner:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    
    try {
      const res = await fetch(`/api/banners?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) fetchBanners()
    } catch (error) {
      console.error('Failed to delete banner:', error)
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, isActive: !banner.isActive }),
      })
      fetchBanners()
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'ecommerce/banners')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }))
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      image: banner.image,
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      position: banner.position,
      order: banner.order,
      isActive: banner.isActive,
    })
    setIsDialogOpen(true)
  }

  const filteredBanners = banners.filter(b => 
    filterPosition === 'all' || b.position === filterPosition
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Banners & Hero Management</h1>
          <p className="text-slate-400">Manage your home page sliders and advertising spaces.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger className="w-48 bg-slate-900 border-slate-800 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Position" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setEditingBanner(null); setFormData({ title: '', description: '', image: '', link: '', buttonText: '', position: 'hero', order: 0, isActive: true }); }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                  placeholder="Flash Sale - 50% Off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Banner Image</Label>
                <div className="flex gap-2">
                  <Input 
                    id="image" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="bg-slate-800 border-slate-700"
                    placeholder="URL or Upload..."
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="upload-image"
                      className="hidden"
                      onChange={handleUpload}
                      accept="image/*"
                      disabled={uploading}
                    />
                    <Button 
                      asChild 
                      variant="secondary" 
                      className="cursor-pointer bg-slate-700 hover:bg-slate-600"
                      disabled={uploading}
                    >
                      <label htmlFor="upload-image">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </label>
                    </Button>
                  </div>
                </div>
                {formData.image && (
                  <div className="mt-2 aspect-[21/9] rounded-lg overflow-hidden border border-slate-800">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={v => setFormData({...formData, position: v})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {positions.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input 
                    id="order" 
                    type="number"
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Redirect Link (Optional)</Label>
                <Input 
                  id="link" 
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                  placeholder="/shop?category=cameras"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is-active">Active</Label>
                <Switch 
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={v => setFormData({...formData, isActive: v})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredBanners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanners.map(banner => (
              <Card key={banner.id} className="bg-slate-900 border-slate-800 overflow-hidden group">
                <div className="aspect-[21/9] relative overflow-hidden bg-slate-800">
                  <img 
                    src={banner.image} 
                    alt={banner.title || 'Banner'} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge className={banner.isActive ? 'bg-emerald-500/80' : 'bg-red-500/80'}>
                      {banner.isActive ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" onClick={() => openEdit(banner)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white truncate">{banner.title || 'Untitled Banner'}</h3>
                    <Badge variant="outline" className="text-slate-400 border-slate-700">
                      {banner.position}
                    </Badge>
                  </div>
                  {banner.description && (
                    <p className="text-sm text-slate-400 line-clamp-1 mb-3">{banner.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      Order: {banner.order}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-900 border-slate-800 p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-white">No banners found</h3>
            <p className="text-slate-400 mb-6">Start by creating your first hero slider or advertising banner.</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Banner
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
