'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// Mock billing data
const BILLING_HISTORY = [
  { id: '1', tenant: 'PT Event Organizer Indonesia', type: 'credit_purchase', amount: 5000, price: 400000, date: '2024-03-15', status: 'completed', method: 'bank_transfer' },
  { id: '2', tenant: 'Creative Events ID', type: 'credit_purchase', amount: 2500, price: 225000, date: '2024-03-14', status: 'completed', method: 'credit_card' },
  { id: '3', tenant: 'Gathering Corp', type: 'subscription', amount: 1, price: 150000, date: '2024-03-10', status: 'completed', method: 'bank_transfer' },
  { id: '4', tenant: 'Tech Conference Pro', type: 'credit_purchase', amount: 1000, price: 90000, date: '2024-03-08', status: 'pending', method: 'e_wallet' },
  { id: '5', tenant: 'PT Event Organizer Indonesia', type: 'credit_purchase', amount: 3000, price: 255000, date: '2024-03-05', status: 'completed', method: 'credit_card' },
]

const PRICING_PACKAGES = [
  { id: '1', name: 'Starter', credits: 500, price: 50000, bonus: 25, popular: false },
  { id: '2', name: 'Basic', credits: 1500, price: 135000, bonus: 100, popular: false },
  { id: '3', name: 'Professional', credits: 5000, price: 400000, bonus: 500, popular: true },
  { id: '4', name: 'Enterprise', credits: 15000, price: 1050000, bonus: 2000, popular: false },
]

const stats = {
  totalRevenue: 12750000,
  monthlyRevenue: 4500000,
  pendingPayments: 90000,
  totalTransactions: 156,
  revenueGrowth: 23.5
}

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_purchase': return 'Pembelian Kredit'
      case 'subscription': return 'Langganan'
      default: return type
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Transfer Bank'
      case 'credit_card': return 'Kartu Kredit'
      case 'e_wallet': return 'E-Wallet'
      default: return method
    }
  }

  const filteredHistory = BILLING_HISTORY.filter(item =>
    item.tenant.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">Rp {(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Revenue Bulan Ini</p>
                <p className="text-2xl font-bold">Rp {(stats.monthlyRevenue / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs text-blue-100">+{stats.revenueGrowth}%</span>
                </div>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold">Rp {stats.pendingPayments.toLocaleString()}</p>
              </div>
              <CreditCard className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <FileText className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#47b2e4]" />
            Paket Harga Kredit
          </CardTitle>
          <CardDescription>Paket pembelian kredit yang tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-colors",
                  pkg.popular
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                {pkg.popular && (
                  <Badge className="mb-2 bg-amber-500 text-white">Popular</Badge>
                )}
                <h3 className="font-bold text-lg">{pkg.name}</h3>
                <p className="text-2xl font-bold mt-2 text-[#47b2e4]">
                  Rp {pkg.price.toLocaleString()}
                </p>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>{pkg.credits.toLocaleString()} kredit</p>
                  {pkg.bonus > 0 && (
                    <p className="text-emerald-500">+{pkg.bonus} bonus</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#47b2e4]" />
                Riwayat Transaksi
              </CardTitle>
              <CardDescription>Daftar semua transaksi pembayaran</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari tenant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className={cn(
                    "p-3 rounded-full",
                    item.status === 'completed'
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
                  )}>
                    <Building2 className={cn(
                      "h-5 w-5",
                      item.status === 'completed' ? "text-emerald-600" : "text-amber-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.tenant}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{getTypeLabel(item.type)}</span>
                      <span>•</span>
                      <span>{getMethodLabel(item.method)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Rp {item.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">+{item.amount.toLocaleString()} credits</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} className={cn(
                      item.status === 'completed'
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    )}>
                      {item.status === 'completed' ? 'Selesai' : 'Pending'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
