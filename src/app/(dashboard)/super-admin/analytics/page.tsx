'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Ticket,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Mock analytics data
const MONTHLY_DATA = [
  { month: 'Jan', tenants: 2, events: 15, revenue: 2500000, users: 45 },
  { month: 'Feb', tenants: 3, events: 22, revenue: 3200000, users: 78 },
  { month: 'Mar', tenants: 4, events: 35, revenue: 4500000, users: 156 },
  { month: 'Apr', tenants: 4, events: 28, revenue: 3800000, users: 189 },
  { month: 'May', tenants: 5, events: 42, revenue: 5200000, users: 234 },
  { month: 'Jun', tenants: 6, events: 38, revenue: 4900000, users: 278 },
]

const TOP_TENANTS = [
  { id: '1', name: 'PT Event Organizer Indonesia', events: 12, revenue: 2500000, growth: 23.5 },
  { id: '2', name: 'Creative Events ID', events: 8, revenue: 1500000, growth: 15.2 },
  { id: '3', name: 'Tech Conference Pro', events: 5, revenue: 800000, growth: -5.3 },
  { id: '4', name: 'Gathering Corp', events: 3, revenue: 500000, growth: 8.7 },
]

const EVENT_STATS = {
  total: 156,
  active: 42,
  completed: 98,
  draft: 16,
  avgParticipants: 234,
  avgCheckInRate: 78.5
}

const REVENUE_BREAKDOWN = [
  { category: 'Credit Sales', amount: 8500000, percentage: 66.7 },
  { category: 'Subscriptions', amount: 3000000, percentage: 23.5 },
  { category: 'Premium Features', amount: 1250000, percentage: 9.8 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="pt-6">
            <Building2 className="h-5 w-5 opacity-80 mb-2" />
            <p className="text-2xl font-bold">6</p>
            <p className="text-xs opacity-75">Total EO</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <Ticket className="h-5 w-5 opacity-80 mb-2" />
            <p className="text-2xl font-bold">{EVENT_STATS.total}</p>
            <p className="text-xs opacity-75">Total Events</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <Users className="h-5 w-5 opacity-80 mb-2" />
            <p className="text-2xl font-bold">1.2K</p>
            <p className="text-xs opacity-75">Total Users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="pt-6">
            <DollarSign className="h-5 w-5 opacity-80 mb-2" />
            <p className="text-2xl font-bold">12.7M</p>
            <p className="text-xs opacity-75">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="pt-6">
            <Activity className="h-5 w-5 opacity-80 mb-2" />
            <p className="text-2xl font-bold">{EVENT_STATS.avgCheckInRate}%</p>
            <p className="text-xs opacity-75">Avg Check-in</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <CardContent className="pt-6">
            <TrendingUp className="h-5 w-5 opacity-80 mb-2" />
            <p className="text-2xl font-bold">+23%</p>
            <p className="text-xs opacity-75">Growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-[#47b2e4]" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Pendapatan 6 bulan terakhir</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end gap-2">
              {MONTHLY_DATA.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.revenue / 5200000) * 100}%` }}
                    transition={{ delay: i * 0.1 }}
                    className="w-full bg-gradient-to-t from-[#37517e] to-[#47b2e4] rounded-t-lg min-h-[20px]"
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Revenue</p>
                <p className="font-bold text-lg">Rp 24.1M</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Avg Monthly</p>
                <p className="font-bold text-lg">Rp 4.02M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#47b2e4]" />
              Revenue Breakdown
            </CardTitle>
            <CardDescription>Distribusi sumber pendapatan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {REVENUE_BREAKDOWN.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      Rp {(item.amount / 1000000).toFixed(1)}M ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        i === 0 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                        i === 1 ? "bg-gradient-to-r from-blue-500 to-blue-400" :
                        "bg-gradient-to-r from-purple-500 to-purple-400"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pie Chart Visual */}
            <div className="mt-6 flex justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${66.7 * 2.51} 251`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray={`${23.5 * 2.51} 251`}
                    strokeDashoffset={`${-66.7 * 2.51}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="20"
                    strokeDasharray={`${9.8 * 2.51} 251`}
                    strokeDashoffset={`${-90.2 * 2.51}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">12.7M</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#47b2e4]" />
            Top Performing Tenants
          </CardTitle>
          <CardDescription>EO dengan performa terbaik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TOP_TENANTS.map((tenant, i) => (
              <div
                key={tenant.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tenant.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{tenant.events} events</span>
                    <span>•</span>
                    <span>Rp {(tenant.revenue / 1000000).toFixed(1)}M revenue</span>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-1 font-medium",
                  tenant.growth >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {tenant.growth >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>{tenant.growth >= 0 ? '+' : ''}{tenant.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Active Events</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{EVENT_STATS.active}</p>
              </div>
              <Activity className="h-10 w-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Completed Events</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{EVENT_STATS.completed}</p>
              </div>
              <Ticket className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Draft Events</p>
                <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">{EVENT_STATS.draft}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
