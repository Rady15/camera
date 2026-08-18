'use client'

import { useEffect, useState } from 'react'
import { 
  MapPin, Plus, Pencil, Trash2, Star, Phone, Home, 
  Building, Check, AlertCircle, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { useAuthStore, Address } from '@/store'
import { toast } from 'sonner'

interface AddressFormData {
  name: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

const initialFormData: AddressFormData = {
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'Egypt',
  isDefault: false,
}

const egyptianGovernorates = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'الغربية',
  'المنوفية',
  'القليوبية',
  'كفر الشيخ',
  'الغربية',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'أسوان',
  'الأقصر',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'بورسعيد',
  'السويس',
  'الإسماعيلية',
  'دمياط',
  'الفيوم',
  'بني سويف',
]

export function SavedAddressesPage() {
  const { user, token } = useAuthStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressFormData>(initialFormData)

  useEffect(() => {
    if (user && token) {
      fetchAddresses()
    }
  }, [user, token])

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok) {
        setAddresses(data.addresses || [])
      } else {
        toast.error('فشل في تحميل العناوين')
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
      toast.error('فشل في تحميل العناوين')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddDialog = () => {
    setEditingAddress(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'Egypt',
      isDefault: address.isDefault,
    })
    setIsDialogOpen(true)
  }

  const handleSaveAddress = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال الاسم')
      return
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('يرجى إدخال رقم هاتف صحيح')
      return
    }
    if (!formData.street.trim()) {
      toast.error('يرجى إدخال العنوان')
      return
    }
    if (!formData.city.trim()) {
      toast.error('يرجى إدخال المدينة')
      return
    }
    if (!formData.state.trim()) {
      toast.error('يرجى إدخال المحافظة')
      return
    }

    setSaving(true)
    try {
      if (editingAddress) {
        // Update existing address
        const res = await fetch('/api/addresses', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            addressId: editingAddress.id,
            ...formData,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success('تم تحديث العنوان بنجاح')
          setIsDialogOpen(false)
          fetchAddresses()
        } else {
          toast.error(data.error || 'فشل في تحديث العنوان')
        }
      } else {
        // Create new address
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success('تم إضافة العنوان بنجاح')
          setIsDialogOpen(false)
          fetchAddresses()
        } else {
          toast.error(data.error || 'فشل في إضافة العنوان')
        }
      }
    } catch (error) {
      console.error('Failed to save address:', error)
      toast.error('فشل في حفظ العنوان')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAddress = async (address: Address) => {
    setAddressToDelete(address)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return

    try {
      const res = await fetch(`/api/addresses?addressId=${addressToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('تم حذف العنوان بنجاح')
        fetchAddresses()
      } else {
        toast.error(data.error || 'فشل في حذف العنوان')
      }
    } catch (error) {
      console.error('Failed to delete address:', error)
      toast.error('فشل في حذف العنوان')
    } finally {
      setIsDeleteDialogOpen(false)
      setAddressToDelete(null)
    }
  }

  const handleSetDefault = async (address: Address) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: address.id,
          isDefault: true,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('تم تعيين العنوان كافتراضي')
        fetchAddresses()
      } else {
        toast.error(data.error || 'فشل في تعيين العنوان')
      }
    } catch (error) {
      console.error('Failed to set default address:', error)
      toast.error('فشل في تعيين العنوان')
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">عناويني</h2>
          <p className="text-sm text-slate-500">إدارة عناوين التوصيل</p>
        </div>
        <Button
          onClick={handleOpenAddDialog}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة عنوان جديد
        </Button>
      </div>

      {/* Address List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">لا توجد عناوين محفوظة</h3>
            <p className="text-slate-500 mb-6">
              أضف عنواناً جديداً لتسهيل عملية الشراء
            </p>
            <Button
              onClick={handleOpenAddDialog}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة عنوان جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`relative ${address.isDefault ? 'border-emerald-500' : ''}`}
            >
              {address.isDefault && (
                <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-xs py-1 px-3 rounded-t-lg flex items-center justify-center gap-1">
                  <Star className="h-3 w-3" />
                  العنوان الافتراضي
                </div>
              )}
              <CardContent className={`p-6 ${address.isDefault ? 'pt-8' : ''}`}>
                <div className="space-y-3">
                  {/* Name */}
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-900">{address.name}</span>
                  </div>

                  {/* Address */}
                  <p className="text-slate-600 text-sm">
                    {address.street}
                  </p>
                  <p className="text-slate-600 text-sm">
                    {address.city}، {address.state}، {address.zipCode}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {address.country}
                  </p>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{address.phone}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditDialog(address)}
                    >
                      <Pencil className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address)}
                      >
                        <Star className="h-4 w-4 ml-1" />
                        تعيين كافتراضي
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteAddress(address)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">الاسم *</Label>
              <Input
                id="name"
                placeholder="اسم المستلم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                placeholder="01xxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
              />
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">العنوان التفصيلي *</Label>
              <Input
                id="street"
                placeholder="اسم الشارع، رقم العمارة، رقم الشقة"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">المدينة / المنطقة *</Label>
              <Input
                id="city"
                placeholder="المدينة"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">المحافظة *</Label>
              <Input
                id="state"
                placeholder="اختر المحافظة"
                list="governorates"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <datalist id="governorates">
                {egyptianGovernorates.map((gov) => (
                  <option key={gov} value={gov} />
                ))}
              </datalist>
            </div>

            {/* ZipCode */}
            <div className="space-y-2">
              <Label htmlFor="zipCode">الرمز البريدي *</Label>
              <Input
                id="zipCode"
                placeholder="الرمز البريدي"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                dir="ltr"
              />
            </div>

            {/* Default */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                تعيين كعنوان افتراضي
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveAddress}
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 ml-1" />
                  {editingAddress ? 'حفظ التغييرات' : 'إضافة العنوان'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا العنوان؟
              <br />
              <span className="text-slate-600">
                {addressToDelete?.street}، {addressToDelete?.city}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAddress}
              className="bg-red-500 hover:bg-red-600"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
