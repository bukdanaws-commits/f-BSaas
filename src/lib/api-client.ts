// =====================================
// API CLIENT - Connect to Backend API
// Uses Next.js API proxy in development
// Direct API calls in production
// =====================================

// In production, use direct API URL
// In development, use Next.js API proxy to avoid CORS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'

// Types
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  is_super_admin: boolean
  role: 'super_admin' | 'owner' | 'admin' | 'crew'
  tenant?: Tenant
  wallet?: CreditWallet
}

export interface Tenant {
  id: string
  name: string
  slug?: string
  status: string
  phone?: string
  address?: string
}

export interface CreditWallet {
  id: string
  tenant_id: string
  balance: number
  bonus_balance: number
  total_purchased?: number
  total_used?: number
  total_bonus_received?: number
}

export interface Event {
  id: string
  tenant_id: string
  name: string
  title?: string
  description?: string
  banner_url?: string
  start_date?: string
  end_date?: string
  location?: string
  category?: string
  capacity: number
  welcome_message: string
  display_duration: number
  enable_sound: boolean
  check_in_desks: number
  default_max_food_claims: number
  default_max_drink_claims: number
  storage_days: number
  status: 'draft' | 'active' | 'completed'
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  tenant_id: string
  event_id: string
  name: string
  email: string
  phone?: string
  qr_code: string
  ticket_type_id?: string
  is_checked_in: boolean
  checked_in_at?: string
  checkin_count: number
  food_claims: number
  drink_claims: number
  max_food_claims: number
  max_drink_claims: number
  is_active: boolean
  is_blacklisted: boolean
  original_photo_url?: string
  ai_photo_url?: string
  ai_generation_status: string
  created_at: string
  updated_at: string
}

export interface PricingPackage {
  id: string
  name: string
  slug: string
  credits_included: number
  price: number
  price_per_participant?: number
  features: string[]
  is_popular: boolean
  is_active: boolean
}

export interface CreditTransaction {
  id: string
  tenant_id: string
  type: 'purchase' | 'usage' | 'bonus' | 'refund'
  amount: number
  reference_type?: string
  reference_id?: string
  description?: string
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
}

// =====================================
// API CLIENT CLASS
// =====================================
class ApiClient {
  private token: string | null = null

  constructor() {
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken() {
    return this.token
  }

  // Build URL - handles both proxy and direct API
  private buildUrl(endpoint: string): string {
    // If using direct API URL (production), endpoint already includes /api prefix
    if (API_BASE_URL.startsWith('http')) {
      return `${API_BASE_URL}${endpoint}`
    }
    // If using proxy (development), prepend /api prefix
    return `${API_BASE_URL}${endpoint}`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint)
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP Error: ${response.status}`,
          message: data.message,
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // ==================== AUTH ====================
  
  async getGoogleAuthUrl() {
    return this.request<{ auth_url: string }>('/auth/google')
  }

  async loginWithGoogle(accessToken: string) {
    const response = await this.request<{ token: string; user: User; tenant?: Tenant; role?: string }>('/auth/google/login', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    })
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me')
  }

  logout() {
    this.setToken(null)
  }

  // ==================== EVENTS ====================

  async getEvents(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    
    const queryStr = query.toString()
    return this.request<Event[]>(`/events${queryStr ? '?' + queryStr : ''}`)
  }

  async getEvent(id: string) {
    return this.request<Event>(`/events/${id}`)
  }

  async createEvent(data: Partial<Event>) {
    return this.request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEvent(id: string, data: Partial<Event>) {
    return this.request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEvent(id: string) {
    return this.request<void>(`/events/${id}`, {
      method: 'DELETE',
    })
  }

  async getEventStats(id: string) {
    return this.request<{
      total_participants: number
      checked_in: number
      total_food_claims: number
      total_drink_claims: number
    }>(`/events/${id}/stats`)
  }

  // ==================== PARTICIPANTS ====================

  async getParticipants(eventId: string, params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.search) query.set('search', params.search)
    
    return this.request<Participant[]>(`/events/${eventId}/participants?${query}`)
  }

  async getParticipantByQR(qrCode: string) {
    return this.request<Participant>(`/participants/qr/${qrCode}`)
  }

  async createParticipant(eventId: string, data: Partial<Participant>) {
    return this.request<Participant>(`/events/${eventId}/participants`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async importParticipants(eventId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const url = this.buildUrl(`/events/${eventId}/participants/import`)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: formData,
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      }
    }
  }

  // ==================== CHECK-IN ====================

  async checkin(data: { qr_code: string; event_id: string; desk_number?: number }) {
    return this.request<{ success: boolean; message: string; participant: Participant }>('/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ==================== CLAIMS ====================

  async claim(data: { qr_code: string; event_id: string; claim_type: 'food' | 'drink' }) {
    return this.request<{ success: boolean; message: string; participant: Participant }>('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ==================== CREDITS ====================

  async getWallet() {
    return this.request<CreditWallet>('/credits/wallet')
  }

  async getCreditTransactions(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    
    return this.request<CreditTransaction[]>(`/credits/transactions?${query}`)
  }

  async purchaseCredits(amount: number) {
    return this.request<{ order_id: string; credits: number; price: number }>('/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  // ==================== PRICING ====================

  async getPricingPackages() {
    return this.request<PricingPackage[]>('/pricing/packages')
  }

  async purchasePackage(packageId: string) {
    return this.request<{ success: boolean; credits?: number; order_id?: string }>(`/pricing/packages/${packageId}/purchase`, {
      method: 'POST',
    })
  }

  // ==================== ADMIN ====================

  async getCreditSettings() {
    return this.request<{
      default_free_credits: number
      credit_per_checkin: number
      credit_per_claim: number
      credit_per_ai_photo: number
    }>('/admin/credit-settings')
  }

  async updateCreditSettings(data: Record<string, number>) {
    return this.request<any>('/admin/credit-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ==================== MENU ====================

  async getMenuItems(eventId: string) {
    return this.request<any[]>(`/events/${eventId}/menu`)
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export class for testing
export { ApiClient }
