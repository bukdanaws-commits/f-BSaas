'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Database,
  Palette,
  Mail,
  Save,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Mock settings
const INITIAL_SETTINGS = {
  platform: {
    name: 'Eventify',
    description: 'SaaS Event Management Platform',
    domain: 'eventify.goopps.id',
    supportEmail: 'support@eventify.id',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
  },
  payment: {
    midtransServerKey: '••••••••••••••••',
    midtransClientKey: '••••••••••••••••',
    sandboxMode: true,
    autoConfirmPayment: true,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    newTenantAlert: true,
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    ipWhitelist: false,
    auditLog: true,
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
  }

  const updateSetting = (category: keyof typeof INITIAL_SETTINGS, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="platform" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full">
          <TabsTrigger value="platform" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Platform</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifikasi</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#47b2e4]" />
                Platform Settings
              </CardTitle>
              <CardDescription>Konfigurasi dasar platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Nama Platform</Label>
                  <Input
                    id="platform-name"
                    value={settings.platform.name}
                    onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-domain">Domain</Label>
                  <Input
                    id="platform-domain"
                    value={settings.platform.domain}
                    onChange={(e) => updateSetting('platform', 'domain', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email Support</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.platform.supportEmail}
                    onChange={(e) => updateSetting('platform', 'supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.platform.timezone}
                    onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  value={settings.platform.description}
                  onChange={(e) => updateSetting('platform', 'description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#47b2e4]" />
                Payment Gateway Settings
              </CardTitle>
              <CardDescription>Konfigurasi payment gateway (Midtrans)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-500 text-white">Sandbox Mode</Badge>
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    Mode pengembangan aktif
                  </span>
                </div>
                <Switch
                  checked={settings.payment.sandboxMode}
                  onCheckedChange={(checked) => updateSetting('payment', 'sandboxMode', checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="server-key">Server Key</Label>
                  <Input
                    id="server-key"
                    type="password"
                    value={settings.payment.midtransServerKey}
                    onChange={(e) => updateSetting('payment', 'midtransServerKey', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-key">Client Key</Label>
                  <Input
                    id="client-key"
                    type="password"
                    value={settings.payment.midtransClientKey}
                    onChange={(e) => updateSetting('payment', 'midtransClientKey', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Auto Confirm Payment</p>
                  <p className="text-sm text-muted-foreground">
                    Otomatis konfirmasi pembayaran yang sukses
                  </p>
                </div>
                <Switch
                  checked={settings.payment.autoConfirmPayment}
                  onCheckedChange={(checked) => updateSetting('payment', 'autoConfirmPayment', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#47b2e4]" />
                Notification Settings
              </CardTitle>
              <CardDescription>Konfigurasi notifikasi sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Kirim notifikasi via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Kirim notifikasi via SMS' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Laporan mingguan ke email admin' },
                { key: 'newTenantAlert', label: 'New Tenant Alert', desc: 'Notifikasi saat ada tenant baru' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                    onCheckedChange={(checked) => updateSetting('notifications', item.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#47b2e4]" />
                Security Settings
              </CardTitle>
              <CardDescription>Konfigurasi keamanan platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Wajibkan 2FA untuk semua admin
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (menit)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium">IP Whitelist</p>
                  <p className="text-sm text-muted-foreground">
                    Batasi akses berdasarkan IP address
                  </p>
                </div>
                <Switch
                  checked={settings.security.ipWhitelist}
                  onCheckedChange={(checked) => updateSetting('security', 'ipWhitelist', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium">Audit Log</p>
                  <p className="text-sm text-muted-foreground">
                    Catat semua aktivitas sistem
                  </p>
                </div>
                <Switch
                  checked={settings.security.auditLog}
                  onCheckedChange={(checked) => updateSetting('security', 'auditLog', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-[#47b2e4]" />
                System Information
              </CardTitle>
              <CardDescription>Informasi sistem dan status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="text-lg font-bold">v1.0.0</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Database</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    PostgreSQL (Supabase)
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Backend</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Golang Fiber
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Frontend</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Next.js 16
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">System Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
