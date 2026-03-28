// =====================================
// MOCK STORE - Zustand State Management
// For development without Supabase
// =====================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  mockUsers, 
  mockTenants, 
  mockMemberships, 
  mockCreditWallets, 
  mockCreditTransactions,
  mockEvents,
  mockEventStaff,
  mockTicketTypes,
  mockParticipants,
  mockCheckins,
  mockBooths,
  mockMenuCategories,
  mockMenuItems,
  mockClaims,
  mockDisplayQueue,
  mockScanLogs
} from '@/lib/mock-data'
import { 
  User, 
  Tenant, 
  Membership, 
  CreditWallet, 
  CreditTransaction,
  Event, 
  EventStaff, 
  TicketType, 
  Participant, 
  Checkin, 
  Booth, 
  MenuCategory, 
  MenuItem, 
  Claim, 
  DisplayQueue, 
  ScanLog 
} from '@/types/database'

// =====================================
// TYPES
// =====================================
export type UserRole = 'super_admin' | 'owner' | 'admin' | 'crew'

export interface CurrentUser {
  user: User
  membership?: Membership
  tenant?: Tenant
  role: UserRole
}

// =====================================
// AUTH STORE
// =====================================
interface AuthState {
  currentUser: CurrentUser | null
  isAuthenticated: boolean
  
