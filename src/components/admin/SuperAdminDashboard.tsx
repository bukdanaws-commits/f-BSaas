'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  Ticket, 
  CreditCard, 
  TrendingUp, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Activity,
  DollarSign,
  Calendar,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SuperAdminDashboardProps {
  onLogout?: () => void
}

type SuperAdminView = 'dashboard' | 'tenants' | 'billing' | 'analytics' | 'settings'

// Mock data - will be replaced with Supabase data
const MOCK_TENANTS = [
  { id: '1', name: 'PT Event Organizer Indonesia', slug: 'eoi', status: 'active', owner: 'John Doe', email: 'john@eoi.com', events: 12, credits: 5250, revenue: 2500000, createdAt: '2024-01-15' },
  { id: '2', name: 'Creative Events ID', slug: 'creative', status: 'active', owner: 'Jane Smith', email: 'jane@creative.id', events: 8, credits: 3200, revenue: 1500000, createdAt: '2024-02-20' },
  { id: '3', name: 'Gathering Corp', slug: 'gathering', status: 'pending', owner: 'Bob Wilson', email: 'bob@gathering.com', events: 0, credits: 550, revenue: 0, createdAt: '2024-03-10' },
  { id: '4', name: 'Tech Conference Pro', slug: 'techconf', status: 'suspended', owner: 'Alice Chen', email: 'alice@techconf.id', events: 3, credits: 0, revenue: 500000, createdAt: '2024-01-05' },
]

const MOCK_TRANSACTIONS = [
  { id: '1', tenant: 'PT Event Organizer Indonesia', type: 'purchase', amount: 5000, price: 400000, status: 'completed', date: '2024-03-15' },
  { id: '2', tenant: 'Creative Events ID', type: 'purchase', amount: 2500, price: 225000, status: 'completed', date: '2024-03-14' },
  { id: '3', tenant: 'Gathering Corp', type: 'bonus', amount: 50, price: 0, status: 'completed', date: '2024-03-10' },
  { id: '4', tenant: 'PT Event Organizer Indonesia', type: 'usage', amount: -150, price: 0, status: 'completed', date: '2024-03-15' },
]

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity, color: 'from-slate-600 to-slate-700' },
  { id: 'tenants', label: 'Kelola EO', icon: Building2, color: 'from-emerald-500 to-emerald-600' },
  { id: 'billing', label: 'Billing', icon: CreditCard, color: 'from-amber-500 to-amber-600' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
]

export default function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [currentView, setCurrentView] = useState<SuperAdminView>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  
  const [stats] = useState({
    totalTenants: 4,
    activeTenants: 2,
    pendingTenants: 1,
    suspendedTenants: 1,
    totalEvents: 23,
    totalUsers: 156,
    totalRevenue: 4500000,
    totalCreditsSold: 12500,
    monthlyGrowth: 23.5,
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    if (onLogout) onLogout()
  }

  const filteredTenants = MOCK_TENANTS.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
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
        
      case 'tenants':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Kelola Event Organizer</h2>
                <p className="text-muted-foreground">Manage all registered EO tenants</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search EO..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tenant List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTenants.map((tenant) => (
                <Card key={tenant.id} className="overflow-hidden">
                  <div className={cn(
                    "h-1",
                    tenant.status === 'active' ? 'bg-emerald-500' :
                    tenant.status === 'pending' ? 'bg-amber-500' :
                    'bg-red-500'
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#47b2e4] to-[#37517e] flex items-center justify-center text-white font-bold">
                          {tenant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                          <CardDescription>{tenant.email}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tenant.status === 'pending' && (
                            <DropdownMenuItem className="text-emerald-600">
                              <CheckCircle className="h-4 w-4 mr-2" /> Approve
                            </DropdownMenuItem>
                          )}
                          {tenant.status === 'active' && (
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {tenant.status === 'suspended' && (
                            <DropdownMenuItem className="text-emerald-600">
                              <CheckCircle className="h-4 w-4 mr-2" /> Reactivate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Owner</span>
                      <span className="font-medium">{tenant.owner}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{tenant.events}</p>
                        <p className="text-xs text-muted-foreground">Events</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#47b2e4]">{tenant.credits.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Credits</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">Rp {(tenant.revenue / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="outline" className={cn(
                        tenant.status === 'active' ? 'border-emerald-500 text-emerald-600' :
                        tenant.status === 'pending' ? 'border-amber-500 text-amber-600' :
                        'border-red-500 text-red-600'
                      )}>
                        {tenant.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(tenant.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
        
      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Billing & Revenue</h2>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Revenue analytics coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )
        
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-slate-900 text-white flex flex-col fixed h-full z-50"
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="font-bold text-lg">Super Admin</h1>
                  <p className="text-xs text-slate-400">Platform Owner</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Menu */}
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as SuperAdminView)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                  )}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Logout & Collapse */}
        <div className="p-3 border-t border-slate-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
          >
            <div className="p-2 rounded-lg bg-slate-800">
              <LogOut className="h-5 w-5" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col transition-all"
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Super Admin Panel • {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-3xl font-bold text-amber-500">
                  {currentTime.toLocaleTimeString('id-ID')}
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-500" />
              <span>SaaS Platform Management</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <a href="https://goopps.id/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#47b2e4] hover:underline">
                Goopps.id
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
