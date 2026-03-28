// =====================================
// API CLIENT - Connect to Backend API
// Uses Next.js API proxy in development
// Direct API calls in production
// =====================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/proxy'

// =====================================
// TYPES
// =====================================

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  is_super_admin: boolean
  role?: 'super_admin' | 'owner' | 'admin' | 'crew'
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
  logo_url?: string
  created_at?: string
  owner_id?: string
  eventCount?: number
  balance?: number
  bonusBalance?: number
  totalSpent?: number
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
  company?: string
  position?: string
  qr_code: string
  qr_code_url?: string
  ticket_type_id?: string
  ticket_type?: TicketType
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

export interface TicketType {
  id: string
  event_id: string
  name: string
  description?: string
  price: number
  quota: number
  sold: number
  is_free: boolean
  features?: string[]
  is_active: boolean
  created_at: string
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
  sort_order?: number
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

export interface MenuItem {
  id: string
  event_id: string
  booth_id?: string
  name: string
  description?: string
  type: 'food' | 'drink'
  price: number
  stock: number
  claimed: number
  image_url?: string
  is_active: boolean
  booth?: Booth
}

export interface Booth {
  id: string
  event_id: string
  name: string
  type: 'food' | 'drink' | 'both'
  description?: string
  location?: string
  is_active: boolean
}

export interface Membership {
  id: string
  user_id: string
  tenant_id: string
  role: 'owner' | 'admin' | 'crew'
  permissions?: string[]
  status: string
  user?: User
  created_at: string
}

export interface CheckinRecord {
  id: string
  event_id: string
  participant_id: string
  operator_id: string
  desk_number: number
  created_at: string
  participant?: Participant
}

export interface DisplayQueue {
  id: string
  event_id: string
  participant_id: string
  name: string
  photo_url?: string
  message?: string
  is_displayed: boolean
  created_at: string
}

export interface EventStats {
  total_participants: number
  checked_in: number
  total_food_claims: number
  total_drink_claims: number
  pending_payments?: number
  total_revenue?: number
}

export interface PlatformStats {
  total_tenants: number
  active_tenants: number
  total_users: number
  total_events: number
  active_events: number
  total_revenue: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
  total?: number
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page?: number
  limit?: number
}

// =====================================
// API CLIENT CLASS
// =====================================
class ApiClient {
  private token: string | null = null

