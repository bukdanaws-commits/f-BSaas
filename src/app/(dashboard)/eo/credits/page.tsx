'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Minus,
  Wallet,
  Gift,
  Receipt,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Star,
  Shield,
  Sparkles,
  ChevronRight,
  Calendar,
  Search,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard'
import { CREDIT_PACKAGES } from '@/config/menu'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/auth-store'
import { useTenantWallet, useTenantTransactions } from '@/hooks/use-api'
import { api, CreditTransaction } from '@/lib/api-client'

// =====================================
// TYPES
// =====================================
interface Transaction {
  id: string
  type: 'purchase' | 'usage' | 'bonus' | 'refund'
  amount: number
  balance: number
  bonusBalance: number
  description: string
  referenceType: string | null
  referenceId: string | null
  status: 'completed' | 'pending' | 'failed'
  paymentMethod?: string
  createdAt: string
}

// =====================================
// MOCK DATA
// =====================================
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'purchase',
    amount: 500,
    balance: 500,
    bonusBalance: 50,
    description: 'Purchase: Starter Package',
    referenceType: 'midtrans',
    referenceId: 'ORD-001',
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    createdAt: '2024-03-01T10:30:00Z'
  },
  {
    id: 'tx-2',
    type: 'bonus',
    amount: 50,
    balance: 500,
    bonusBalance: 100,
    description: 'Welcome Bonus',
    referenceType: 'welcome_bonus',
    referenceId: null,
    status: 'completed',
    createdAt: '2024-03-01T10:30:00Z'
  },
  {
    id: 'tx-3',
    type: 'usage',
    amount: -50,
    balance: 450,
    bonusBalance: 100,
    description: 'Event Creation: Tech Summit 2024',
    referenceType: 'event',
    referenceId: 'event-1',
    status: 'completed',
    createdAt: '2024-03-05T14:00:00Z'
  },
  {
    id: 'tx-4',
    type: 'usage',
    amount: -75,
    balance: 375,
    bonusBalance: 100,
    description: 'Check-in Credits: 75 scans',
    referenceType: 'checkin',
    referenceId: null,
    status: 'completed',
    createdAt: '2024-03-15T09:00:00Z'
  },
  {
    id: 'tx-5',
    type: 'usage',
    amount: -25,
    balance: 350,
    bonusBalance: 100,
    description: 'AI Photo Generation: 12 photos',
    referenceType: 'ai_photo',
    referenceId: null,
    status: 'completed',
    createdAt: '2024-03-18T16:30:00Z'
  },
  {
    id: 'tx-6',
    type: 'purchase',
    amount: 500,
    balance: 850,
    bonusBalance: 100,
    description: 'Purchase: Starter Package',
    referenceType: 'midtrans',
    referenceId: 'ORD-002',
    status: 'completed',
    paymentMethod: 'Credit Card',
    createdAt: '2024-03-19T11:00:00Z'
  },
]

// Credit Package with pricing
const CREDIT_PACKAGES_EXTENDED = [
  { id: 'starter', name: 'Starter', credits: 500, price: 50000, bonus: 50, popular: false, features: ['Basic Support', 'Email Support'] },
  { id: 'growth', name: 'Growth', credits: 2500, price: 225000, bonus: 250, popular: false, features: ['Priority Support', 'Phone Support', 'API Access'] },
  { id: 'business', name: 'Business', credits: 5000, price: 400000, bonus: 500, popular: true, features: ['Dedicated Manager', '24/7 Support', 'API Access', 'Custom Reports'] },
  { id: 'enterprise', name: 'Enterprise', credits: 25000, price: 1750000, bonus: 2500, popular: false, features: ['Enterprise SLA', 'Dedicated Team', 'Custom Integration', 'Training Sessions', 'White Label Option'] },
]

const CREDIT_COSTS = [
  { action: 'Event Creation', cost: 50, icon: Zap },
  { action: 'Check-in Scan', cost: 1, icon: CheckCircle },
  { action: 'F&B Claim', cost: 1, icon: Receipt },
  { action: 'AI Photo Generation', cost: 2, icon: Sparkles },
]

