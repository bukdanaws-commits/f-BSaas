'use client'

import { Loader2 } from 'lucide-react'
import { 
  Building2, 
  Users, 
  Ticket, 
  CreditCard, 
  TrendingUp, 
  Activity,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAdminDashboard, useAdminTenants } from '@/hooks/use-api'

export default function SuperAdminDashboard() {
  const { stats, loading: statsLoading } = useAdminDashboard()
  const { tenants, loading: tenantsLoading } = useAdminTenants()
  
  const loading = statsLoading || tenantsLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#47b2e4]" />
      </div>
    )
  }

  // Calculate tenant status counts
  const activeTenants = tenants.filter(t => t.status === 'active').length
  const pendingTenants = tenants.filter(t => t.status === 'pending').length
  const suspendedTenants = tenants.filter(t => t.status === 'suspended').length

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Total EO</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.total_tenants || tenants.length}</p>
            <p className="text-xs opacity-75 mt-1">{activeTenants} aktif</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Events</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.total_events || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Users</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.total_users || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Revenue</span>
            </div>
            <p className="text-3xl font-bold mt-2">Rp {((stats?.total_revenue || 0) / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Active</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.active_tenants || 0}</p>
            <p className="text-xs opacity-75 mt-1">tenants</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Events</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats?.active_events || 0}</p>
            <p className="text-xs opacity-75 mt-1">active</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#47b2e4]" />
            Tenant Terbaru
          </CardTitle>
          <CardDescription>Daftar tenant pada platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {tenants.slice(0, 10).map((tenant) => (
                <div key={tenant.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className={cn(
                    "p-2 rounded-full",
                    tenant.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 
                    tenant.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  )}>
                    <Building2 className={cn(
                      "h-4 w-4",
                      tenant.status === 'active' ? 'text-emerald-600' : 
                      tenant.status === 'pending' ? 'text-amber-600' :
                      'text-red-600'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tenant.name}</p>
                    <p className="text-sm text-muted-foreground">{tenant.owner_id || 'No owner'}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    tenant.status === 'active' && 'text-emerald-600 border-emerald-600',
                    tenant.status === 'pending' && 'text-amber-600 border-amber-600',
                    tenant.status === 'suspended' && 'text-red-600 border-red-600'
                  )}>
                    {tenant.status}
                  </Badge>
                </div>
              ))}
              {tenants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tenants found
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Tenant Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{activeTenants}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{pendingTenants}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Suspended</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{suspendedTenants}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
