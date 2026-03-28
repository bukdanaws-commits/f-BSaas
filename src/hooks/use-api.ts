// =====================================
// API HOOKS - Connected to Backend API
// Replaces mock-store selectors
// =====================================

import { useState, useEffect, useCallback } from 'react'
import { api, Event, Participant, CreditWallet, CreditTransaction, Tenant, Membership, Booth, MenuItem, CheckinRecord, DisplayQueue, PlatformStats, EventStats } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// =====================================
// EVENTS HOOKS
// =====================================

export function useTenantEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentUser = useAuthStore((state) => state.currentUser)

  const fetchEvents = useCallback(async () => {
    if (!currentUser) {
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await api.getEvents()
      if (response.success && response.data) {
        setEvents(response.data)
      } else {
        setError(response.error || 'Failed to fetch events')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setEvent(null)
      setLoading(false)
      return
    }

    const fetchEvent = async () => {
      setLoading(true)
      try {
        const response = await api.getEvent(eventId)
        if (response.success && response.data) {
          setEvent(response.data)
        } else {
          setError(response.error || 'Failed to fetch event')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  return { event, loading, error }
}

export function useEventStats(eventId: string | null) {
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setStats(null)
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await api.getEventStats(eventId)
        if (response.success && response.data) {
          setStats(response.data)
        } else {
          setError(response.error || 'Failed to fetch stats')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [eventId])

  return { stats, loading, error }
}

// =====================================
// PARTICIPANTS HOOKS
// =====================================

export function useEventParticipants(eventId: string | null, params?: { page?: number; limit?: number; search?: string }) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setParticipants([])
      setLoading(false)
      return
    }

    const fetchParticipants = async () => {
      setLoading(true)
      try {
        const response = await api.getParticipants(eventId, params)
        if (response.success && response.data) {
          setParticipants(response.data)
          setTotal(response.total || response.data.length)
        } else {
          setError(response.error || 'Failed to fetch participants')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchParticipants()
  }, [eventId, params?.page, params?.limit, params?.search])

  return { participants, total, loading, error }
}

export function useParticipantByQR(qrCode: string | null) {
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchParticipant = useCallback(async () => {
    if (!qrCode) {
      setParticipant(null)
      return null
    }

    setLoading(true)
    try {
      const response = await api.getParticipantByQR(qrCode)
      if (response.success && response.data) {
        setParticipant(response.data)
        return response.data
      } else {
        setError(response.error || 'Participant not found')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      return null
    } finally {
      setLoading(false)
    }
  }, [qrCode])

  return { participant, loading, error, fetchParticipant }
}

// =====================================
// CREDITS/WALLET HOOKS
// =====================================

export function useTenantWallet() {
  const [wallet, setWallet] = useState<CreditWallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.getWallet()
      if (response.success && response.data) {
        setWallet(response.data)
      } else {
        setError(response.error || 'Failed to fetch wallet')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])

  return { wallet, loading, error, refetch: fetchWallet }
}

export function useTenantTransactions(params?: { page?: number; limit?: number; type?: string }) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.getCreditTransactions(params)
      if (response.success && response.data) {
        setTransactions(response.data)
      } else {
        setError(response.error || 'Failed to fetch transactions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [params?.page, params?.limit, params?.type])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return { transactions, loading, error, refetch: fetchTransactions }
}

// =====================================
// TENANT STATS HOOK
// =====================================

export function useTenantStats() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    totalCheckIns: 0,
    totalClaims: 0,
    credits: {
      balance: 0,
      bonusBalance: 0,
      total: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentUser = useAuthStore((state) => state.currentUser)

  const fetchStats = useCallback(async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch events and wallet in parallel
      const [eventsRes, walletRes] = await Promise.all([
        api.getEvents(),
        api.getWallet()
      ])

      const events = eventsRes.success ? (eventsRes.data || []) : []
      const wallet = walletRes.success ? walletRes.data : null

      // Calculate stats
      const totalEvents = events.length
      const activeEvents = events.filter(e => e.status === 'active').length

      // Fetch stats for each active event
      let totalParticipants = 0
      let totalCheckIns = 0
      let totalClaims = 0

      for (const event of events) {
        const statsRes = await api.getEventStats(event.id)
        if (statsRes.success && statsRes.data) {
          totalParticipants += statsRes.data.total_participants || 0
          totalCheckIns += statsRes.data.checked_in || 0
          totalClaims += (statsRes.data.total_food_claims || 0) + (statsRes.data.total_drink_claims || 0)
        }
      }

      setStats({
        totalEvents,
        activeEvents,
        totalParticipants,
        totalCheckIns,
        totalClaims,
        credits: {
          balance: wallet?.balance || 0,
          bonusBalance: wallet?.bonus_balance || 0,
          total: (wallet?.balance || 0) + (wallet?.bonus_balance || 0)
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

// =====================================
// TEAM/CREW HOOKS
// =====================================

export function useTenantCrew() {
  const [crew, setCrew] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCrew = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.getMemberships()
      if (response.success && response.data) {
        setCrew(response.data)
      } else {
        setError(response.error || 'Failed to fetch crew')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCrew()
  }, [fetchCrew])

  return { crew, loading, error, refetch: fetchCrew }
}

// =====================================
// CHECK-IN HOOKS
// =====================================

export function useCheckin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkin = useCallback(async (data: { qr_code: string; event_id: string; desk_number?: number }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.checkin(data)
      setLoading(false)
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      setError(errorMsg)
      setLoading(false)
      return { success: false, error: errorMsg }
    }
  }, [])

  const manualCheckin = useCallback(async (data: { participant_id: string; event_id: string; desk_number?: number }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.manualCheckin(data)
      setLoading(false)
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      setError(errorMsg)
      setLoading(false)
      return { success: false, error: errorMsg }
    }
  }, [])

  return { checkin, manualCheckin, loading, error }
}

export function useCheckinHistory(eventId: string | null, limit?: number) {
  const [history, setHistory] = useState<CheckinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setHistory([])
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      setLoading(true)
      try {
        const response = await api.getCheckinHistory(eventId, { limit })
        if (response.success && response.data) {
          setHistory(response.data)
        } else {
          setError(response.error || 'Failed to fetch history')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [eventId, limit])

  return { history, loading, error }
}

// =====================================
// CLAIMS HOOKS
// =====================================

export function useClaim() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const claim = useCallback(async (data: { qr_code: string; event_id: string; claim_type: 'food' | 'drink' }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.claim(data)
      setLoading(false)
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      setError(errorMsg)
      setLoading(false)
      return { success: false, error: errorMsg }
    }
  }, [])

  const quickClaim = useCallback(async (data: { participant_id: string; event_id: string; claim_type: 'food' | 'drink' }) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.quickClaim(data)
      setLoading(false)
      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      setError(errorMsg)
      setLoading(false)
      return { success: false, error: errorMsg }
    }
  }, [])

  return { claim, quickClaim, loading, error }
}

// =====================================
// F&B HOOKS
// =====================================

export function useEventBooths(eventId: string | null) {
  const [booths, setBooths] = useState<Booth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setBooths([])
      setLoading(false)
      return
    }

    const fetchBooths = async () => {
      setLoading(true)
      try {
        const response = await api.getBooths(eventId)
        if (response.success && response.data) {
          setBooths(response.data)
        } else {
          setError(response.error || 'Failed to fetch booths')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchBooths()
  }, [eventId])

  return { booths, loading, error }
}

export function useEventMenu(eventId: string | null) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setMenuItems([])
      setLoading(false)
      return
    }

    const fetchMenu = async () => {
      setLoading(true)
      try {
        const response = await api.getMenuItems(eventId)
        if (response.success && response.data) {
          setMenuItems(response.data)
        } else {
          setError(response.error || 'Failed to fetch menu')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [eventId])

  return { menuItems, loading, error }
}

// =====================================
// DISPLAY HOOKS
// =====================================

export function useDisplayQueue(eventId: string | null) {
  const [queue, setQueue] = useState<DisplayQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    if (!eventId) {
      setQueue([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await api.getDisplayQueue(eventId)
      if (response.success && response.data) {
        setQueue(response.data)
      } else {
        setError(response.error || 'Failed to fetch queue')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return { queue, loading, error, refetch: fetchQueue }
}

// =====================================
// SUPER ADMIN HOOKS
// =====================================

export function useAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.getAdminDashboard()
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError(response.error || 'Failed to fetch dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

export function useAdminTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenants = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.getAdminTenants()
      if (response.success && response.data) {
        setTenants(response.data)
      } else {
        setError(response.error || 'Failed to fetch tenants')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  return { tenants, loading, error, refetch: fetchTenants }
}

export function useAdminAnalytics() {
  const [analytics, setAnalytics] = useState<{
    tenants: number
    users: number
    events: number
    active_events: number
    participants: number
    checked_in: number
    total_checkins: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.getAdminAnalytics()
      if (response.success && response.data) {
        setAnalytics(response.data)
      } else {
        setError(response.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return { analytics, loading, error, refetch: fetchAnalytics }
}

// =====================================
// TENANT SETTINGS HOOK
// =====================================

export function useTenantSettings() {
  const [settings, setSettings] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.getTenantSettings()
      if (response.success && response.data) {
        setSettings(response.data)
      } else {
        setError(response.error || 'Failed to fetch settings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = useCallback(async (data: Partial<Tenant>) => {
    setLoading(true)
    try {
      const response = await api.updateTenantSettings(data)
      if (response.success && response.data) {
        setSettings(response.data)
        return { success: true }
      } else {
        setError(response.error || 'Failed to update settings')
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [])

  return { settings, loading, error, refetch: fetchSettings, updateSettings }
}
