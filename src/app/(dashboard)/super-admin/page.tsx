'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  Clock,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// Mock data
const MOCK_TENANTS = [
  { id: '1', name: 'PT Event Organizer Indonesia', status: 'active', owner: 'John Doe', events: 12, credits: 5250, revenue: 2500000 },
  { id: '2', name: 'Creative Events ID', status: 'active', owner: 'Jane Smith', events: 8, credits: 3200, revenue: 1500000 },
  { id: '3', name: 'Gathering Corp', status: 'pending', owner: 'Bob Wilson', events: 0, credits: 550, revenue: 0 },
  { id: '4', name: 'Tech Conference Pro', status: 'suspended', owner: 'Alice Chen', events: 3, credits: 0, revenue: 500000 },
]

const MOCK_TRANSACTIONS = [
  { id: '1', tenant: 'PT Event Organizer Indonesia', type: 'purchase', amount: 5000, price: 400000, date: '2024-03-15' },
  { id: '2', tenant: 'Creative Events ID', type: 'purchase', amount: 2500, price: 225000, date: '2024-03-14' },
  { id: '3', tenant: 'Gathering Corp', type: 'bonus', amount: 50, price: 0, date: '2024-03-10' },
  { id: '4', tenant: 'PT Event Organizer Indonesia', type: 'usage', amount: -150, price: 0, date: '2024-03-15' },
]

const stats = {
  totalTenants: 4,
  activeTenants: 2,
  pendingTenants: 1,
  suspendedTenants: 1,
  totalEvents: 23,
  totalUsers: 156,
  totalRevenue: 4500000,
  totalCreditsSold: 12500,
  monthlyGrowth: 23.5,
}

export default function SuperAdminDashboard() {
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
            <p className="text-3xl font-bold mt-2">{stats.totalTenants}</p>
            <p className="text-xs opacity-75 mt-1">{stats.activeTenants} aktif</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Events</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.totalEvents}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Users</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Revenue</span>
            </div>
            <p className="text-3xl font-bold mt-2">Rp {(stats.totalRevenue / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Credits</span>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.totalCreditsSold.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">terjual</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 opacity-80" />
              <span className="text-sm opacity-90">Growth</span>
            </div>
            <p className="text-3xl font-bold mt-2">+{stats.monthlyGrowth}%</p>
            <p className="text-xs opacity-75 mt-1">bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#47b2e4]" />
            Transaksi Terbaru
          </CardTitle>
          <CardDescription>Activity log platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {MOCK_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className={cn(
                    "p-2 rounded-full",
                    tx.type === 'purchase' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 
                    tx.type === 'usage' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  )}>
                    {tx.type === 'purchase' ? (
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                    ) : tx.type === 'usage' ? (
                      <Activity className="h-4 w-4 text-orange-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tx.tenant}</p>
                    <p className="text-sm text-muted-foreground capitalize">{tx.type}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      tx.amount > 0 ? 'text-emerald-600' : 'text-orange-600'
                    )}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </p>
                    {tx.price > 0 && (
                      <p className="text-xs text-muted-foreground">Rp {tx.price.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))}
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
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats.activeTenants}</p>
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
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.pendingTenants}</p>
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
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.suspendedTenants}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
