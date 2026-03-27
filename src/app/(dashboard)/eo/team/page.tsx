'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Shield,
  UserCog,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Search,
  Filter,
  Download,
  UserPlus,
  Crown,
  Settings,
  Eye,
  Key,
  Ban,
  ChevronDown,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore, useDataStore, useTenantEvents, useTenantCrew } from '@/stores/mock-store'

// =====================================
// TYPES
// =====================================
interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  role: 'owner' | 'admin' | 'crew'
  status: 'active' | 'inactive' | 'pending'
  joinedAt: string
  lastActive: string | null
  assignedEvents: string[]
  permissions: string[]
}

interface Invite {
  id: string
  email: string
  role: 'admin' | 'crew'
  status: 'pending' | 'accepted' | 'expired'
  invitedAt: string
  invitedBy: string
}

// =====================================
// MOCK DATA
// =====================================
const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    userId: 'user-2',
    name: 'Budi Santoso',
    email: 'owner@techconference.id',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2024-03-20 10:30',
    assignedEvents: ['event-1', 'event-2', 'event-3'],
    permissions: ['all']
  },
  {
    id: 'tm-2',
    userId: 'user-4',
    name: 'Ahmad Wijaya',
    email: 'crew1@techconference.id',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmad',
    role: 'crew',
    status: 'active',
    joinedAt: '2024-02-20',
    lastActive: '2024-03-20 09:15',
    assignedEvents: ['event-1'],
    permissions: ['checkin', 'claim']
  },
  {
    id: 'tm-3',
    userId: 'user-5',
    name: 'Dewi Lestari',
    email: 'crew2@techconference.id',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dewi',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-03-01',
    lastActive: '2024-03-19 16:45',
    assignedEvents: ['event-1', 'event-2'],
    permissions: ['checkin', 'claim', 'participants', 'reports']
  },
]

const INITIAL_INVITES: Invite[] = [
  {
    id: 'inv-1',
    email: 'newcrew@example.com',
    role: 'crew',
    status: 'pending',
    invitedAt: '2024-03-19',
    invitedBy: 'Budi Santoso'
  }
]

const PERMISSION_OPTIONS = [
  { id: 'checkin', label: 'Check-in', description: 'Scan QR untuk check-in peserta' },
  { id: 'claim', label: 'F&B Claims', description: 'Proses klaim makanan & minuman' },
  { id: 'participants', label: 'Manage Participants', description: 'Kelola data peserta' },
  { id: 'reports', label: 'View Reports', description: 'Lihat laporan & statistik' },
  { id: 'display', label: 'Display Monitor', description: 'Akses display monitor' },
]

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Crown,
    description: 'Full access ke semua fitur'
  },
  admin: {
    label: 'Admin',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Shield,
    description: 'Manage events & team'
  },
  crew: {
    label: 'Crew',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: UserCog,
    description: 'Operasional check-in & claims'
  }
}