  // Actions
  login: (email: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  demoLogin: (role: 'super_admin' | 'owner' | 'crew') => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (email: string) => {
        const user = mockUsers.find(u => u.email === email)
        
        if (!user) {
          return { success: false, message: 'User not found' }
        }

        // Check if super admin
        if (user.is_super_admin) {
          set({
            currentUser: {
              user,
              role: 'super_admin'
            },
            isAuthenticated: true
          })
          return { success: true, message: 'Login successful' }
        }

        // Find membership
        const membership = mockMemberships.find(m => m.user_id === user.id)
        const tenant = membership 
          ? mockTenants.find(t => t.id === membership.tenant_id)
          : null

        set({
          currentUser: {
            user,
            membership,
            tenant,
            role: (membership?.role as UserRole) || 'owner'
          },
          isAuthenticated: true
        })

        return { success: true, message: 'Login successful' }
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false
        })
      },

      demoLogin: (role: 'super_admin' | 'owner' | 'crew') => {
        let user: User
        let membership: Membership | undefined
        let tenant: Tenant | undefined

        switch (role) {
          case 'super_admin':
            user = mockUsers.find(u => u.is_super_admin)!
            break
          case 'owner':
            user = mockUsers.find(u => u.email === 'owner@techconference.id')!
            membership = mockMemberships.find(m => m.user_id === user.id)
            tenant = mockTenants.find(t => t.id === membership?.tenant_id)
            break
          case 'crew':
            user = mockUsers.find(u => u.email === 'crew1@techconference.id')!
            membership = mockMemberships.find(m => m.user_id === user.id)
            tenant = mockTenants.find(t => t.id === membership?.tenant_id)
            break
        }

        set({
          currentUser: {
            user,
            membership,
            tenant,
            role
          },
          isAuthenticated: true
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// =====================================
// DATA STORE
// =====================================
interface DataState {
  // Data
  users: User[]
  tenants: Tenant[]
  memberships: Membership[]
  creditWallets: CreditWallet[]
  creditTransactions: CreditTransaction[]
  events: Event[]
  eventStaff: EventStaff[]
  ticketTypes: TicketType[]
  participants: Participant[]
  checkins: Checkin[]
  booths: Booth[]
  menuCategories: MenuCategory[]
  menuItems: MenuItem[]
  claims: Claim[]
  displayQueue: DisplayQueue[]
  scanLogs: ScanLog[]

  // Actions
  resetToMock: () => void
  
  // Event actions
  addEvent: (event: Event) => void
  updateEvent: (id: string, data: Partial<Event>) => void
  
  // Participant actions
  addParticipant: (participant: Participant) => void
  updateParticipant: (id: string, data: Partial<Participant>) => void
  
  // Check-in actions
  addCheckin: (checkin: Checkin) => void
  
  // Claim actions
  addClaim: (claim: Claim) => void
  
  // Credit actions
  addCreditTransaction: (transaction: CreditTransaction) => void
  updateWallet: (tenantId: string, data: Partial<CreditWallet>) => void
  
  // Display actions
  addDisplayQueue: (display: DisplayQueue) => void
  markDisplayShown: (id: string) => void
  
  // Scan log actions
  addScanLog: (log: ScanLog) => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      // Initialize with mock data
      users: mockUsers,
      tenants: mockTenants,
      memberships: mockMemberships,
      creditWallets: mockCreditWallets,
      creditTransactions: mockCreditTransactions,
      events: mockEvents,
      eventStaff: mockEventStaff,
      ticketTypes: mockTicketTypes,
      participants: mockParticipants,
      checkins: mockCheckins,
      booths: mockBooths,
      menuCategories: mockMenuCategories,
      menuItems: mockMenuItems,
      claims: mockClaims,
      displayQueue: mockDisplayQueue,
      scanLogs: mockScanLogs,

      resetToMock: () => set({
        users: mockUsers,
        tenants: mockTenants,
        memberships: mockMemberships,
        creditWallets: mockCreditWallets,
        creditTransactions: mockCreditTransactions,
        events: mockEvents,
        eventStaff: mockEventStaff,
        ticketTypes: mockTicketTypes,
        participants: mockParticipants,
        checkins: mockCheckins,
        booths: mockBooths,
        menuCategories: mockMenuCategories,
        menuItems: mockMenuItems,
        claims: mockClaims,
        displayQueue: mockDisplayQueue,
        scanLogs: mockScanLogs
      }),

      addEvent: (event) => set((state) => ({
        events: [...state.events, event]
      })),

      updateEvent: (id, data) => set((state) => ({
        events: state.events.map(e => 
          e.id === id ? { ...e, ...data, updated_at: new Date().toISOString() } : e
        )
      })),

      addParticipant: (participant) => set((state) => ({
        participants: [...state.participants, participant]
      })),

      updateParticipant: (id, data) => set((state) => ({
        participants: state.participants.map(p => 
          p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
        )
      })),

      addCheckin: (checkin) => set((state) => ({
        checkins: [...state.checkins, checkin]
      })),

      addClaim: (claim) => set((state) => ({
        claims: [...state.claims, claim]
      })),

      addCreditTransaction: (transaction) => set((state) => ({
        creditTransactions: [...state.creditTransactions, transaction]
      })),

      updateWallet: (tenantId, data) => set((state) => ({
        creditWallets: state.creditWallets.map(w => 
          w.tenant_id === tenantId ? { ...w, ...data } : w
        )
      })),

      addDisplayQueue: (display) => set((state) => ({
        displayQueue: [...state.displayQueue, display]
      })),

      markDisplayShown: (id) => set((state) => ({
        displayQueue: state.displayQueue.map(d => 
          d.id === id ? { ...d, is_displayed: true } : d
        )
      })),

      addScanLog: (log) => set((state) => ({
        scanLogs: [...state.scanLogs, log]
      }))
    }),
    {
      name: 'data-storage',
      partialize: (state) => ({
        users: state.users,
        tenants: state.tenants,
        memberships: state.memberships,
        creditWallets: state.creditWallets,
        creditTransactions: state.creditTransactions,
        events: state.events,
        eventStaff: state.eventStaff,
        ticketTypes: state.ticketTypes,
        participants: state.participants,
        checkins: state.checkins,
        booths: state.booths,
        menuCategories: state.menuCategories,
        menuItems: state.menuItems,
        claims: state.claims,
        displayQueue: state.displayQueue,
        scanLogs: state.scanLogs
      })
    }
  )
)

