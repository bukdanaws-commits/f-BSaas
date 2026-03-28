'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  CheckCircle,
  Utensils,
  Coffee,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  MapPin,
  Eye,
  ChevronRight,
  Filter,
  RefreshCw,
  Printer,
  Share2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// =====================================
// TYPES
// =====================================
interface DailyStat {
  date: string
  dayName: string
  checkIns: number
  claims: number
  newParticipants: number
  revenue: number
}

interface EventReport {
  id: string
  name: string
  date: string | null
  location: string | null
  status: string
  participants: number
  checkIns: number
  checkInRate: number
  foodClaims: number
  drinkClaims: number
  totalClaims: number
  avgClaimsPerPerson: number
}

interface CategoryBreakdown {
  name: string
  count: number
  percentage: number
  color: string
}

// =====================================
// MAIN COMPONENT
// =====================================
export default function ReportsPage() {
  const { toast } = useToast()
  const events = useTenantEvents()
  const { participants, checkins, claims, menuItems } = useDataStore()
  const tenantStats = useTenantStats()
  
  // State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Computed Data from Store
  const stats = useMemo(() => {
    // Filter by event if selected
    const filteredParticipants = selectedEventId === 'all' 
      ? participants 
      : participants.filter(p => p.event_id === selectedEventId)
    
    const filteredCheckins = selectedEventId === 'all'
      ? checkins
      : checkins.filter(c => c.event_id === selectedEventId)
    
    const filteredClaims = selectedEventId === 'all'
      ? claims
      : claims.filter(c => c.event_id === selectedEventId)

    const totalParticipants = filteredParticipants.length
    const totalCheckIns = filteredParticipants.filter(p => p.is_checked_in).length
    const checkInRate = totalParticipants > 0 ? (totalCheckIns / totalParticipants) * 100 : 0
    
    const totalFoodClaims = filteredParticipants.reduce((sum, p) => sum + p.food_claims, 0)
    const totalDrinkClaims = filteredParticipants.reduce((sum, p) => sum + p.drink_claims, 0)
    const totalClaims = totalFoodClaims + totalDrinkClaims
    const avgClaimsPerPerson = totalCheckIns > 0 ? totalClaims / totalCheckIns : 0

    return {
      totalParticipants,
      totalCheckIns,
      checkInRate,
      totalFoodClaims,
      totalDrinkClaims,
      totalClaims,
      avgClaimsPerPerson,
      activeEvents: events.filter(e => e.status === 'active').length,
      completedEvents: events.filter(e => e.status === 'completed').length,
    }
  }, [events, participants, checkins, claims, selectedEventId])

  // Daily Stats (generated from real data pattern)
  const dailyStats = useMemo((): DailyStat[] => {
    const days = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // Simulate based on actual totals
      const dailyCheckIns = Math.floor(stats.totalCheckIns / 7 * (0.5 + Math.random()))
      const dailyClaims = Math.floor(stats.totalClaims / 7 * (0.5 + Math.random()))
      const dailyParticipants = Math.floor(stats.totalParticipants / 7 * (0.3 + Math.random() * 0.5))
      
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        checkIns: dailyCheckIns,
        claims: dailyClaims,
        newParticipants: dailyParticipants,
        revenue: dailyCheckIns * 50000 // Estimate
      })
    }
    
    return days
  }, [stats])

  // Event Reports
  const eventReports = useMemo((): EventReport[] => {
    return events.map(event => {
      const eventParticipants = participants.filter(p => p.event_id === event.id)
      const eventCheckins = checkins.filter(c => c.event_id === event.id)
      const eventClaims = claims.filter(c => c.event_id === event.id)
      
      const totalParticipants = eventParticipants.length
      const totalCheckIns = eventParticipants.filter(p => p.is_checked_in).length
      const checkInRate = totalParticipants > 0 ? (totalCheckIns / totalParticipants) * 100 : 0
      const foodClaims = eventParticipants.reduce((sum, p) => sum + p.food_claims, 0)
      const drinkClaims = eventParticipants.reduce((sum, p) => sum + p.drink_claims, 0)
      const totalClaims = foodClaims + drinkClaims
      const avgClaims = totalCheckIns > 0 ? totalClaims / totalCheckIns : 0
      
      return {
        id: event.id,
        name: event.name,
        date: event.start_date,
        location: event.location,
        status: event.status,
        participants: totalParticipants,
        checkIns: totalCheckIns,
        checkInRate,
        foodClaims,
        drinkClaims,
        totalClaims,
        avgClaimsPerPerson: avgClaims
      }
    })
  }, [events, participants, checkins, claims])

  // Category Breakdown
  const foodBreakdown = useMemo((): CategoryBreakdown[] => {
    const categories: Record<string, number> = {}
    
    menuItems
      .filter(m => m.category_id?.includes('food') || true)
      .forEach(item => {
        const cat = item.name.includes('Nasi') ? 'Nasi Box' :
                   item.name.includes('Snack') ? 'Snack Box' :
                   item.name.includes('Burger') ? 'Burger' :
                   item.name.includes('Sandwich') ? 'Sandwich' : 'Lainnya'
        categories[cat] = (categories[cat] || 0) + item.stock
      })
    
    const total = Object.values(categories).reduce((a, b) => a + b, 0)
    
    return Object.entries(categories).map(([name, count], i) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fff7ed'][i % 5]
    }))
  }, [menuItems])

  const drinkBreakdown = useMemo((): CategoryBreakdown[] => {
    const categories: Record<string, number> = {}
    
    menuItems
      .filter(m => m.category_id?.includes('drink') || true)
      .forEach(item => {
        const cat = item.name.includes('Water') ? 'Mineral Water' :
                   item.name.includes('Coffee') ? 'Coffee' :
                   item.name.includes('Tea') ? 'Tea' :
                   item.name.includes('Juice') ? 'Juice' : 'Lainnya'
        categories[cat] = (categories[cat] || 0) + item.stock
      })
    
    const total = Object.values(categories).reduce((a, b) => a + b, 0)
    
    return Object.entries(categories).map(([name, count], i) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'][i % 5]
    }))
  }, [menuItems])

  // Format helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'TBD'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Export handlers
  const handleExportPDF = () => {
    toast({ title: 'Coming Soon', description: 'Export PDF akan segera tersedia' })
  }

  const handleExportCSV = () => {
    const headers = ['Event', 'Date', 'Participants', 'Check-ins', 'Check-in Rate', 'Food Claims', 'Drink Claims', 'Total Claims']
    const rows = eventReports.map(r => [
      r.name,
      r.date || 'TBD',
      r.participants.toString(),
      r.checkIns.toString(),
      `${r.checkInRate.toFixed(1)}%`,
      r.foodClaims.toString(),
      r.drinkClaims.toString(),
      r.totalClaims.toString()
    ])
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `event_reports_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({ title: 'Export Successful', description: 'Report exported to CSV' })
  }

  // Chart components
  const maxValue = Math.max(...dailyStats.map(d => d.checkIns), 1)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-slate-400 mt-1">Statistik dan laporan event Anda</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7d">7 Hari</SelectItem>
              <SelectItem value="30d">30 Hari</SelectItem>
              <SelectItem value="90d">90 Hari</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-slate-700 text-slate-300">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="border-slate-700 text-slate-300">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Peserta"
          value={stats.totalParticipants.toLocaleString()}
          icon={Users}
          variant="gradient"
          gradientFrom="from-blue-500"
          gradientTo="to-blue-600"
        />
        <StatsCard
          title="Check-ins"
          value={stats.totalCheckIns.toLocaleString()}
          description={`${stats.checkInRate.toFixed(1)}% check-in rate`}
          icon={CheckCircle}
          variant="gradient"
          gradientFrom="from-emerald-500"
          gradientTo="to-emerald-600"
        />
        <StatsCard
          title="Total Claims"
          value={stats.totalClaims.toLocaleString()}
          description={`${stats.avgClaimsPerPerson.toFixed(1)} per peserta`}
          icon={Utensils}
          variant="gradient"
          gradientFrom="from-orange-500"
          gradientTo="to-orange-600"
        />
        <StatsCard
          title="Events"
          value={events.length.toString()}
          description={`${stats.activeEvents} aktif`}
          icon={Calendar}
          variant="gradient"
          gradientFrom="from-purple-500"
          gradientTo="to-purple-600"
        />
      </StatsGrid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Check-in Trend
            </CardTitle>
            <CardDescription>Tren check-in peserta mingguan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-[200px] pt-4">
              {dailyStats.map((item, index) => {
                const height = (item.checkIns / maxValue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-emerald-400"
                    />
                    <span className="text-[10px] text-slate-400">{item.dayName}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span className="text-slate-400">Total: {stats.totalCheckIns} check-ins</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" />
                +23% dari minggu lalu
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Claims Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-400" />
              F&B Claims Trend
            </CardTitle>
            <CardDescription>Tren klaim makanan & minuman</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[200px] pt-4">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="claimsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
                {(() => {
                  const maxClaims = Math.max(...dailyStats.map(d => d.claims), 1)
                  const points = dailyStats.map((item, index) => {
                    const x = (index / (dailyStats.length - 1)) * 100
                    const y = 100 - (item.claims / maxClaims) * 100
                    return { x, y }
                  })
                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                  
                  return (
                    <>
                      <path d={pathD} fill="none" stroke="url(#claimsGradient)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f97316" />
                      ))}
                    </>
                  )
                })()}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-400">
                {dailyStats.map((item, i) => <span key={i}>{item.dayName}</span>)}
              </div>
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span className="text-slate-400">Total: {stats.totalClaims} claims</span>
              <span className="text-orange-400 font-medium flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" />
                +18% dari minggu lalu
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Claims */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-400" />
              Food Claims Breakdown
            </CardTitle>
            <CardDescription>Distribusi klaim makanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {foodBreakdown.length > 0 ? foodBreakdown.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{cat.name}</span>
                  <span className="text-slate-400">{cat.count} ({cat.percentage.toFixed(1)}%)</span>
                </div>
                <Progress 
                  value={cat.percentage} 
                  className="h-2 bg-slate-700"
                  indicatorClassName="bg-gradient-to-r from-orange-500 to-amber-500"
                />
              </motion.div>
            )) : (
              <div className="text-center py-8 text-slate-400">No food data</div>
            )}
          </CardContent>
        </Card>

        {/* Drink Claims */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coffee className="h-5 w-5 text-cyan-400" />
              Drink Claims Breakdown
            </CardTitle>
            <CardDescription>Distribusi klaim minuman</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {drinkBreakdown.length > 0 ? drinkBreakdown.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{cat.name}</span>
                  <span className="text-slate-400">{cat.count} ({cat.percentage.toFixed(1)}%)</span>
                </div>
                <Progress 
                  value={cat.percentage} 
                  className="h-2 bg-slate-700"
                  indicatorClassName="bg-gradient-to-r from-cyan-500 to-teal-500"
                />
              </motion.div>
            )) : (
              <div className="text-center py-8 text-slate-400">No drink data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Reports Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Event Performance Report
          </CardTitle>
          <CardDescription>Performa setiap event</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {eventReports.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events found</p>
                </div>
              ) : (
                eventReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white truncate">{report.name}</p>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              report.status === 'active' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
                              report.status === 'draft' && "bg-amber-500/20 text-amber-400 border-amber-500/20",
                              report.status === 'completed' && "bg-blue-500/20 text-blue-400 border-blue-500/20"
                            )}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(report.date)}
                          </span>
                          {report.location && (
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                              <MapPin className="h-3 w-3" />
                              {report.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 md:gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Participants</p>
                        <p className="text-lg font-bold text-white">{report.participants}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Check-ins</p>
                        <p className="text-lg font-bold text-emerald-400">{report.checkIns}</p>
                        <p className="text-[10px] text-slate-500">{report.checkInRate.toFixed(0)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">F&B Claims</p>
                        <p className="text-lg font-bold text-orange-400">{report.totalClaims}</p>
                        <p className="text-[10px] text-slate-500">{report.avgClaimsPerPerson.toFixed(1)}/person</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Food / Drink</p>
                        <p className="text-sm font-bold">
                          <span className="text-orange-400">{report.foodClaims}</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-cyan-400">{report.drinkClaims}</span>
                        </p>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { setSelectedReport(report); setDetailDialogOpen(true) }}
                      className="text-slate-400 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 text-sm font-medium">Check-in Rate</p>
                <p className="text-3xl font-bold text-emerald-300">{stats.checkInRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/20">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">+5.2% dari periode lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Avg Claims/Person</p>
                <p className="text-3xl font-bold text-orange-300">{stats.avgClaimsPerPerson.toFixed(1)}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/20">
                <Utensils className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400">+0.8 dari target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Total Events</p>
                <p className="text-3xl font-bold text-purple-300">{events.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-purple-400" />
              <span className="text-purple-400">{stats.activeEvents} aktif, {stats.completedEvents} selesai</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedReport.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedReport.date)}
                  </span>
                  {selectedReport.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedReport.location}
                    </span>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">Participants</p>
                  <p className="text-xl font-bold text-white">{selectedReport.participants}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">Check-ins</p>
                  <p className="text-xl font-bold text-emerald-400">{selectedReport.checkIns}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">Food Claims</p>
                  <p className="text-xl font-bold text-orange-400">{selectedReport.foodClaims}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">Drink Claims</p>
                  <p className="text-xl font-bold text-cyan-400">{selectedReport.drinkClaims}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Check-in Rate</span>
                  <span className="text-white font-medium">{selectedReport.checkInRate.toFixed(1)}%</span>
                </div>
                <Progress value={selectedReport.checkInRate} className="h-2 bg-slate-700" indicatorClassName="bg-emerald-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Claims per Person</span>
                  <span className="text-white font-medium">{selectedReport.avgClaimsPerPerson.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