// =====================================
// MAIN COMPONENT
// =====================================
export default function TeamPage() {
  const { toast } = useToast()
  const currentUser = useAuthStore((state) => state.currentUser)
  const events = useTenantEvents()
  
  // State
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS)
  const [invites, setInvites] = useState<Invite[]>(INITIAL_INVITES)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberDetailOpen, setMemberDetailOpen] = useState(false)
  
  // Form states
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'crew' as 'admin' | 'crew',
    permissions: ['checkin', 'claim'],
    assignedEvents: [] as string[]
  })
  const [editForm, setEditForm] = useState({
    role: 'crew' as 'owner' | 'admin' | 'crew',
    status: 'active' as 'active' | 'inactive',
    permissions: [] as string[],
    assignedEvents: [] as string[]
  })

  // Computed
  const stats = useMemo(() => {
    return {
      total: members.length,
      owners: members.filter(m => m.role === 'owner').length,
      admins: members.filter(m => m.role === 'admin').length,
      crew: members.filter(m => m.role === 'crew').length,
      active: members.filter(m => m.status === 'active').length,
      pending: invites.filter(i => i.status === 'pending').length,
    }
  }, [members, invites])

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || m.role === roleFilter
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [members, searchTerm, roleFilter, statusFilter])

  // Handlers
  const openInviteDialog = () => {
    setInviteForm({
      email: '',
      role: 'crew',
      permissions: ['checkin', 'claim'],
      assignedEvents: []
    })
    setInviteDialogOpen(true)
  }

  const openEditDialog = (member: TeamMember) => {
    setSelectedMember(member)
    setEditForm({
      role: member.role,
      status: member.status,
      permissions: member.permissions,
      assignedEvents: member.assignedEvents
    })
    setEditDialogOpen(true)
  }

  const handleSendInvite = () => {
    if (!inviteForm.email.trim()) {
      toast({ title: 'Error', description: 'Email wajib diisi', variant: 'destructive' })
      return
    }

    const newInvite: Invite = {
      id: `inv-${Date.now()}`,
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      invitedBy: currentUser?.user?.name || 'Admin'
    }

    setInvites(prev => [...prev, newInvite])
    setInviteDialogOpen(false)
    toast({ 
      title: 'Undangan Terkirim', 
      description: `Undangan telah dikirim ke ${inviteForm.email}` 
    })
  }

  const handleUpdateMember = () => {
    if (!selectedMember) return

    setMembers(prev => prev.map(m => 
      m.id === selectedMember.id 
        ? { ...m, ...editForm }
        : m
    ))

    setEditDialogOpen(false)
    toast({ title: 'Berhasil', description: 'Data member berhasil diperbarui' })
  }

  const handleDeleteMember = () => {
    if (!selectedMember) return

    if (selectedMember.role === 'owner') {
      toast({ 
        title: 'Tidak Dapat Dihapus', 
        description: 'Owner tidak dapat dihapus dari tim',
        variant: 'destructive' 
      })
      return
    }

    setMembers(prev => prev.filter(m => m.id !== selectedMember.id))
    setDeleteDialogOpen(false)
    setSelectedMember(null)
    toast({ title: 'Berhasil', description: 'Member berhasil dihapus dari tim' })
  }

  const handleResendInvite = (invite: Invite) => {
    toast({ title: 'Undangan Dikirim Ulang', description: `Email terkirim ke ${invite.email}` })
  }

  const handleCancelInvite = (inviteId: string) => {
    setInvites(prev => prev.filter(i => i.id !== inviteId))
    toast({ title: 'Undangan Dibatalkan' })
  }

  const togglePermission = (permissionId: string) => {
    setEditForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const toggleEventAssignment = (eventId: string) => {
    setEditForm(prev => ({
      ...prev,
      assignedEvents: prev.assignedEvents.includes(eventId)
        ? prev.assignedEvents.filter(e => e !== eventId)
        : [...prev.assignedEvents, eventId]
    }))
  }

  // Render
  return (
    <div className="space-y-6 pb-8">
      {/* Stats */}
      <StatsGrid columns={5}>
        <StatsCard
          title="Total Team"
          value={stats.total}
          icon={Users}
          variant="gradient"
          gradientFrom="from-blue-500"
          gradientTo="to-blue-600"
        />
        <StatsCard
          title="Owners"
          value={stats.owners}
          icon={Crown}
          variant="gradient"
          gradientFrom="from-amber-500"
          gradientTo="to-amber-600"
        />
        <StatsCard
          title="Admins"
          value={stats.admins}
          icon={Shield}
          variant="gradient"
          gradientFrom="from-emerald-500"
          gradientTo="to-emerald-600"
        />
        <StatsCard
          title="Crew"
          value={stats.crew}
          icon={UserCog}
          variant="gradient"
          gradientFrom="from-purple-500"
          gradientTo="to-purple-600"
        />
        <StatsCard
          title="Pending Invites"
          value={stats.pending}
          icon={Mail}
          variant="gradient"
          gradientFrom="from-orange-500"
          gradientTo="to-orange-600"
        />
      </StatsGrid>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-2">
            <Mail className="h-4 w-4" />
            Invites ({invites.filter(i => i.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full md:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Cari nama atau email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-slate-900/50 border-slate-700"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[120px] bg-slate-900/50 border-slate-700">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="crew">Crew</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] bg-slate-900/50 border-slate-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={openInviteDialog} className="bg-amber-500 hover:bg-amber-600 text-black">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((member, index) => {
                const RoleIcon = ROLE_CONFIG[member.role].icon
                return (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
                      <div className={cn(
                        "h-1",
                        member.role === 'owner' ? "bg-amber-500" :
                        member.role === 'admin' ? "bg-blue-500" : "bg-purple-500"
                      )} />
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-slate-600">
                              <AvatarImage src={member.avatarUrl || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white">{member.name}</p>
                                {member.role === 'owner' && (
                                  <Crown className="h-4 w-4 text-amber-400" />
                                )}
                              </div>
                              <p className="text-sm text-slate-400">{member.email}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuLabel className="text-slate-400 text-xs">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem 
                                onClick={() => { setSelectedMember(member); setMemberDetailOpen(true) }}
                                className="text-slate-300"
                              >
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              {member.role !== 'owner' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => openEditDialog(member)}
                                    className="text-slate-300"
                                  >
                                    <Edit className="h-4 w-4 mr-2" /> Edit Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => { setSelectedMember(member); setPermissionsDialogOpen(true) }}
                                    className="text-slate-300"
                                  >
                                    <Key className="h-4 w-4 mr-2" /> Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-700" />
                                  <DropdownMenuItem 
                                    onClick={() => { setSelectedMember(member); setDeleteDialogOpen(true) }}
                                    className="text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <Separator className="my-4 bg-slate-700" />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={cn("border-0", ROLE_CONFIG[member.role].color)}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {ROLE_CONFIG[member.role].label}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className={cn(
                                member.status === 'active' 
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" 
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                              )}
                            >
                              {member.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Calendar className="h-3 w-3" />
                              Joined {new Date(member.joinedAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Building2 className="h-3 w-3" />
                              {member.assignedEvents.length} Events
                            </div>
                          </div>

                          {/* Permissions Preview */}
                          <div className="flex flex-wrap gap-1">
                            {member.permissions.includes('all') ? (
                              <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">
                                Full Access
                              </Badge>
                            ) : (
                              member.permissions.slice(0, 3).map(p => {
                                const perm = PERMISSION_OPTIONS.find(opt => opt.id === p)
                                return perm ? (
                                  <Badge key={p} variant="outline" className="text-[10px] bg-slate-700/50 border-slate-600">
                                    {perm.label}
                                  </Badge>
                                ) : null
                              })
                            )}
                            {member.permissions.length > 3 && !member.permissions.includes('all') && (
                              <Badge variant="outline" className="text-[10px] bg-slate-700/50">
                                +{member.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="h-5 w-5 text-amber-500" />
                    Pending Invitations
                  </CardTitle>
                  <CardDescription>Undangan yang belum diterima</CardDescription>
                </div>
                <Button size="sm" onClick={openInviteDialog} className="bg-amber-500 hover:bg-amber-600 text-black">
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invites.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada undangan pending</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Mail className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{invite.email}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span>Role: {invite.role}</span>
                          <span>Invited: {new Date(invite.invitedAt).toLocaleDateString('id-ID')}</span>
                          <span>By: {invite.invitedBy}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          invite.status === 'pending' && "bg-amber-500/20 text-amber-400 border-amber-500/20",
                          invite.status === 'accepted' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
                          invite.status === 'expired' && "bg-red-500/20 text-red-400 border-red-500/20"
                        )}
                      >
                        {invite.status}
                      </Badge>
                      {invite.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-slate-700 text-slate-300"
                            onClick={() => handleResendInvite(invite)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleCancelInvite(invite.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===================================== */}
      {/* DIALOGS */}
      {/* ===================================== */}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-500" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Kirim undangan untuk bergabung dengan tim Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Email Address *</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <Select 
                value={inviteForm.role} 
                onValueChange={(v) => setInviteForm(prev => ({ ...prev, role: v as 'admin' | 'crew' }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="crew">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-purple-400" />
                      Crew
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSION_OPTIONS.map((perm) => (
                  <label
                    key={perm.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                      inviteForm.permissions.includes(perm.id)
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-slate-800 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={inviteForm.permissions.includes(perm.id)}
                      onChange={() => {
                        setInviteForm(prev => ({
                          ...prev,
                          permissions: prev.permissions.includes(perm.id)
                            ? prev.permissions.filter(p => p !== perm.id)
                            : [...prev.permissions, perm.id]
                        }))
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm text-slate-300">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Assign to Events</Label>
              <div className="flex flex-wrap gap-2">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors text-sm",
                      inviteForm.assignedEvents.includes(event.id)
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={inviteForm.assignedEvents.includes(event.id)}
                      onChange={() => {
                        setInviteForm(prev => ({
                          ...prev,
                          assignedEvents: prev.assignedEvents.includes(event.id)
                            ? prev.assignedEvents.filter(e => e !== event.id)
                            : [...prev.assignedEvents, event.id]
                        }))
                      }}
                      className="sr-only"
                    />
                    {event.name.length > 20 ? event.name.slice(0, 20) + '...' : event.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSendInvite} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Send className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              {selectedMember?.name} ({selectedMember?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Role</Label>
              <Select 
                value={editForm.role} 
                onValueChange={(v) => setEditForm(prev => ({ ...prev, role: v as 'owner' | 'admin' | 'crew' }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="crew">Crew</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select 
                value={editForm.status} 
                onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v as 'active' | 'inactive' }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleUpdateMember} className="bg-amber-500 hover:bg-amber-600 text-black">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Manage Permissions
            </DialogTitle>
            <DialogDescription>
              {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {PERMISSION_OPTIONS.map((perm) => (
              <label
                key={perm.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                  editForm.permissions.includes(perm.id)
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-slate-800 border-slate-700 hover:border-slate-600"
                )}
              >
                <div>
                  <p className="font-medium text-slate-200">{perm.label}</p>
                  <p className="text-xs text-slate-400">{perm.description}</p>
                </div>
                <Switch
                  checked={editForm.permissions.includes(perm.id)}
                  onCheckedChange={() => togglePermission(perm.id)}
                />
              </label>
            ))}

            <Separator className="bg-slate-700" />

            <div className="space-y-2">
              <Label className="text-slate-300">Event Assignments</Label>
              <div className="space-y-2">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer hover:border-slate-600"
                  >
                    <span className="text-sm text-slate-300">{event.name}</span>
                    <Switch
                      checked={editForm.assignedEvents.includes(event.id)}
                      onCheckedChange={() => toggleEventAssignment(event.id)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleUpdateMember} className="bg-amber-500 hover:bg-amber-600 text-black">
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus <span className="text-amber-400 font-medium">{selectedMember?.name}</span> dari tim? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Member Detail Dialog */}
      <Dialog open={memberDetailOpen} onOpenChange={setMemberDetailOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedMember.avatarUrl || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xl">
                    {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-white">{selectedMember.name}</p>
                  <p className="text-slate-400">{selectedMember.email}</p>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Role</p>
                  <Badge variant="outline" className={cn("border-0 mt-1", ROLE_CONFIG[selectedMember.role].color)}>
                    {ROLE_CONFIG[selectedMember.role].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "mt-1",
                      selectedMember.status === 'active' 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" 
                        : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                    )}
                  >
                    {selectedMember.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500">Joined</p>
                  <p className="text-white">{new Date(selectedMember.joinedAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Active</p>
                  <p className="text-white">{selectedMember.lastActive || 'Unknown'}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-sm mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {selectedMember.permissions.includes('all') ? (
                    <Badge className="bg-amber-500/20 text-amber-400">Full Access</Badge>
                  ) : (
                    selectedMember.permissions.map(p => {
                      const perm = PERMISSION_OPTIONS.find(opt => opt.id === p)
                      return perm ? (
                        <Badge key={p} variant="outline" className="bg-slate-800 border-slate-700">
                          {perm.label}
                        </Badge>
                      ) : null
                    })
                  )}
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-sm mb-2">Assigned Events ({selectedMember.assignedEvents.length})</p>
                <div className="flex flex-wrap gap-1">
                  {selectedMember.assignedEvents.map(eventId => {
                    const event = events.find(e => e.id === eventId)
                    return event ? (
                      <Badge key={eventId} variant="outline" className="bg-slate-800 border-slate-700">
                        {event.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
