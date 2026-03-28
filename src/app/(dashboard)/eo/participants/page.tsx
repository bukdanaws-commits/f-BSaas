'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Upload,
  Download,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Building2,
  Briefcase,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Ban,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  Cookie,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard'
import { cn, generateQRCode } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// =====================================
// TYPES
// =====================================
interface ParticipantData {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  jobTitle: string | null
  dietaryRestrictions: string | null
  ticketType: string
  ticketTypeId: string | null
  status: 'checked_in' | 'not_checked_in' | 'blacklisted'
  checkInTime: string | null
  foodClaimed: number
  drinkClaimed: number
  maxFoodClaims: number
  maxDrinkClaims: number
  qrCode: string
  createdAt: string
}

// =====================================
// MOCK DATA - Extended with new fields
// =====================================
const MOCK_PARTICIPANTS: ParticipantData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '081234567890', company: 'Tech Corp', jobTitle: 'Software Engineer', dietaryRestrictions: 'Vegetarian', ticketType: 'VIP', ticketTypeId: 'tt1', status: 'checked_in', checkInTime: '2024-03-15 09:30', foodClaimed: 2, drinkClaimed: 1, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0001', createdAt: '2024-03-10' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '081234567891', company: 'Design Studio', jobTitle: 'UI/UX Designer', dietaryRestrictions: null, ticketType: 'Regular', ticketTypeId: 'tt2', status: 'checked_in', checkInTime: '2024-03-15 09:45', foodClaimed: 1, drinkClaimed: 1, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0002', createdAt: '2024-03-11' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', phone: '081234567892', company: 'Startup Hub', jobTitle: 'CEO', dietaryRestrictions: 'Halal', ticketType: 'VIP', ticketTypeId: 'tt1', status: 'not_checked_in', checkInTime: null, foodClaimed: 0, drinkClaimed: 0, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0003', createdAt: '2024-03-12' },
  { id: '4', name: 'Alice Chen', email: 'alice@example.com', phone: '081234567893', company: 'University', jobTitle: 'Student', dietaryRestrictions: null, ticketType: 'Student', ticketTypeId: 'tt3', status: 'checked_in', checkInTime: '2024-03-15 10:00', foodClaimed: 0, drinkClaimed: 1, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0004', createdAt: '2024-03-12' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', phone: '081234567894', company: 'Freelance', jobTitle: 'Consultant', dietaryRestrictions: 'Gluten-free', ticketType: 'Regular', ticketTypeId: 'tt2', status: 'blacklisted', checkInTime: null, foodClaimed: 0, drinkClaimed: 0, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0005', createdAt: '2024-03-13' },
  { id: '6', name: 'Diana Prince', email: 'diana@example.com', phone: '081234567895', company: 'Media Corp', jobTitle: 'Journalist', dietaryRestrictions: null, ticketType: 'VIP', ticketTypeId: 'tt1', status: 'not_checked_in', checkInTime: null, foodClaimed: 0, drinkClaimed: 0, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0006', createdAt: '2024-03-13' },
  { id: '7', name: 'Edward King', email: 'edward@example.com', phone: '081234567896', company: 'Finance Ltd', jobTitle: 'Analyst', dietaryRestrictions: 'Kosher', ticketType: 'Regular', ticketTypeId: 'tt2', status: 'checked_in', checkInTime: '2024-03-15 10:15', foodClaimed: 2, drinkClaimed: 2, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0007', createdAt: '2024-03-14' },
  { id: '8', name: 'Fiona Green', email: 'fiona@example.com', phone: '081234567897', company: 'NGO', jobTitle: 'Project Manager', dietaryRestrictions: 'Vegan', ticketType: 'Student', ticketTypeId: 'tt3', status: 'checked_in', checkInTime: '2024-03-15 10:30', foodClaimed: 1, drinkClaimed: 0, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0008', createdAt: '2024-03-14' },
  { id: '9', name: 'George Hall', email: 'george@example.com', phone: '081234567898', company: 'Tech Startup', jobTitle: 'CTO', dietaryRestrictions: null, ticketType: 'VIP', ticketTypeId: 'tt1', status: 'not_checked_in', checkInTime: null, foodClaimed: 0, drinkClaimed: 0, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0009', createdAt: '2024-03-14' },
  { id: '10', name: 'Hannah White', email: 'hannah@example.com', phone: '081234567899', company: 'Creative Agency', jobTitle: 'Art Director', dietaryRestrictions: 'Dairy-free', ticketType: 'Regular', ticketTypeId: 'tt2', status: 'not_checked_in', checkInTime: null, foodClaimed: 0, drinkClaimed: 0, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0010', createdAt: '2024-03-15' },
  { id: '11', name: 'Ivan Black', email: 'ivan@example.com', phone: '081234567800', company: 'Security Inc', jobTitle: 'Security Engineer', dietaryRestrictions: null, ticketType: 'Regular', ticketTypeId: 'tt2', status: 'checked_in', checkInTime: '2024-03-15 11:00', foodClaimed: 1, drinkClaimed: 1, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0011', createdAt: '2024-03-15' },
  { id: '12', name: 'Julia Rose', email: 'julia@example.com', phone: '081234567801', company: 'Health Corp', jobTitle: 'Doctor', dietaryRestrictions: 'Vegetarian, Nut allergy', ticketType: 'VIP', ticketTypeId: 'tt1', status: 'not_checked_in', checkInTime: null, foodClaimed: 0, drinkClaimed: 0, maxFoodClaims: 4, maxDrinkClaims: 2, qrCode: 'HKI-2025-0012', createdAt: '2024-03-15' },
]

const ITEMS_PER_PAGE = 10

// =====================================
// MAIN COMPONENT
// =====================================
export default function ParticipantsPage() {
  const { toast } = useToast()
  const { addParticipant, updateParticipant, deleteParticipant } = useDataStore()
  
  // State
  const [participants, setParticipants] = useState<ParticipantData[]>(MOCK_PARTICIPANTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ticketFilter, setTicketFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<Partial<ParticipantData>>({})
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [importData, setImportData] = useState<{ valid: ParticipantData[], invalid: any[] }>({ valid: [], invalid: [] })

  // =====================================
  // COMPUTED VALUES
  // =====================================
  const stats = useMemo(() => {
    const total = participants.length
    const checkedIn = participants.filter(p => p.status === 'checked_in').length
    const notCheckedIn = participants.filter(p => p.status === 'not_checked_in').length
    const blacklisted = participants.filter(p => p.status === 'blacklisted').length
    const vip = participants.filter(p => p.ticketType === 'VIP').length
    const regular = participants.filter(p => p.ticketType === 'Regular').length
    const student = participants.filter(p => p.ticketType === 'Student').length
    return { total, checkedIn, notCheckedIn, blacklisted, vip, regular, student }
  }, [participants])

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const matchesTicket = ticketFilter === 'all' || p.ticketType.toLowerCase() === ticketFilter.toLowerCase()
      return matchesSearch && matchesStatus && matchesTicket
    })
  }, [participants, searchQuery, statusFilter, ticketFilter])

  const totalPages = Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE)
  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredParticipants.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredParticipants, currentPage])

  const isAllSelected = paginatedParticipants.length > 0 && paginatedParticipants.every(p => selectedIds.has(p.id))
  const isSomeSelected = selectedIds.size > 0

  // =====================================
  // HANDLERS
  // =====================================
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedParticipants.map(p => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleAddParticipant = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: 'Error', description: 'Nama dan email wajib diisi', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const newParticipant: ParticipantData = {
      id: `p-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      company: formData.company || null,
      jobTitle: formData.jobTitle || null,
      dietaryRestrictions: formData.dietaryRestrictions || null,
      ticketType: formData.ticketType || 'Regular',
      ticketTypeId: formData.ticketTypeId || null,
      status: 'not_checked_in',
      checkInTime: null,
      foodClaimed: 0,
      drinkClaimed: 0,
      maxFoodClaims: 4,
      maxDrinkClaims: 2,
      qrCode: generateQRCode(),
      createdAt: new Date().toISOString(),
    }

    setParticipants(prev => [...prev, newParticipant])
    setAddDialogOpen(false)
    setFormData({})
    setIsSubmitting(false)
    toast({ title: 'Berhasil', description: `Peserta "${newParticipant.name}" berhasil ditambahkan` })
  }

  const handleEditParticipant = async () => {
    if (!selectedParticipant || !formData.name || !formData.email) {
      toast({ title: 'Error', description: 'Nama dan email wajib diisi', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setParticipants(prev => prev.map(p => 
      p.id === selectedParticipant.id 
        ? { ...p, ...formData, name: formData.name!, email: formData.email! }
        : p
    ))

    setEditDialogOpen(false)
    setSelectedParticipant(null)
    setFormData({})
    setIsSubmitting(false)
    toast({ title: 'Berhasil', description: 'Data peserta berhasil diperbarui' })
  }

  const handleDeleteParticipant = async () => {
    if (!selectedParticipant) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setParticipants(prev => prev.filter(p => p.id !== selectedParticipant.id))
    setDeleteDialogOpen(false)
    setSelectedParticipant(null)
    setIsSubmitting(false)
    toast({ title: 'Berhasil', description: 'Peserta berhasil dihapus' })
  }

  const handleBulkDelete = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setParticipants(prev => prev.filter(p => !selectedIds.has(p.id)))
    setBulkDeleteDialogOpen(false)
    setSelectedIds(new Set())
    setIsSubmitting(false)
    toast({ title: 'Berhasil', description: `${selectedIds.size} peserta berhasil dihapus` })
  }

  const handleBlacklist = async (participant: ParticipantData) => {
    setParticipants(prev => prev.map(p => 
      p.id === participant.id 
        ? { ...p, status: 'blacklisted' as const }
        : p
    ))
    toast({ title: 'Berhasil', description: `"${participant.name}" telah di-blacklist` })
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    toast({ title: 'Coming Soon', description: 'Fitur export PDF akan segera tersedia' })
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'Dietary', 'Ticket', 'Status', 'QR Code']
    const rows = filteredParticipants.map(p => [
      p.name, p.email, p.phone || '', p.company || '', p.jobTitle || '', 
      p.dietaryRestrictions || '', p.ticketType, p.status, p.qrCode
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `participants_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({ title: 'Berhasil', description: 'File CSV berhasil didownload' })
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // TODO: Parse CSV/Excel
    toast({ title: 'Coming Soon', description: 'Fitur import akan segera tersedia' })
  }

  const handleResendQR = (participant: ParticipantData) => {
    // TODO: Implement resend QR via Email/WhatsApp
    toast({ title: 'Coming Soon', description: 'Fitur kirim QR akan segera tersedia' })
  }

  // =====================================
  // HELPERS
  // =====================================
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_in':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/20 text-xs">Checked In</Badge>
      case 'not_checked_in':
        return <Badge variant="secondary" className="text-xs">Not Checked In</Badge>
      case 'blacklisted':
        return <Badge variant="destructive" className="text-xs">Blacklisted</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const getTicketBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vip':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/20 text-xs">VIP</Badge>
      case 'regular':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/20 text-xs">Regular</Badge>
      case 'student':
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/20 text-xs">Student</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>
    }
  }

  const getDietaryBadge = (dietary: string | null) => {
    if (!dietary) return <span className="text-muted-foreground text-xs">-</span>
    return (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
        <Cookie className="h-3 w-3 mr-1" />
        {dietary.length > 15 ? dietary.substring(0, 15) + '...' : dietary}
      </Badge>
    )
  }

  const openEditDialog = (participant: ParticipantData) => {
    setSelectedParticipant(participant)
    setFormData(participant)
    setEditDialogOpen(true)
  }

  const openViewDialog = (participant: ParticipantData) => {
    setSelectedParticipant(participant)
    setViewDialogOpen(true)
  }

  const openQRDialog = (participant: ParticipantData) => {
    setSelectedParticipant(participant)
    setQrDialogOpen(true)
  }

  const openDeleteDialog = (participant: ParticipantData) => {
    setSelectedParticipant(participant)
    setDeleteDialogOpen(true)
  }

  // =====================================
  // RENDER
  // =====================================
  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsGrid columns={4}>
        <StatsCard title="Total Peserta" value={stats.total} icon={Users} variant="gradient" gradientFrom="from-blue-500" gradientTo="to-blue-600" />
        <StatsCard title="Sudah Check-in" value={stats.checkedIn} description={`${stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}% hadir`} icon={CheckCircle} variant="gradient" gradientFrom="from-emerald-500" gradientTo="to-emerald-600" />
        <StatsCard title="Belum Check-in" value={stats.notCheckedIn} icon={Clock} variant="gradient" gradientFrom="from-amber-500" gradientTo="to-amber-600" />
        <StatsCard title="Blacklisted" value={stats.blacklisted} icon={Ban} variant="gradient" gradientFrom="from-red-500" gradientTo="to-red-600" />
      </StatsGrid>

      {/* Check-in Progress */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Check-in Progress</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold">{stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%</span>
            </div>
            <Progress value={stats.total > 0 ? (stats.checkedIn / stats.total) * 100 : 0} className="h-2" />
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-xl font-bold text-emerald-600">{stats.checkedIn}</p>
                <p className="text-xs text-muted-foreground">Hadir</p>
              </div>
              <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-xl font-bold text-amber-600">{stats.notCheckedIn}</p>
                <p className="text-xs text-muted-foreground">Belum Hadir</p>
              </div>
              <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xl font-bold text-red-600">{stats.blacklisted}</p>
                <p className="text-xs text-muted-foreground">Blacklist</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle>Daftar Peserta</CardTitle>
              <CardDescription>Kelola semua peserta event</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {isSomeSelected && (
                <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus ({selectedIds.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={() => { setFormData({}); setAddDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Peserta
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, perusahaan..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="pl-9 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="checked_in">Checked In</SelectItem>
                <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ticketFilter} onValueChange={(v) => { setTicketFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Tipe Tiket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 py-2">
                    <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead className="py-2">Peserta</TableHead>
                  <TableHead className="py-2 hidden md:table-cell">Kontak</TableHead>
                  <TableHead className="py-2 hidden lg:table-cell">Perusahaan</TableHead>
                  <TableHead className="py-2 hidden xl:table-cell">Dietary</TableHead>
                  <TableHead className="py-2">Tiket</TableHead>
                  <TableHead className="py-2">Status</TableHead>
                  <TableHead className="py-2 text-center">F&B</TableHead>
                  <TableHead className="py-2 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Tidak ada peserta ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedParticipants.map((participant) => (
                    <TableRow key={participant.id} className={cn(
                      "hover:bg-muted/30",
                      participant.status === 'blacklisted' && "bg-red-50/50 dark:bg-red-900/10"
                    )}>
                      <TableCell className="py-2">
                        <Checkbox
                          checked={selectedIds.has(participant.id)}
                          onCheckedChange={(checked) => handleSelectOne(participant.id, checked as boolean)}
                          aria-label={`Select ${participant.name}`}
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {participant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{participant.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 hidden md:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground truncate">{participant.phone || '-'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 hidden lg:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{participant.company || '-'}</span>
                          </div>
                          {participant.jobTitle && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate">{participant.jobTitle}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 hidden xl:table-cell">
                        {getDietaryBadge(participant.dietaryRestrictions)}
                      </TableCell>
                      <TableCell className="py-2">{getTicketBadge(participant.ticketType)}</TableCell>
                      <TableCell className="py-2">{getStatusBadge(participant.status)}</TableCell>
                      <TableCell className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <span className="text-orange-600">🍽️{participant.foodClaimed}</span>
                          <span className="text-cyan-600">🥤{participant.drinkClaimed}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => openViewDialog(participant)}>
                              <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openQRDialog(participant)}>
                              <QrCode className="h-4 w-4 mr-2" /> Lihat QR Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendQR(participant)}>
                              <Send className="h-4 w-4 mr-2" /> Kirim QR <Badge variant="outline" className="ml-auto text-[10px]">Soon</Badge>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(participant)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            {participant.status !== 'blacklisted' && (
                              <DropdownMenuItem onClick={() => handleBlacklist(participant)} className="text-amber-600">
                                <Ban className="h-4 w-4 mr-2" /> Blacklist
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteDialog(participant)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-muted-foreground">
              Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredParticipants.length)} dari {filteredParticipants.length} peserta
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn("h-8 w-8 p-0", currentPage === pageNum && "bg-primary text-primary-foreground")}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">VIP Tickets</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.vip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Regular Tickets</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.regular}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Student Tickets</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.student}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Participant Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Peserta Baru</DialogTitle>
            <DialogDescription>Isi data peserta di bawah ini</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input id="name" value={formData.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input id="phone" value={formData.phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="081234567890" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Perusahaan</Label>
                <Input id="company" value={formData.company || ''} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} placeholder="Tech Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Jabatan</Label>
                <Input id="jobTitle" value={formData.jobTitle || ''} onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))} placeholder="Engineer" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietary">Dietary Restrictions</Label>
              <Input id="dietary" value={formData.dietaryRestrictions || ''} onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))} placeholder="Vegetarian, Halal, dll" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticketType">Tipe Tiket</Label>
              <Select value={formData.ticketType || 'Regular'} onValueChange={(v) => setFormData(prev => ({ ...prev, ticketType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Batal</Button>
            <Button onClick={handleAddParticipant} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Participant Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Peserta</DialogTitle>
            <DialogDescription>Perbarui data peserta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap *</Label>
              <Input id="edit-name" value={formData.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input id="edit-email" type="email" value={formData.email || ''} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">No. Telepon</Label>
              <Input id="edit-phone" value={formData.phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-company">Perusahaan</Label>
                <Input id="edit-company" value={formData.company || ''} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jobTitle">Jabatan</Label>
                <Input id="edit-jobTitle" value={formData.jobTitle || ''} onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dietary">Dietary Restrictions</Label>
              <Input id="edit-dietary" value={formData.dietaryRestrictions || ''} onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ticketType">Tipe Tiket</Label>
              <Select value={formData.ticketType || 'Regular'} onValueChange={(v) => setFormData(prev => ({ ...prev, ticketType: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleEditParticipant} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Participant Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Peserta</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                  {selectedParticipant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedParticipant.name}</h3>
                  <p className="text-muted-foreground">{selectedParticipant.email}</p>
                  <div className="flex gap-2 mt-1">
                    {getTicketBadge(selectedParticipant.ticketType)}
                    {getStatusBadge(selectedParticipant.status)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Telepon</Label>
                  <p className="font-medium">{selectedParticipant.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Perusahaan</Label>
                  <p className="font-medium">{selectedParticipant.company || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Jabatan</Label>
                  <p className="font-medium">{selectedParticipant.jobTitle || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dietary</Label>
                  <p className="font-medium">{selectedParticipant.dietaryRestrictions || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">QR Code</Label>
                  <p className="font-medium font-mono">{selectedParticipant.qrCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Check-in</Label>
                  <p className="font-medium">{selectedParticipant.checkInTime ? new Date(selectedParticipant.checkInTime).toLocaleString('id-ID') : '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{selectedParticipant.foodClaimed}/{selectedParticipant.maxFoodClaims}</p>
                  <p className="text-xs text-muted-foreground">Food Claims</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-600">{selectedParticipant.drinkClaimed}/{selectedParticipant.maxDrinkClaims}</p>
                  <p className="text-xs text-muted-foreground">Drink Claims</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Tutup</Button>
            <Button variant="outline" onClick={() => { setViewDialogOpen(false); openEditDialog(selectedParticipant!); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code Peserta</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <div className="flex flex-col items-center py-4">
              <div className="w-48 h-48 bg-white border-2 border-dashed rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">QR Code</p>
                </div>
              </div>
              <p className="font-mono text-lg font-bold text-center">{selectedParticipant.qrCode}</p>
              <p className="text-muted-foreground text-center mt-1">{selectedParticipant.name}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleResendQR(selectedParticipant)}>
                  <Send className="h-4 w-4 mr-1" /> Kirim via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Peserta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Peserta "{selectedParticipant?.name}" akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteParticipant} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghapus...</> : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedIds.size} Peserta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. {selectedIds.size} peserta akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menghapus...</> : `Hapus ${selectedIds.size} Peserta`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Peserta</DialogTitle>
            <DialogDescription>Upload file CSV atau Excel untuk import peserta</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Drag & drop file atau klik untuk upload</p>
              <p className="text-xs text-muted-foreground mb-4">Mendukung CSV, XLSX (Max 5MB)</p>
              <Input type="file" accept=".csv,.xlsx" onChange={handleImportFile} className="hidden" id="import-file" />
              <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                Pilih File
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Format kolom yang dibutuhkan:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Nama* (wajib)</li>
                <li>Email* (wajib)</li>
                <li>Phone</li>
                <li>Company</li>
                <li>JobTitle</li>
                <li>Dietary</li>
                <li>TicketType (VIP/Regular/Student)</li>
              </ul>
              <p className="mt-2 text-xs italic">*Email yang sudah terdaftar akan di-skip otomatis</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