// =====================================
// MAIN COMPONENT
// =====================================
export default function CreditsPage() {
  const { toast } = useToast()
  const { wallet, loading: walletLoading, refetch: refetchWallet } = useTenantWallet()
  const { transactions: apiTransactions, loading: txLoading, refetch: refetchTx } = useTenantTransactions()
  const currentUser = useAuthStore((state) => state.currentUser)

  // State
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [transactionFilter, setTransactionFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Computed
  const stats = useMemo(() => {
    const totalPurchased = localTransactions
      .filter(t => t.type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalUsed = localTransactions
      .filter(t => t.type === 'usage' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalBonus = localTransactions
      .filter(t => t.type === 'bonus' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      balance: wallet?.balance || 450,
      bonusBalance: wallet?.bonus_balance || 50,
      totalBalance: (wallet?.balance || 450) + (wallet?.bonus_balance || 50),
      totalPurchased,
      totalUsed,
      totalBonus,
      avgDailyUsage: Math.round(totalUsed / 30),
    }
  }, [localTransactions, wallet])

  const filteredTransactions = useMemo(() => {
    return localTransactions.filter(t => {
      const matchesType = transactionFilter === 'all' || t.type === transactionFilter
      return matchesType
    })
  }, [localTransactions, transactionFilter])

  // Handlers
  const handleBuyCredits = async () => {
    if (!selectedPackage) {
      toast({ title: 'Error', description: 'Pilih paket terlebih dahulu', variant: 'destructive' })
      return
    }

    setPaymentProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const pkg = CREDIT_PACKAGES_EXTENDED.find(p => p.id === selectedPackage)
    if (!pkg) return

    // Add transaction
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'purchase',
      amount: pkg.credits,
      balance: stats.balance + pkg.credits,
      bonusBalance: stats.bonusBalance + pkg.bonus,
      description: `Purchase: ${pkg.name} Package`,
      referenceType: 'midtrans',
      referenceId: `ORD-${Date.now()}`,
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString()
    }

    setLocalTransactions(prev => [newTransaction, ...prev])

    // Add bonus transaction
    if (pkg.bonus > 0) {
      const bonusTransaction: Transaction = {
        id: `tx-${Date.now()}-bonus`,
        type: 'bonus',
        amount: pkg.bonus,
        balance: newTransaction.balance,
        bonusBalance: newTransaction.bonusBalance,
        description: `${pkg.name} Package Bonus`,
        referenceType: 'package_bonus',
        referenceId: newTransaction.referenceId,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
      setLocalTransactions(prev => [bonusTransaction, ...prev])
    }

    setPaymentProcessing(false)
    setBuyDialogOpen(false)
    setSelectedPackage(null)
    
    toast({ 
      title: 'Purchase Successful!', 
      description: `${pkg.credits} credits + ${pkg.bonus} bonus added to your account` 
    })
  }

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Amount', 'Balance', 'Description', 'Status']
    const rows = localTransactions.map(t => [
      new Date(t.createdAt).toLocaleDateString('id-ID'),
      t.type,
      t.amount.toString(),
      t.balance.toString(),
      t.description,
      t.status
    ])
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `credit_transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({ title: 'Export Successful', description: 'Transactions exported to CSV' })
  }

  // Helpers
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return CreditCard
      case 'usage': return TrendingDown
      case 'bonus': return Gift
      case 'refund': return RefreshCw
      default: return DollarSign
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'text-emerald-400 bg-emerald-500/10'
      case 'usage': return 'text-red-400 bg-red-500/10'
      case 'bonus': return 'text-blue-400 bg-blue-500/10'
      case 'refund': return 'text-purple-400 bg-purple-500/10'
      default: return 'text-slate-400 bg-slate-500/10'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Render
  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Credits</h1>
          <p className="text-slate-400 mt-1">Kelola saldo credits untuk operasional event</p>
        </div>
        <Button 
          onClick={() => setBuyDialogOpen(true)} 
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buy Credits
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-sm font-medium">Main Balance</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {stats.balance.toLocaleString()}
                </p>
                <p className="text-slate-400 text-xs mt-2">Credits untuk operasional event</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Wallet className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Bonus Balance</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {stats.bonusBalance.toLocaleString()}
                </p>
                <p className="text-slate-400 text-xs mt-2">Credits promosi & bonus</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Gift className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-sm font-medium">Total Available</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {stats.totalBalance.toLocaleString()}
                </p>
                <p className="text-slate-400 text-xs mt-2">Total credits tersedia</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Sparkles className="h-8 w-8 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats & Credit Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Stats */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Usage Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-900/50">
                <p className="text-xs text-slate-400">Total Purchased</p>
                <p className="text-xl font-bold text-emerald-400">+{stats.totalPurchased}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50">
                <p className="text-xs text-slate-400">Total Used</p>
                <p className="text-xl font-bold text-red-400">-{stats.totalUsed}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50">
                <p className="text-xs text-slate-400">Total Bonus</p>
                <p className="text-xl font-bold text-blue-400">+{stats.totalBonus}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50">
                <p className="text-xs text-slate-400">Daily Avg Usage</p>
                <p className="text-xl font-bold text-amber-400">{stats.avgDailyUsage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Costs */}
        <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-amber-400" />
              Credit Costs
            </CardTitle>
            <CardDescription>Biaya credits per aksi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CREDIT_COSTS.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 text-center"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/10 w-fit mx-auto mb-2">
                      <Icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <p className="text-xs text-slate-400">{item.action}</p>
                    <p className="text-lg font-bold text-white">{item.cost} credit{item.cost > 1 ? 's' : ''}</p>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-400" />
                Transaction History
              </CardTitle>
              <CardDescription>Riwayat transaksi credits</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                <SelectTrigger className="w-[140px] bg-slate-900/50 border-slate-700">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport} className="border-slate-700 text-slate-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                  </div>
                ) : (
                  filteredTransactions.map((tx, index) => {
                    const Icon = getTransactionIcon(tx.type)
                    return (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors"
                      >
                        <div className={cn("p-2.5 rounded-lg", getTransactionColor(tx.type))}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                            {tx.status === 'pending' && (
                              <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">Pending</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {tx.paymentMethod && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {tx.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-lg font-bold",
                            tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                          )}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </p>
                          <p className="text-xs text-slate-500">
                            Balance: {tx.balance}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ===================================== */}
      {/* BUY CREDITS DIALOG */}
      {/* ===================================== */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Buy Credits
            </DialogTitle>
            <DialogDescription>
              Pilih paket credits yang sesuai kebutuhan Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CREDIT_PACKAGES_EXTENDED.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={cn(
                    "relative p-5 rounded-xl border-2 cursor-pointer transition-all",
                    selectedPackage === pkg.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 text-black text-[10px] font-medium">
                        <Star className="h-3 w-3 mr-1" />
                        POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                      <p className="text-amber-400 text-2xl font-bold">
                        {pkg.credits.toLocaleString()}
                        <span className="text-sm font-normal text-slate-400"> credits</span>
                      </p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      selectedPackage === pkg.id
                        ? "border-amber-500 bg-amber-500"
                        : "border-slate-600"
                    )}>
                      {selectedPackage === pkg.id && (
                        <CheckCircle className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-white">{formatCurrency(pkg.price)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">+{pkg.bonus} bonus credits</span>
                    </div>
                    <Separator className="bg-slate-700" />
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500">
                      Price per credit: {formatCurrency(pkg.price / pkg.credits)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            {selectedPackage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-slate-800 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Order Summary</p>
                    <p className="text-lg font-bold text-white">
                      {CREDIT_PACKAGES_EXTENDED.find(p => p.id === selectedPackage)?.name} Package
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Total Credits</p>
                    <p className="text-lg font-bold text-emerald-400">
                      +{(CREDIT_PACKAGES_EXTENDED.find(p => p.id === selectedPackage)?.credits || 0) + 
                        (CREDIT_PACKAGES_EXTENDED.find(p => p.id === selectedPackage)?.bonus || 0)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Methods */}
            {selectedPackage && (
              <div className="space-y-3">
                <Label className="text-slate-300">Payment Method</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['Bank Transfer', 'Credit Card', 'E-Wallet'].map((method) => (
                    <button
                      key={method}
                      className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-center hover:border-slate-600 transition-colors"
                    >
                      <CreditCard className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                      <span className="text-sm text-slate-300">{method}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleBuyCredits} 
              disabled={!selectedPackage || paymentProcessing}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {paymentProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
