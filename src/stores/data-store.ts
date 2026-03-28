// =====================================
// DATA STORE - Zustand State Management
// Connected to Golang Backend API
// =====================================

import { create } from 'zustand'
import { 
  api, 
  Event, 
  Participant, 
  CreditTransaction,
  PricingPackage,
  CreditWallet 
} from '@/lib/api-client'

// =====================================
// EVENTS STORE
// =====================================
interface EventsState {
  events: Event[]
  currentEvent: Event | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchEvents: (params?: { status?: string; search?: string }) => Promise<void>
  fetchEvent: (id: string) => Promise<void>
  createEvent: (data: Partial<Event>) => Promise<{ success: boolean; event?: Event }>
  updateEvent: (id: string, data: Partial<Event>) => Promise<{ success: boolean }>
  deleteEvent: (id: string) => Promise<{ success: boolean }>
  duplicateEvent: (id: string) => Promise<{ success: boolean; event?: Event }>
  clearError: () => void
}

export const useEventsStore = create<EventsState>()((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async (params) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getEvents(params)
      
      if (response.success && response.data) {
        set({ events: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch events', isLoading: false })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
    }
  },

  fetchEvent: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getEvent(id)
      
      if (response.success && response.data) {
        set({ currentEvent: response.data.event, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch event', isLoading: false })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
    }
  },

  createEvent: async (data: Partial<Event>) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.createEvent(data)
      
      if (response.success && response.data) {
        const newEvent = response.data
        set(state => ({ 
          events: [...state.events, newEvent],
          isLoading: false,
        }))
        return { success: true, event: newEvent }
      } else {
        set({ error: response.error || 'Failed to create event', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  updateEvent: async (id: string, data: Partial<Event>) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.updateEvent(id, data)
      
      if (response.success && response.data) {
        const updatedEvent = response.data
        set(state => ({
          events: state.events.map(e => e.id === id ? updatedEvent : e),
          currentEvent: state.currentEvent?.id === id ? updatedEvent : state.currentEvent,
          isLoading: false,
        }))
        return { success: true }
      } else {
        set({ error: response.error || 'Failed to update event', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  deleteEvent: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.deleteEvent(id)
      
      if (response.success) {
        set(state => ({
          events: state.events.filter(e => e.id !== id),
          currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
          isLoading: false,
        }))
        return { success: true }
      } else {
        set({ error: response.error || 'Failed to delete event', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  duplicateEvent: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.duplicateEvent(id)
      
      if (response.success && response.data) {
        const newEvent = response.data
        set(state => ({
          events: [...state.events, newEvent],
          isLoading: false,
        }))
        return { success: true, event: newEvent }
      } else {
        set({ error: response.error || 'Failed to duplicate event', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  clearError: () => set({ error: null }),
}))

// =====================================
// PARTICIPANTS STORE
// =====================================
interface ParticipantsState {
  participants: Participant[]
  currentParticipant: Participant | null
  total: number
  page: number
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchParticipants: (eventId: string, params?: { page?: number; limit?: number; search?: string }) => Promise<void>
  fetchParticipant: (id: string) => Promise<void>
  fetchParticipantByQR: (qrCode: string) => Promise<{ success: boolean; participant?: Participant }>
  createParticipant: (eventId: string, data: Partial<Participant>) => Promise<{ success: boolean }>
  updateParticipant: (id: string, data: Partial<Participant>) => Promise<{ success: boolean }>
  deleteParticipant: (id: string) => Promise<{ success: boolean }>
  importParticipants: (eventId: string, file: File) => Promise<{ success: boolean; imported?: number; errors?: string[] }>
  clearParticipants: () => void
  clearError: () => void
}

export const useParticipantsStore = create<ParticipantsState>()((set) => ({
  participants: [],
  currentParticipant: null,
  total: 0,
  page: 1,
  isLoading: false,
  error: null,

  fetchParticipants: async (eventId, params) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getParticipants(eventId, params)
      
      if (response.success && response.data) {
        set({ 
          participants: response.data.data,
          total: response.data.total,
          page: response.data.page,
          isLoading: false,
        })
      } else {
        set({ error: response.error || 'Failed to fetch participants', isLoading: false })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
    }
  },

  fetchParticipant: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getParticipant(id)
      
      if (response.success && response.data) {
        set({ currentParticipant: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch participant', isLoading: false })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
    }
  },

  fetchParticipantByQR: async (qrCode: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getParticipantByQR(qrCode)
      
      if (response.success && response.data) {
        set({ currentParticipant: response.data.participant, isLoading: false })
        return { success: true, participant: response.data.participant }
      } else {
        set({ error: response.error || 'Participant not found', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  createParticipant: async (eventId, data) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.createParticipant(eventId, data)
      
      if (response.success && response.data) {
        set(state => ({
          participants: [...state.participants, response.data!],
          total: state.total + 1,
          isLoading: false,
        }))
        return { success: true }
      } else {
        set({ error: response.error || 'Failed to create participant', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  updateParticipant: async (id, data) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.updateParticipant(id, data)
      
      if (response.success && response.data) {
        set(state => ({
          participants: state.participants.map(p => p.id === id ? response.data! : p),
          currentParticipant: state.currentParticipant?.id === id ? response.data : state.currentParticipant,
          isLoading: false,
        }))
        return { success: true }
      } else {
        set({ error: response.error || 'Failed to update participant', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  deleteParticipant: async (id) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.deleteParticipant(id)
      
      if (response.success) {
        set(state => ({
          participants: state.participants.filter(p => p.id !== id),
          total: state.total - 1,
          isLoading: false,
        }))
        return { success: true }
      } else {
        set({ error: response.error || 'Failed to delete participant', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  importParticipants: async (eventId, file) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.importParticipants(eventId, file)
      
      if (response.success) {
        set({ isLoading: false })
        return { 
          success: true, 
          imported: response.imported_count,
          errors: response.errors,
        }
      } else {
        set({ error: response.error || 'Failed to import participants', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  clearParticipants: () => set({ participants: [], total: 0, page: 1 }),
  clearError: () => set({ error: null }),
}))

// =====================================
// CHECK-IN STORE
// =====================================
interface CheckinState {
  lastCheckin: { participant: Participant; event?: Event } | null
  isLoading: boolean
  error: string | null
  
  // Actions
  checkin: (qrCode: string, eventId?: string) => Promise<{ success: boolean; participant?: Participant; is_new?: boolean }>
  quickCheckin: (qrCode: string, eventId: string) => Promise<{ success: boolean }>
  undoCheckin: (participantId: string) => Promise<{ success: boolean }>
  clearLastCheckin: () => void
  clearError: () => void
}

export const useCheckinStore = create<CheckinState>()((set) => ({
  lastCheckin: null,
  isLoading: false,
  error: null,

  checkin: async (qrCode, eventId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.checkin({ qr_code: qrCode, event_id: eventId })
      
      if (response.success && response.data) {
        set({ 
          lastCheckin: {
            participant: response.data.participant,
            event: response.data.event,
          },
          isLoading: false,
        })
        return { 
          success: true, 
          participant: response.data.participant,
          is_new: response.data.is_new,
        }
      } else {
        set({ error: response.error || response.data?.message || 'Check-in failed', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  quickCheckin: async (qrCode, eventId) => {
    set({ isLoading: true, error: null })
    
    try {
      // First get participant by QR
      const participantRes = await api.getParticipantByQR(qrCode)
      
      if (!participantRes.success || !participantRes.data) {
        set({ error: 'Participant not found', isLoading: false })
        return { success: false }
      }
      
      // Then do check-in
      const response = await api.checkin({ 
        qr_code: qrCode, 
        event_id: eventId || participantRes.data.event.id 
      })
      
      if (response.success) {
        set({ isLoading: false })
        return { success: true }
      } else {
        set({ error: response.error || 'Check-in failed', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  undoCheckin: async (participantId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.undoCheckin(participantId)
      
      if (response.success) {
        set({ lastCheckin: null, isLoading: false })
        return { success: true }
      } else {
        set({ error: response.error || 'Failed to undo check-in', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  clearLastCheckin: () => set({ lastCheckin: null }),
  clearError: () => set({ error: null }),
}))

// =====================================
// CLAIMS STORE
// =====================================
interface ClaimsState {
  lastClaim: { participant: Participant; remaining: number } | null
  isLoading: boolean
  error: string | null
  
  // Actions
  claim: (qrCode: string, claimType: 'food' | 'drink', eventId?: string) => Promise<{ success: boolean; remaining?: number }>
  quickClaim: (qrCode: string, claimType: 'food' | 'drink', eventId?: string) => Promise<{ success: boolean; food_remaining?: number; drink_remaining?: number }>
  clearLastClaim: () => void
  clearError: () => void
}

export const useClaimsStore = create<ClaimsState>()((set) => ({
  lastClaim: null,
  isLoading: false,
  error: null,

  claim: async (qrCode, claimType, eventId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.quickClaim({ 
        qr_code: qrCode, 
        claim_type: claimType,
        event_id: eventId,
      })
      
      if (response.success && response.data) {
        set({ 
          lastClaim: {
            participant: response.data.participant,
            remaining: claimType === 'food' 
              ? response.data.food_remaining 
              : response.data.drink_remaining,
          },
          isLoading: false,
        })
        return { 
          success: true, 
          remaining: claimType === 'food' 
            ? response.data.food_remaining 
            : response.data.drink_remaining,
        }
      } else {
        set({ error: response.error || response.data?.message || 'Claim failed', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  quickClaim: async (qrCode, claimType, eventId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.quickClaim({ 
        qr_code: qrCode, 
        claim_type: claimType,
        event_id: eventId,
      })
      
      if (response.success && response.data) {
        set({ isLoading: false })
        return { 
          success: true,
          food_remaining: response.data.food_remaining,
          drink_remaining: response.data.drink_remaining,
        }
      } else {
        set({ error: response.error || 'Claim failed', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  clearLastClaim: () => set({ lastClaim: null }),
  clearError: () => set({ error: null }),
}))

// =====================================
// CREDITS STORE
// =====================================
interface CreditsState {
  wallet: CreditWallet | null
  transactions: CreditTransaction[]
  packages: PricingPackage[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchWallet: () => Promise<void>
  fetchTransactions: (params?: { page?: number; limit?: number }) => Promise<void>
  fetchPackages: () => Promise<void>
  purchaseCredits: (amount: number) => Promise<{ success: boolean; payment_url?: string }>
  purchasePackage: (packageId: string) => Promise<{ success: boolean; payment_url?: string }>
  clearError: () => void
}

export const useCreditsStore = create<CreditsState>()((set) => ({
  wallet: null,
  transactions: [],
  packages: [],
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getWallet()
      
      if (response.success && response.data) {
        set({ wallet: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch wallet', isLoading: false })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
    }
  },

  fetchTransactions: async (params) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getCreditTransactions(params)
      
      if (response.success && response.data) {
        set({ transactions: response.data.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch transactions', isLoading: false })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
    }
  },

  fetchPackages: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.getPricingPackages()
      
      if (response.success && response.data) {
        set({ packages: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch packages', isLoading: false })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
    }
  },

  purchaseCredits: async (amount) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.purchaseCredits(amount)
      
      if (response.success && response.data) {
        set({ isLoading: false })
        return { success: true, payment_url: response.data.payment_url }
      } else {
        set({ error: response.error || 'Failed to purchase credits', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  purchasePackage: async (packageId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.purchasePackage(packageId)
      
      if (response.success && response.data) {
        // Refresh wallet after purchase
        if (response.data.wallet) {
          set({ wallet: response.data.wallet, isLoading: false })
        } else {
          set({ isLoading: false })
        }
        return { success: true, payment_url: response.data.payment_url }
      } else {
        set({ error: response.error || 'Failed to purchase package', isLoading: false })
        return { success: false }
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Network error',
        isLoading: false,
      })
      return { success: false }
    }
  },

  clearError: () => set({ error: null }),
}))
