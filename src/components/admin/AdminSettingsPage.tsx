'use client'

import { useState } from 'react'
import { 
  Save, Globe, Mail, Bell, Shield, Database, 
  CreditCard, Truck, Palette, Code 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export function AdminSettingsPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'SecureVision',
    storeEmail: 'support@cctvstore.com',
    storePhone: '1-800-SECURITY',
    storeAddress: '123 Security Boulevard, San Francisco, CA 94102',
  })

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: 'SecureVision - Professional Security Cameras & CCTV Systems',
    metaDescription: 'Shop the best security cameras, DVR/NVR systems, and accessories. Professional-grade surveillance equipment for home and business.',
    metaKeywords: 'CCTV cameras, security cameras, surveillance systems, DVR, NVR',
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailOrders: true,
    emailStock: true,
    emailReviews: false,
    smsOrders: false,
    smsStock: true,
  })

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast({ title: 'Settings saved successfully' })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Configure your store settings</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-emerald-600">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-emerald-600">
            <Code className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-600">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-emerald-600">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Store Information</CardTitle>
              <CardDescription className="text-slate-400">Basic store details displayed on your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Store Name</Label>
                  <Input
                    value={generalSettings.storeName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Contact Email</Label>
                  <Input
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Phone Number</Label>
                  <Input
                    value={generalSettings.storePhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storePhone: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Address</Label>
                  <Input
                    value={generalSettings.storeAddress}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeAddress: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Free Shipping Threshold ($)</Label>
                  <Input
                    type="number"
                    defaultValue="99"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Standard Shipping Rate ($)</Label>
                  <Input
                    type="number"
                    defaultValue="9.99"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Cash on Delivery</p>
                  <p className="text-slate-400 text-sm">Allow customers to pay on delivery</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Credit Card</p>
                  <p className="text-slate-400 text-sm">Accept credit/debit card payments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">PayPal</p>
                  <p className="text-slate-400 text-sm">Accept PayPal payments</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">SEO Settings</CardTitle>
              <CardDescription className="text-slate-400">Optimize your store for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Meta Title</Label>
                <Input
                  value={seoSettings.metaTitle}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">{seoSettings.metaTitle.length}/60 characters</p>
              </div>
              <div>
                <Label className="text-slate-300">Meta Description</Label>
                <Textarea
                  value={seoSettings.metaDescription}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                  rows={3}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500 mt-1">{seoSettings.metaDescription.length}/160 characters</p>
              </div>
              <div>
                <Label className="text-slate-300">Meta Keywords</Label>
                <Input
                  value={seoSettings.metaKeywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Email Notifications</CardTitle>
              <CardDescription className="text-slate-400">Configure email alerts for important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">New Orders</p>
                  <p className="text-slate-400 text-sm">Receive email when a new order is placed</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailOrders}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailOrders: checked })}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Low Stock Alerts</p>
                  <p className="text-slate-400 text-sm">Receive email when products are running low</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailStock}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailStock: checked })}
                />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">New Reviews</p>
                  <p className="text-slate-400 text-sm">Receive email when customers leave reviews</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailReviews}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailReviews: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription className="text-slate-400">Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-slate-400 text-sm">Require 2FA for all admin accounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">IP Blocking</p>
                  <p className="text-slate-400 text-sm">Block IPs after 5 failed login attempts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Audit Logging</p>
                  <p className="text-slate-400 text-sm">Log all admin actions and changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Session Timeout</p>
                  <p className="text-slate-400 text-sm">Automatically logout after 30 minutes of inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
