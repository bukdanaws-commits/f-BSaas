'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Utensils, 
  Monitor, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
  Users,
  Coffee,
  Clock,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import CheckinSection from './CheckinSection'
import ClaimSection from './ClaimSection'
import DisplayMonitorSection from './DisplayMonitorSection'

interface CrewDashboardProps {
  userName?: string
  eventName?: string
  onLogout?: () => void
}

type CrewView = 'dashboard' | 'checkin' | 'claim' | 'display'

interface Stats {
  totalParticipants: number
  checkedIn: number
  notCheckedIn: number
  totalFoodClaims: number
  totalDrinkClaims: number
  totalClaims: number
  checkInRate: number
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Activity, 
    color: 'from-slate-500 to-slate-600',
    description: 'Statistik & ringkasan'
  },
  { 
    id: 'checkin', 
    label: 'Check-in', 
    icon: CheckCircle, 
    color: 'from-emerald-500 to-emerald-600',
    description: 'Scan QR peserta untuk check-in'
  },
  { 
    id: 'claim', 
    label: 'Claim Makanan', 
    icon: Utensils, 
    color: 'from-orange-500 to-orange-600',
    description: 'Proses klaim makanan & minuman'
  },
  { 
    id: 'display', 
    label: 'Display Screen', 
    icon: Monitor, 
    color: 'from-blue-500 to-blue-600',
    description: 'Monitor display welcome screen'
  },
]

export default function CrewDashboard({ 
  userName = 'Panitia', 
  eventName = 'Event Name',
  onLogout 
}: CrewDashboardProps) {
  const [currentView, setCurrentView] = useState<CrewView>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats, setStats] = useState<Stats>({
    totalParticipants: 250,
    checkedIn: 45,
    notCheckedIn: 205,
    totalFoodClaims: 120,
    totalDrinkClaims: 85,
    totalClaims: 205,
    checkInRate: 18,
  })

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior
      window.location.reload()
    }
  }

  const handleRefresh = async () => {
    // TODO: Fetch fresh stats from Supabase
    console.log('Refreshing stats...')
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Peserta</p>
                      <p className="text-3xl font-bold">{stats.totalParticipants}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Sudah Check-in</p>
                      <p className="text-3xl font-bold">{stats.checkedIn}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-emerald-200" />
                  </div>
                  <div className="mt-3">
                    <Progress value={stats.checkInRate} className="h-2 bg-emerald-700" />
                    <p className="text-xs mt-1 text-emerald-100">{stats.checkInRate}% hadir</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Food Claims</p>
                      <p className="text-3xl font-bold">{stats.totalFoodClaims}</p>
                    </div>
                    <Utensils className="h-10 w-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100 text-sm">Drink Claims</p>
                      <p className="text-3xl font-bold">{stats.totalDrinkClaims}</p>
                    </div>
                    <Coffee className="h-10 w-10 text-cyan-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-emerald-200"
                onClick={() => setCurrentView('checkin')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Check-in Peserta</CardTitle>
                      <CardDescription>Scan QR untuk check-in</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-orange-200"
                onClick={() => setCurrentView('claim')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      <Utensils className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Claim Makanan</CardTitle>
                      <CardDescription>Proses klaim food/drink</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-200"
                onClick={() => setCurrentView('display')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <Monitor className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Display Screen</CardTitle>
                      <CardDescription>Welcome monitor</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Progress Kehadiran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Check-in Rate</span>
                  <span className="text-2xl font-bold text-emerald-600">{stats.checkInRate}%</span>
                </div>
                <Progress value={stats.checkInRate} className="h-4" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</p>
                    <p className="text-sm text-muted-foreground">Hadir</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-2xl font-bold text-slate-600">{stats.notCheckedIn}</p>
                    <p className="text-sm text-muted-foreground">Belum Hadir</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case 'checkin':
        return <CheckinSection />
      case 'claim':
        return <ClaimSection />
      case 'display':
        return <DisplayMonitorSection />
      default:
        return <CheckinSection />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-gradient-to-b from-[#37517e] to-[#2a3d5e] text-white flex flex-col fixed h-full z-50 shadow-2xl"
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#47b2e4] to-[#37517e] p-2.5 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <h1 className="font-bold text-lg">Panitia Panel</h1>
                  <p className="text-xs text-slate-300">{eventName}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#47b2e4] flex items-center justify-center font-bold text-sm">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-medium text-sm">{userName}</p>
                <Badge className="text-xs bg-[#47b2e4] text-white">Panitia</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as CrewView)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all text-left group",
                  isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : "hover:bg-white/10 text-slate-200 hover:text-white"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-lg transition-all flex-shrink-0",
                  isActive ? "bg-white/20" : "bg-white/10 group-hover:bg-white/20"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <AnimatePresence mode="wait">
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>

        {/* Logout & Collapse */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-all"
          >
            <div className="p-2.5 rounded-lg bg-white/10">
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
            className="w-full justify-center text-slate-300 hover:text-white hover:bg-white/10"
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
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#37517e] dark:text-white">
                {menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-3xl font-bold text-[#47b2e4]">
                  {currentTime.toLocaleTimeString('id-ID')}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                className="gap-2 border-[#47b2e4] text-[#47b2e4] hover:bg-[#47b2e4] hover:text-white"
              >
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
        <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{eventName}</span>
              <span className="text-slate-300">|</span>
              <span>Panitia Panel</span>
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
