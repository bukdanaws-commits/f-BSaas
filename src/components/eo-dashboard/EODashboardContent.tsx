'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Users,
  Ticket,
  MonitorPlay,
  Utensils,
  DollarSign,
  TrendingUp,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building2,
  Settings,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { 
  useAuthStore, 
  useDataStore, 
  useTenantStats,
  useTenantEvents,
  useTenantWallet
} from '@/stores/mock-store'
import { Event } from '@/types/database'
import EventSetupWizard from './EventSetupWizard'

interface EODashboardContentProps {
  activeMenu: string
}

export default function EODashboardContent({ activeMenu }: EODashboardContentProps) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState<'create' | 'edit' | 'duplicate'>('create')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  
  const currentUser = useAuthStore((state) => state.currentUser)
  const stats = useTenantStats()
  const events = useTenantEvents()
  const wallet = useTenantWallet()
  const { addEvent, updateEvent, participants, checkins, claims, creditTransactions } = useDataStore()
  const { toast } = useToast()

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setWizardMode('create')
    setWizardOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setWizardMode('edit')
    setWizardOpen(true)
  }

  const handleDuplicateEvent = (event: Event) => {
    setSelectedEvent(event)
    setWizardMode('duplicate')
    setWizardOpen(true)
  }

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (eventToDelete) {
      // In real app, would call API to delete
      toast({
        title: 'Event Deleted',
        description: `"${eventToDelete.name}" has been deleted`,
      })
    }
    setDeleteConfirmOpen(false)
    setEventToDelete(null)
  }

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: `event-${Date.now()}-new`,
      tenant_id: currentUser?.tenant?.id || '',
      name: eventData.name || 'New Event',
      title: eventData.title || null,
      description: eventData.description || null,
      banner_url: eventData.banner_url || null,
      start_date: eventData.start_date || null,
      end_date: eventData.end_date || null,
      location: eventData.location || null,
      category: eventData.category || 'Other',
      capacity: eventData.capacity || 500,
      welcome_message: eventData.welcome_message || null,
      display_duration: eventData.display_duration || 5,
      enable_sound: eventData.enable_sound ?? true,
      check_in_desks: eventData.check_in_desks || 2,
      default_max_food_claims: eventData.default_max_food_claims || 4,
      default_max_drink_claims: eventData.default_max_drink_claims || 2,
      storage_days: eventData.storage_days || 15,
      status: eventData.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (wizardMode === 'edit' && selectedEvent) {
      updateEvent(selectedEvent.id, newEvent)
    } else {
      addEvent(newEvent)
    }

    setWizardOpen(false)
    setSelectedEvent(null)
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView 
          stats={stats} 
          events={events} 
          onCreateEvent={handleCreateEvent}
          onEditEvent={handleEditEvent}
          onDuplicateEvent={handleDuplicateEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      case 'events':
        return <EventsView 
          events={events}
          participants={participants}
          onCreateEvent={handleCreateEvent}
          onEditEvent={handleEditEvent}
          onDuplicateEvent={handleDuplicateEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      case 'credits':
        return <CreditsView wallet={wallet} transactions={creditTransactions} currentUser={currentUser} />
      case 'team':
        return <TeamView currentUser={currentUser} />
      case 'settings':
        return <SettingsView currentUser={currentUser} />
      default:
        return null
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMenu}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Event Setup Wizard */}
      <EventSetupWizard
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false)
          setSelectedEvent(null)
        }}
        onSave={handleSaveEvent}
        initialData={selectedEvent}
        mode={wizardMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Event</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// =====================================
// DASHBOARD VIEW
// =====================================
function DashboardView({ 
  stats, 
  events, 
  onCreateEvent, 
  onEditEvent, 
  onDuplicateEvent,
  onDeleteEvent 
}: { 
  stats: any
  events: Event[]
  onCreateEvent: () => void
  onEditEvent: (event: Event) => void
  onDuplicateEvent: (event: Event) => void
  onDeleteEvent: (event: Event) => void
}) {
  const currentUser = useAuthStore((state) => state.currentUser)
  const wallet = useTenantWallet()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome, {currentUser?.user.name}!
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your events today
          </p>
        </div>
        <Button 
          onClick={onCreateEvent}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
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
            <Button variant="outline" size="sm" onClick={onCreateEvent} className="border-slate-600 text-slate-300">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 mb-4">No events yet</p>
              <Button onClick={onCreateEvent} className="bg-amber-500 hover:bg-amber-600 text-black">
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map(event => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onEdit={onEditEvent}
                  onDuplicate={onDuplicateEvent}
                  onDelete={onDeleteEvent}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </div>
  )
}

// =====================================
// EVENTS VIEW
// =====================================
function EventsView({ 
  events, 
  participants,
  onCreateEvent, 
  onEditEvent, 
  onDuplicateEvent,
  onDeleteEvent 
}: { 
  events: Event[]
  participants: any[]
  onCreateEvent: () => void
  onEditEvent: (event: Event) => void
  onDuplicateEvent: (event: Event) => void
  onDeleteEvent: (event: Event) => void
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all')

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true
    return e.status === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Events</h1>
          <p className="text-slate-400 mt-1">Manage all your events</p>
        </div>
        <Button 
          onClick={onCreateEvent}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'draft', 'completed'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className={cn(
              filter === status 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "border-slate-700 text-slate-400 hover:bg-slate-800"
            )}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            <Badge variant="outline" className="ml-2 text-xs border-0 bg-slate-700/50">
              {status === 'all' ? events.length : events.filter(e => e.status === status).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4">No events found</p>
            <Button onClick={onCreateEvent} className="bg-amber-500 hover:bg-amber-600 text-black">
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <EventCardLarge
              key={event.id}
              event={event}
              participantCount={participants.filter(p => p.event_id === event.id).length}
              onEdit={onEditEvent}
              onDuplicate={onDuplicateEvent}
              onDelete={onDeleteEvent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =====================================
// CREDITS VIEW
// =====================================
function CreditsView({ wallet, transactions, currentUser }: { wallet: any, transactions: any[], currentUser: any }) {
  const tenantTransactions = transactions.filter(tx => tx.tenant_id === currentUser?.tenant?.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Credits</h1>
          <p className="text-slate-400 mt-1">Manage your credit balance</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
          <CreditCard className="h-4 w-4 mr-2" />
          Buy Credits
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
          <CardContent className="pt-6">
            <p className="text-emerald-300 text-sm">Main Balance</p>
            <p className="text-4xl font-bold text-white mt-2">
              {wallet?.balance?.toLocaleString() || 0}
            </p>
            <p className="text-slate-400 text-xs mt-2">Credits for event operations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="pt-6">
            <p className="text-blue-300 text-sm">Bonus Balance</p>
            <p className="text-4xl font-bold text-white mt-2">
              {wallet?.bonus_balance?.toLocaleString() || 0}
            </p>
            <p className="text-slate-400 text-xs mt-2">Promotional credits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30">
          <CardContent className="pt-6">
            <p className="text-amber-300 text-sm">Total Balance</p>
            <p className="text-4xl font-bold text-white mt-2">
              {((wallet?.balance || 0) + (wallet?.bonus_balance || 0)).toLocaleString()}
            </p>
            <p className="text-slate-400 text-xs mt-2">Available credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {tenantTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No transactions yet
                </div>
              ) : (
                tenantTransactions.map(tx => (
                  <div 
                    key={tx.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      tx.type === 'purchase' && "bg-emerald-500/20",
                      tx.type === 'usage' && "bg-red-500/20",
                      tx.type === 'bonus' && "bg-blue-500/20"
                    )}>
                      {tx.type === 'purchase' && <CreditCard className="h-4 w-4 text-emerald-400" />}
                      {tx.type === 'usage' && <TrendingUp className="h-4 w-4 text-red-400" />}
                      {tx.type === 'bonus' && <DollarSign className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{tx.description}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className={cn(
                      "text-lg font-bold",
                      tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================
// TEAM VIEW
// =====================================
function TeamView({ currentUser }: { currentUser: any }) {
  const { users, memberships } = useDataStore()
  
  const teamMembers = memberships
    .filter(m => m.tenant_id === currentUser?.tenant?.id)
    .map(m => ({
      ...m,
      user: users.find(u => u.id === m.user_id)
    }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Team</h1>
          <p className="text-slate-400 mt-1">Manage your team members</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30">
                <Avatar>
                  <AvatarImage src={member.user?.avatar_url || ''} />
                  <AvatarFallback>{member.user?.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-medium">{member.user?.name}</p>
                  <p className="text-sm text-slate-400">{member.user?.email}</p>
                </div>
                <Badge variant="outline" className={cn(
                  member.role === 'owner' && "border-amber-500/30 text-amber-400",
                  member.role === 'admin' && "border-blue-500/30 text-blue-400",
                  member.role === 'crew' && "border-purple-500/30 text-purple-400"
                )}>
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================
// SETTINGS VIEW
// =====================================
function SettingsView({ currentUser }: { currentUser: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 text-sm">Organization Name</Label>
              <p className="text-white font-medium">{currentUser?.tenant?.name}</p>
            </div>
            <div>
              <Label className="text-slate-400 text-sm">Status</Label>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 mt-1">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser?.user.avatar_url || ''} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                {currentUser?.user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium text-lg">{currentUser?.user.name}</p>
              <p className="text-slate-400">{currentUser?.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================================
// EVENT CARD (Small)
// =====================================
function EventCard({ 
  event, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: { 
  event: Event
  onEdit: (event: Event) => void
  onDuplicate: (event: Event) => void
  onDelete: (event: Event) => void
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors group">
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
            <MapPin className="h-3 w-3" />
            {event.location || 'No location'}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
          <DropdownMenuItem onClick={() => onEdit(event)} className="text-slate-300 focus:bg-slate-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(event)} className="text-slate-300 focus:bg-slate-700">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem onClick={() => onDelete(event)} className="text-red-400 focus:bg-slate-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// =====================================
// EVENT CARD (Large)
// =====================================
function EventCardLarge({ 
  event, 
  participantCount,
  onEdit, 
  onDuplicate, 
  onDelete 
}: { 
  event: Event
  participantCount: number
  onEdit: (event: Event) => void
  onDuplicate: (event: Event) => void
  onDelete: (event: Event) => void
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden group hover:border-slate-600 transition-colors">
      {/* Banner */}
      {event.banner_url ? (
        <div className="h-32 bg-slate-700 relative">
          <img 
            src={event.banner_url} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-r from-amber-500/20 to-orange-500/20" />
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2 text-xs border-slate-600 text-slate-400">
              {event.category}
            </Badge>
            <CardTitle className="text-lg text-white line-clamp-1">{event.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem onClick={() => onEdit(event)} className="text-slate-300 focus:bg-slate-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(event)} className="text-slate-300 focus:bg-slate-700">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem onClick={() => onDelete(event)} className="text-red-400 focus:bg-slate-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {event.start_date ? new Date(event.start_date).toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric'
              }) : 'TBD'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[100px]">{event.location || 'TBD'}</span>
            </span>
          </div>

          <Separator className="bg-slate-700" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-400">
                {participantCount} / {event.capacity.toLocaleString()}
              </span>
            </div>
            <Badge variant="outline" className={cn(
              "text-xs",
              event.status === 'active' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
              event.status === 'draft' && "bg-amber-500/20 text-amber-400 border-amber-500/20",
              event.status === 'completed' && "bg-slate-500/20 text-slate-400 border-slate-500/20"
            )}>
              {event.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
