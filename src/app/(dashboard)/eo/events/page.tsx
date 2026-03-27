'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Users,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Grid3X3,
  List,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  FileText,
  Utensils,
  MonitorPlay,
  Settings,
  Eye,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Event } from '@/lib/api-client'
import { EVENT_CATEGORIES } from '@/config/menu'
import { useAuthStore } from '@/stores/auth-store'
import { useTenantEvents } from '@/hooks/use-api'
import { api } from '@/lib/api-client'

const ITEMS_PER_PAGE = 6

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'name' | 'date' | 'participants'

// Status configuration
const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/20',
    icon: FileText,
    description: 'Event is being prepared'
  },
  active: {
    label: 'Active',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    icon: Play,
    description: 'Event is live and running'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    icon: CheckCircle2,
    description: 'Event has finished'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500/20 text-red-400 border-red-500/20',
    icon: XCircle,
    description: 'Event was cancelled'
  }
}

export default function EventsPage() {
  // State
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'completed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Data
  const { events, loading: eventsLoading, refetch: refetchEvents } = useTenantEvents()
  const currentUser = useAuthStore((state) => state.currentUser)
  const { toast } = useToast()

  // Computed data
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(e => {
      const matchesStatus = filter === 'all' || e.status === filter
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter
      return matchesStatus && matchesSearch && matchesCategory
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity
          const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity
          return dateA - dateB
        case 'participants':
          const countA = participants.filter(p => p.event_id === a.id).length
          const countB = participants.filter(p => p.event_id === b.id).length
          return countB - countA
        default:
          return 0
      }
    })

    return filtered
  }, [events, filter, searchTerm, categoryFilter, sortBy, participants])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = filteredAndSortedEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Stats for summary
  const stats = useMemo(() => ({
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    draft: events.filter(e => e.status === 'draft').length,
    completed: events.filter(e => e.status === 'completed').length,
  }), [events])

  // Handlers
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await api.deleteEvent(eventToDelete.id)
      
      if (response.success) {
        toast({ 
          title: 'Event Deleted', 
          description: `"${eventToDelete.name}" has been removed successfully` 
        })
        refetchEvents()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete event',
          variant: 'destructive'
        })
      }
      
      setDeleteDialogOpen(false)
      setEventToDelete(null)
      
      const newTotalPages = Math.ceil((filteredAndSortedEvents.length - 1) / ITEMS_PER_PAGE)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getEventStats = (eventId: string) => {
    // Stats would need to be fetched per event from API
    // For now, return placeholder
    return {
      participants: 0,
      checkedIn: 0,
      checkins: 0,
      claims: 0
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'TBD'
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysUntil = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Events</h1>
              <p className="text-slate-400 mt-1">Manage and monitor all your events</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/eo/events/new">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-medium shadow-lg shadow-amber-500/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'all', label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-slate-700/50' },
              { key: 'active', label: 'Active', value: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { key: 'draft', label: 'Draft', value: stats.draft, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { key: 'completed', label: 'Done', value: stats.completed, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            ].map((stat) => (
              <motion.button
                key={stat.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFilterChange(stat.key as typeof filter)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer",
                  filter === stat.key 
                    ? "border-amber-500/50 bg-amber-500/5" 
                    : "border-slate-700 hover:border-slate-600",
                  stat.bg
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{stat.label}</span>
                  {filter === stat.key && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <div className={cn("text-2xl font-bold mt-1", stat.color)}>
                  {stat.value}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events by name, location, or category..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 bg-slate-800/50 border-slate-700 focus:border-amber-500/50"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Categories</SelectItem>
                {EVENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px] bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="date">Event Date</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border border-slate-700 rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "rounded-none border-r border-slate-700",
                  viewMode === 'grid' ? "bg-slate-700 text-amber-400" : "text-slate-400 hover:text-white"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-none",
                  viewMode === 'list' ? "bg-slate-700 text-amber-400" : "text-slate-400 hover:text-white"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Events Display */}
        {paginatedEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  {searchTerm || categoryFilter !== 'all' 
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Get started by creating your first event and bring your vision to life."}
                </p>
                {!searchTerm && categoryFilter === 'all' && (
                  <Link href="/eo/events/new">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {paginatedEvents.map(event => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      stats={getEventStats(event.id)}
                      onEdit={() => {}}
                      onDuplicate={() => {
                        toast({ title: 'Event Duplicated', description: 'A copy has been created' })
                      }}
                      onDelete={() => openDeleteDialog(event)}
                      formatDate={formatDate}
                      getDaysUntil={getDaysUntil}
                      itemVariants={itemVariants}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="space-y-3"
                >
                  {paginatedEvents.map(event => (
                    <EventListItem
                      key={event.id}
                      event={event}
                      stats={getEventStats(event.id)}
                      onEdit={() => {}}
                      onDuplicate={() => {
                        toast({ title: 'Event Duplicated', description: 'A copy has been created' })
                      }}
                      onDelete={() => openDeleteDialog(event)}
                      formatDate={formatDate}
                      getDaysUntil={getDaysUntil}
                      itemVariants={itemVariants}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-slate-500">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedEvents.length)} of {filteredAndSortedEvents.length} events
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                      .map((page, index, array) => {
                        if (index > 0 && page - array[index - 1] > 1) {
                          return (
                            <span key={`ellipsis-${page}`} className="text-slate-500 px-2">...</span>
                          )
                        }
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "w-9 h-9 p-0",
                              currentPage === page 
                                ? "bg-amber-500 text-black hover:bg-amber-600"
                                : "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                          >
                            {page}
                          </Button>
                        )
                      })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Delete Event
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Are you sure you want to delete <span className="text-amber-400 font-medium">"{eventToDelete?.name}"</span>? 
                <br /><br />
                This will permanently remove:
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>All participants ({eventToDelete ? getEventStats(eventToDelete.id).participants : 0} registered)</li>
                  <li>Check-in records ({eventToDelete ? getEventStats(eventToDelete.id).checkins : 0} records)</li>
                  <li>F&B claims and menu items</li>
                  <li>Event staff assignments</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={isDeleting}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      ◌
                    </motion.div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

// ==================== EVENT CARD COMPONENT ====================
interface EventCardProps {
  event: Event
  stats: { participants: number; checkedIn: number; checkins: number; claims: number }
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  formatDate: (date: string | null) => string
  getDaysUntil: (date: string | null) => number | null
  itemVariants: typeof itemVariants
}

function EventCard({ event, stats, onEdit, onDuplicate, onDelete, formatDate, getDaysUntil, itemVariants }: EventCardProps) {
  const daysUntil = getDaysUntil(event.start_date)
  const statusConfig = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
  const StatusIcon = statusConfig.icon
  const participantPercentage = event.capacity > 0 ? (stats.participants / event.capacity) * 100 : 0
  const checkinPercentage = stats.participants > 0 ? (stats.checkedIn / stats.participants) * 100 : 0

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden group hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
        {/* Banner */}
        <div className="relative h-36 bg-slate-700 overflow-hidden">
          {event.banner_url ? (
            <>
              <img 
                src={event.banner_url} 
                alt={event.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            </>
          ) : (
            <div className="h-full bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-amber-500/30" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className={cn("text-xs font-medium border-0 backdrop-blur-sm", statusConfig.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Days Until Badge */}
          {daysUntil !== null && daysUntil > 0 && event.status === 'active' && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-slate-900/80 text-xs border-0 text-white backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1 text-amber-400" />
                {daysUntil} days
              </Badge>
            </div>
          )}

          {/* Category Badge */}
          {event.category && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="outline" className="text-[10px] bg-slate-900/80 border-slate-600 text-slate-300 backdrop-blur-sm">
                {event.category}
              </Badge>
            </div>
          )}

          {/* Menu Button */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-slate-900/80 backdrop-blur-sm border-0">
                  <MoreVertical className="h-4 w-4 text-slate-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-slate-400 text-xs">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" /> Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                  <Users className="h-4 w-4 mr-2" /> Manage Participants
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                  <Utensils className="h-4 w-4 mr-2" /> F&B Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete} 
                  className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardHeader className="pb-2 pt-4">
          <div className="space-y-1">
            <CardTitle className="text-lg text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
              {event.name}
            </CardTitle>
            {event.title && (
              <CardDescription className="text-slate-400 text-sm line-clamp-1">
                {event.title}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-3 space-y-4">
          {/* Date & Location */}
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-500/70" />
                  {formatDate(event.start_date)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start: {formatDate(event.start_date)}</p>
                {event.end_date && <p>End: {formatDate(event.end_date)}</p>}
              </TooltipContent>
            </Tooltip>
            {event.location && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-amber-500/70" />
                    <span className="truncate max-w-[120px]">{event.location}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{event.location}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-slate-700/30">
              <div className="flex items-center justify-center gap-1 text-cyan-400">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div className="text-lg font-semibold text-white mt-1">{stats.participants}</div>
              <div className="text-[10px] text-slate-500 uppercase">Participants</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-700/30">
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="text-lg font-semibold text-white mt-1">{stats.checkedIn}</div>
              <div className="text-[10px] text-slate-500 uppercase">Check-ins</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-700/30">
              <div className="flex items-center justify-center gap-1 text-pink-400">
                <Utensils className="h-3.5 w-3.5" />
              </div>
              <div className="text-lg font-semibold text-white mt-1">{stats.claims}</div>
              <div className="text-[10px] text-slate-500 uppercase">F&B Claims</div>
            </div>
          </div>

          {/* Capacity Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Capacity</span>
              <span className="text-slate-400">{stats.participants} / {event.capacity.toLocaleString()}</span>
            </div>
            <Progress 
              value={Math.min(participantPercentage, 100)} 
              className="h-1.5 bg-slate-700"
              indicatorClassName={cn(
                participantPercentage > 90 ? "bg-red-500" : 
                participantPercentage > 70 ? "bg-amber-500" : 
                "bg-cyan-500"
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-4">
          <div className="flex gap-2 w-full">
            <Link href={`/eo/participants?event=${event.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Participants
              </Button>
            </Link>
            <Link href={`/eo/fnb-settings?event=${event.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
                <Utensils className="h-3.5 w-3.5 mr-1.5" />
                F&B
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// ==================== EVENT LIST ITEM COMPONENT ====================
interface EventListItemProps {
  event: Event
  stats: { participants: number; checkedIn: number; checkins: number; claims: number }
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  formatDate: (date: string | null) => string
  getDaysUntil: (date: string | null) => number | null
  itemVariants: typeof itemVariants
}

function EventListItem({ event, stats, onEdit, onDuplicate, onDelete, formatDate, getDaysUntil, itemVariants }: EventListItemProps) {
  const daysUntil = getDaysUntil(event.start_date)
  const statusConfig = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
  const StatusIcon = statusConfig.icon
  const participantPercentage = event.capacity > 0 ? (stats.participants / event.capacity) * 100 : 0

  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden group hover:border-amber-500/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
              {event.banner_url ? (
                <img src={event.banner_url} alt={event.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-500/50" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                  {event.name}
                </h3>
                <Badge variant="outline" className={cn("text-[10px] border-0 flex-shrink-0", statusConfig.color)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                {event.category && (
                  <Badge variant="outline" className="text-[10px] bg-slate-700 border-slate-600 text-slate-300 flex-shrink-0">
                    {event.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-amber-500/70" />
                  {formatDate(event.start_date)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="h-3.5 w-3.5 text-amber-500/70" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-white font-medium">{stats.participants.toLocaleString()}</div>
                <div className="text-slate-500 text-xs">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-white font-medium">{stats.checkedIn.toLocaleString()}</div>
                <div className="text-slate-500 text-xs">Checked In</div>
              </div>
              <div className="text-center">
                <div className="text-white font-medium">{stats.claims.toLocaleString()}</div>
                <div className="text-slate-500 text-xs">F&B Claims</div>
              </div>
              <div className="text-center">
                <div className="text-white font-medium">{event.capacity.toLocaleString()}</div>
                <div className="text-slate-500 text-xs">Capacity</div>
              </div>
            </div>

            {/* Capacity Progress */}
            <div className="hidden lg:block w-24">
              <Progress 
                value={Math.min(participantPercentage, 100)} 
                className="h-2 bg-slate-700"
                indicatorClassName={cn(
                  participantPercentage > 90 ? "bg-red-500" : 
                  participantPercentage > 70 ? "bg-amber-500" : 
                  "bg-cyan-500"
                )}
              />
              <div className="text-center text-xs text-slate-500 mt-1">
                {participantPercentage.toFixed(0)}%
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/eo/participants?event=${event.id}`}>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white hidden sm:flex">
                  <Users className="h-4 w-4" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 cursor-pointer">
                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
