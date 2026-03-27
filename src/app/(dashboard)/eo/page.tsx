'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  MonitorPlay,
  Utensils,
  DollarSign,
  Plus,
  ArrowRight,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuthStore, useTenantStats, useTenantEvents, useTenantWallet } from '@/stores/mock-store'

export default function EODashboard() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const stats = useTenantStats()
  const events = useTenantEvents()
  const wallet = useTenantWallet()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome, {currentUser?.user?.name}!
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your events today
          </p>
        </div>
        <Link href="/eo/events">
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-slate-400">Events</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{stats.totalEvents}</div>
            <div className="text-xs text-slate-500">{stats.activeEvents} active</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <span className="text-sm text-slate-400">Participants</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{stats.totalParticipants}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-slate-400">Check-ins</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{stats.totalCheckIns}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-pink-400" />
              <span className="text-sm text-slate-400">F&B Claims</span>
            </div>
            <div className="text-2xl font-bold text-white mt-2">{stats.totalClaims}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-slate-400">Credits</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              {stats.credits.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                My Events
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your events
              </CardDescription>
            </div>
            <Link href="/eo/events">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 mb-4">No events yet</p>
              <Link href="/eo/events">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                  Create Your First Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{event.name}</p>
                      <Badge variant="outline" className={cn(
                        "text-[10px] h-5",
                        event.status === 'active' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
                        event.status === 'draft' && "bg-amber-500/20 text-amber-400 border-amber-500/20",
                        event.status === 'completed' && "bg-slate-500/20 text-slate-400 border-slate-500/20"
                      )}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.start_date ? new Date(event.start_date).toLocaleDateString('id-ID') : 'No date'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.capacity.toLocaleString()} capacity
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/eo/events">
          <Card className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-amber-500/50 transition-colors group">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <Plus className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-white">Create Event</p>
                <p className="text-sm text-slate-400">Set up a new event</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/eo/credits">
          <Card className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-emerald-500/50 transition-colors group">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <CreditCard className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Buy Credits</p>
                <p className="text-sm text-slate-400">Top up your balance</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 ml-auto group-hover:text-emerald-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/eo/team">
          <Card className="bg-slate-800/50 border-slate-700 cursor-pointer hover:border-blue-500/50 transition-colors group">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Invite Team</p>
                <p className="text-sm text-slate-400">Add crew members</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 ml-auto group-hover:text-blue-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