// =====================================
// SELECTORS
// =====================================

// Get events for current tenant
export const useTenantEvents = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const events = useDataStore((state) => state.events)
  
  if (!currentUser?.tenant) return []
  return events.filter(e => e.tenant_id === currentUser.tenant.id)
}

// Get wallet for current tenant
export const useTenantWallet = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const wallets = useDataStore((state) => state.creditWallets)
  
  if (!currentUser?.tenant) return null
  return wallets.find(w => w.tenant_id === currentUser.tenant.id) || null
}

// Get participants for current event
export const useEventParticipants = (eventId: string) => {
  const participants = useDataStore((state) => state.participants)
  return participants.filter(p => p.event_id === eventId)
}

// Get stats for current tenant
export const useTenantStats = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const { events, participants, checkins, claims, creditWallets } = useDataStore()
  
  if (!currentUser?.tenant) {
    return {
      totalEvents: 0,
      activeEvents: 0,
      totalParticipants: 0,
      totalCheckIns: 0,
      totalClaims: 0,
      credits: { balance: 0, bonusBalance: 0, total: 0 }
    }
  }
  
  const tenantEvents = events.filter(e => e.tenant_id === currentUser.tenant.id)
  const tenantParticipants = participants.filter(p => p.tenant_id === currentUser.tenant.id)
  const tenantCheckins = checkins.filter(c => 
    tenantEvents.some(e => e.id === c.event_id)
  )
  const tenantClaims = claims.filter(c => 
    tenantEvents.some(e => e.id === c.event_id)
  )
  const wallet = creditWallets.find(w => w.tenant_id === currentUser.tenant.id)
  
  return {
    totalEvents: tenantEvents.length,
    activeEvents: tenantEvents.filter(e => e.status === 'active').length,
    totalParticipants: tenantParticipants.length,
    totalCheckIns: tenantCheckins.length,
    totalClaims: tenantClaims.length,
    credits: {
      balance: wallet?.balance || 0,
      bonusBalance: wallet?.bonus_balance || 0,
      total: (wallet?.balance || 0) + (wallet?.bonus_balance || 0)
    }
  }
}

// Get all tenants (for super admin)
export const useAllTenants = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const { tenants, events, creditWallets, creditTransactions } = useDataStore()
  
  if (currentUser?.role !== 'super_admin') return []
  
  return tenants.map(t => {
    const tenantEvents = events.filter(e => e.tenant_id === t.id)
    const wallet = creditWallets.find(w => w.tenant_id === t.id)
    const totalSpent = creditTransactions
      .filter(tx => tx.tenant_id === t.id && tx.type === 'usage')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    
    return {
      ...t,
      eventCount: tenantEvents.length,
      balance: wallet?.balance || 0,
      bonusBalance: wallet?.bonus_balance || 0,
      totalSpent
    }
  })
}

// Get crew members for current tenant
export const useTenantCrew = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const { memberships, users } = useDataStore()
  
  if (!currentUser?.tenant) return []
  
  return memberships
    .filter(m => m.tenant_id === currentUser.tenant.id)
    .map(m => ({
      ...m,
      user: users.find(u => u.id === m.user_id)!
    }))
}

// Get F&B data for event
export const useEventFnb = (eventId: string) => {
  const { booths, menuCategories, menuItems, claims } = useDataStore()
  
  return {
    booths: booths.filter(b => b.event_id === eventId),
    menuCategories: menuCategories.filter(c => c.event_id === eventId),
    menuItems: menuItems.filter(m => m.event_id === eventId),
    claims: claims.filter(c => c.event_id === eventId)
  }
}

// Get credit transactions for tenant
export const useTenantTransactions = () => {
  const currentUser = useAuthStore((state) => state.currentUser)
  const creditTransactions = useDataStore((state) => state.creditTransactions)
  
  if (!currentUser?.tenant) return []
  return creditTransactions.filter(tx => tx.tenant_id === currentUser.tenant.id)
}