  constructor() {
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

  private buildUrl(endpoint: string): string {
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
        total: data.total,
        page: data.page,
        limit: data.limit,
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

  async duplicateEvent(id: string) {
    return this.request<Event>(`/events/${id}/duplicate`, {
      method: 'POST',
    })
  }

  async getEventStats(id: string) {
    return this.request<EventStats>(`/events/${id}/stats`)
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

  async getParticipant(id: string) {
    return this.request<Participant>(`/participants/${id}`)
  }

  async createParticipant(eventId: string, data: Partial<Participant>) {
    return this.request<Participant>(`/events/${eventId}/participants`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateParticipant(id: string, data: Partial<Participant>) {
    return this.request<Participant>(`/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteParticipant(id: string) {
    return this.request<void>(`/participants/${id}`, {
      method: 'DELETE',
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

  // ==================== TICKET TYPES ====================

  async getTicketTypes(eventId: string) {
    return this.request<TicketType[]>(`/events/${eventId}/tickets`)
  }

  async createTicketType(eventId: string, data: Partial<TicketType>) {
    return this.request<TicketType>(`/events/${eventId}/tickets`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTicketType(id: string, data: Partial<TicketType>) {
    return this.request<TicketType>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTicketType(id: string) {
    return this.request<void>(`/tickets/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== CHECK-IN ====================

  async checkin(data: { qr_code: string; event_id: string; desk_number?: number }) {
    return this.request<{ success: boolean; message: string; participant: Participant }>('/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async manualCheckin(data: { participant_id: string; event_id: string; desk_number?: number }) {
    return this.request<{ success: boolean; message: string; participant: Participant }>('/checkin/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async undoCheckin(id: string) {
    return this.request<{ success: boolean; message: string }>('/checkin/undo/' + id, {
      method: 'POST',
    })
  }

  async getCheckinHistory(eventId: string, params?: { limit?: number }) {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', params.limit.toString())
    
    return this.request<CheckinRecord[]>(`/checkin/history/${eventId}?${query}`)
  }

  // ==================== CLAIMS ====================

  async claim(data: { qr_code: string; event_id: string; claim_type: 'food' | 'drink' }) {
    return this.request<{ success: boolean; message: string; participant: Participant }>('/claims', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async quickClaim(data: { participant_id: string; event_id: string; claim_type: 'food' | 'drink' }) {
    return this.request<{ success: boolean; message: string; participant: Participant }>('/claims/quick', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getClaimHistory(eventId: string, params?: { limit?: number }) {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', params.limit.toString())
    
    return this.request<any[]>(`/claims/history/${eventId}?${query}`)
  }

  // ==================== CREDITS ====================

  async getWallet() {
    return this.request<CreditWallet>('/credits/wallet')
  }

  async getCreditTransactions(params?: { page?: number; limit?: number; type?: string }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.type) query.set('type', params.type)
    
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

  // ==================== TENANT SETTINGS ====================

  async getTenantSettings() {
    return this.request<Tenant>('/tenants/me')
  }

  async updateTenantSettings(data: Partial<Tenant>) {
    return this.request<Tenant>('/tenants/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ==================== TEAM / MEMBERSHIPS ====================

  async getMemberships() {
    return this.request<Membership[]>('/tenants/crew')
  }

  async inviteMember(data: { email: string; role: string; permissions?: string[] }) {
    return this.request<Membership>('/tenants/crew/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMembership(id: string, data: Partial<Membership>) {
    return this.request<Membership>(`/tenants/crew/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async removeMember(id: string) {
    return this.request<void>(`/tenants/crew/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== BOOTHS ====================

  async getBooths(eventId: string) {
    return this.request<Booth[]>(`/events/${eventId}/booths`)
  }

  async createBooth(eventId: string, data: Partial<Booth>) {
    return this.request<Booth>(`/events/${eventId}/booths`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBooth(id: string, data: Partial<Booth>) {
    return this.request<Booth>(`/booths/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBooth(id: string) {
    return this.request<void>(`/booths/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== MENU ITEMS ====================

  async getMenuItems(eventId: string) {
    return this.request<MenuItem[]>(`/events/${eventId}/menu`)
  }

  async createMenuItem(eventId: string, data: Partial<MenuItem>) {
    return this.request<MenuItem>(`/events/${eventId}/menu`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>) {
    return this.request<MenuItem>(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMenuItem(id: string) {
    return this.request<void>(`/menu-items/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== MENU CATEGORIES ====================

  async getMenuCategories(eventId: string) {
    return this.request<any[]>(`/events/${eventId}/menu-categories`)
  }

  async createMenuCategory(eventId: string, data: { name: string; type: string }) {
    return this.request<any>(`/events/${eventId}/menu-categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMenuCategory(id: string, data: Partial<{ name: string; type: string }>) {
    return this.request<any>(`/menu-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMenuCategory(id: string) {
    return this.request<void>(`/menu-categories/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== DISPLAY ====================

  async getDisplayQueue(eventId: string) {
    return this.request<DisplayQueue[]>(`/events/${eventId}/display`)
  }

  async addToDisplayQueue(eventId: string, data: { participant_id: string; name: string; photo_url?: string }) {
    return this.request<DisplayQueue>(`/events/${eventId}/display`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markDisplayed(id: string) {
    return this.request<void>(`/display/${id}`, {
      method: 'PUT',
    })
  }

  async removeFromDisplayQueue(id: string) {
    return this.request<void>(`/display/${id}`, {
      method: 'DELETE',
    })
  }

  async getDisplaySettings(eventId: string) {
    return this.request<{ welcome_message: string; display_duration: number; enable_sound: boolean }>(`/events/${eventId}/display/settings`)
  }

  // ==================== SCAN LOGS ====================

  async getScanLogs(eventId: string, params?: { limit?: number }) {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', params.limit.toString())
    
    return this.request<any[]>(`/events/${eventId}/scan-logs?${query}`)
  }

  async getScanLogStats(eventId: string) {
    return this.request<{ total: number; success: number; failed: number }>(`/events/${eventId}/scan-logs/stats`)
  }

  // ==================== ADMIN ====================

  async getAdminDashboard() {
    return this.request<PlatformStats>('/admin/dashboard')
  }

  async getAdminAnalytics() {
    return this.request<{
      tenants: number
      users: number
      events: number
      active_events: number
      participants: number
      checked_in: number
      total_checkins: number
    }>('/admin/analytics')
  }

  async getAdminTenants() {
    return this.request<Tenant[]>('/admin/tenants')
  }

  async getAdminTenantDetail(id: string) {
    return this.request<Tenant>(`/admin/tenants/${id}`)
  }

  async updateTenantStatus(id: string, status: string) {
    return this.request<Tenant>(`/admin/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async suspendTenant(id: string) {
    return this.request<Tenant>(`/admin/tenants/${id}/suspend`, {
      method: 'PUT',
    })
  }

  async activateTenant(id: string) {
    return this.request<Tenant>(`/admin/tenants/${id}/activate`, {
      method: 'PUT',
    })
  }

  async addCreditsToTenant(tenantId: string, amount: number, description?: string) {
    return this.request<any>(`/admin/tenants/${tenantId}/credits`, {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    })
  }

  async getAdminUsers() {
    return this.request<User[]>('/admin/users')
  }

  async getAdminUserDetail(id: string) {
    return this.request<User>(`/admin/users/${id}`)
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async banUser(id: string) {
    return this.request<User>(`/admin/users/${id}/ban`, {
      method: 'PUT',
    })
  }

  async setSuperAdmin(id: string, isSuperAdmin: boolean) {
    return this.request<User>(`/admin/users/${id}/super-admin`, {
      method: 'PUT',
      body: JSON.stringify({ is_super_admin: isSuperAdmin }),
    })
  }

  async getAdminBilling() {
    return this.request<{
      total_revenue: number
      total_credits_sold: number
      total_transactions: number
      active_tenants: number
    }>('/admin/billing')
  }

  async getAdminPayments() {
    return this.request<any[]>('/admin/payments')
  }

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

  // ==================== REGISTRATION (PUBLIC) ====================

  async registerParticipant(data: {
    event_id: string
    name: string
    email: string
    phone: string
    company?: string
    position?: string
    ticket_type_id?: string
  }) {
    return this.request<Participant>('/registration', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPublicEvent(eventId: string) {
    return this.request<Event>(`/public/events/${eventId}`)
  }

  async getPublicTicketTypes(eventId: string) {
    return this.request<TicketType[]>(`/public/events/${eventId}/ticket-types`)
  }

  // ==================== USER ====================

  async updateUserProfile(data: Partial<User>) {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export class for testing
export { ApiClient }
