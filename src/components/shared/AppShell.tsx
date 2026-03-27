'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Ticket,
  ShieldCheck,
  Building2,
  RefreshCw,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuthStore, useDataStore, useTenantWallet } from '@/stores/mock-store'

interface AppShellProps {
  children: React.ReactNode
  activeMenu: string
  onMenuChange: (menu: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-amber-400' },
  { id: 'events', label: 'Events', icon: Calendar, color: 'text-purple-400' },
  { id: 'credits', label: 'Credits', icon: CreditCard, color: 'text-emerald-400' },
  { id: 'team', label: 'Team', icon: Users, color: 'text-blue-400' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-400' },
]

export default function AppShell({ children, activeMenu, onMenuChange }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const { currentUser, logout } = useAuthStore()
  const resetToMock = useDataStore((state) => state.resetToMock)
  const wallet = useTenantWallet()

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    logout()
  }

  const getRoleBadge = () => {
    switch (currentUser?.role) {
      case 'super_admin':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20">Super Admin</Badge>
      case 'owner':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20">EO Owner</Badge>
      case 'admin':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">Admin</Badge>
      case 'crew':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">Crew</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-slate-700 text-white"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? 80 : 280,
          x: mobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0)
        }}
        className={cn(
          "bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col fixed h-full z-40",
          "lg:translate-x-0 transition-transform"
        )}
        style={{ 
          transform: typeof window !== 'undefined' && window.innerWidth < 1024 
            ? `translateX(${mobileMenuOpen ? 0 : -280}px)` 
            : 'none'
        }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="min-w-0"
                >
                  <h1 className="font-bold text-lg text-white truncate">
                    {currentUser?.role === 'super_admin' ? 'Platform Admin' : 'Eventify'}
                  </h1>
                  <p className="text-xs text-slate-400 truncate">
                    {currentUser?.tenant?.name || 'Event Management'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Credit Balance (for non-super-admin) */}
        {currentUser?.role !== 'super_admin' && wallet && !sidebarCollapsed && (
          <div className="p-4 mx-3 mt-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
            <div className="text-xs text-slate-400 mb-1">Credit Balance</div>
            <div className="text-2xl font-bold text-emerald-400">
              {(wallet.balance + wallet.bonus_balance).toLocaleString()}
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-slate-400">
                Main: <span className="text-white">{wallet.balance.toLocaleString()}</span>
              </span>
              <span className="text-slate-400">
                Bonus: <span className="text-teal-400">{wallet.bonus_balance.toLocaleString()}</span>
              </span>
            </div>
          </div>
        )}

        {/* Menu */}
        <ScrollArea className="flex-1 p-3 mt-2">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onMenuChange(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group",
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white shadow-lg border border-amber-500/30"
                      : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive 
                      ? "bg-amber-500/20 shadow-inner" 
                      : "bg-slate-800/50 group-hover:bg-slate-700/50"
                  )}>
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? item.color : '')} />
                  </div>
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "font-medium",
                          isActive ? "text-white" : "text-slate-300"
                        )}
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

        {/* User & Logout */}
        <div className="p-3 border-t border-slate-700/50 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9 border-2 border-slate-700">
              <AvatarImage src={currentUser?.user.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm">
                {currentUser?.user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-white truncate">{currentUser?.user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{currentUser?.user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all group"
          >
            <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-red-500/10">
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
          
          {/* Collapse Button - Desktop Only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-center text-slate-400 hover:text-white hover:bg-slate-800/50 hidden lg:flex"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 flex flex-col transition-all min-h-screen",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-70"
        )}
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarCollapsed ? 80 : 280) : 0 }}
      >
        {/* Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="lg:hidden w-8" /> {/* Spacer for mobile menu button */}
            <div className="flex-1 lg:flex-none">
              <div className="flex items-center gap-3">
                {getRoleBadge()}
                <span className="text-slate-400 text-sm hidden sm:inline">
                  {currentTime.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-2xl font-bold text-amber-400 font-mono">
                  {currentTime.toLocaleTimeString('id-ID')}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => resetToMock()}
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-xl border-t border-slate-700/50 px-4 lg:px-6 py-4 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span>Eventify - Event Management System © 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Powered by</span>
              <span className="text-amber-400 font-medium">SaaS Platform</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
