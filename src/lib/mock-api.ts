// =====================================
// MOCK API FUNCTIONS
// Simulate Supabase queries for development
// =====================================

import { 
  mockData, 
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
} from './mock-data'
import { User, Tenant, Membership, CreditWallet, CreditTransaction, Event, EventStaff, TicketType, Participant, Checkin, Booth, MenuCategory, MenuItem, Claim, DisplayQueue, ScanLog } from '@/types/database'

// =====================================
// TYPE DEFINITIONS
// =====================================
export type UserRole = 'super_admin' | 'owner' | 'admin' | 'crew'

export interface UserWithMembership {
  user: User
  membership?: Membership
  tenant?: Tenant
  role: UserRole
}

export interface EventWithStats {
  event: Event
  participantCount: number
  checkedInCount: number
  claimCount: number
  ticketTypes: TicketType[]
}

export interface ParticipantWithDetails {
  participant: Participant
  ticketType?: TicketType
  checkin?: Checkin
  claims: Claim[]
}

// =====================================
// AUTH & USER FUNCTIONS
// =====================================

/**
 * Get user by email (simulates Google OAuth login)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return mockUsers.find(u => u.email === email) || null
}

/**
 * Get user with membership and role info
 */
export async function getUserWithMembership(userId: string): Promise<UserWithMembership | null> {
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return null

  // Check if super admin
  if (user.is_super_admin) {
    return {
      user,
      role: 'super_admin'
    }
  }

  // Find membership
  const membership = mockMemberships.find(m => m.user_id === userId)
  if (!membership) {
    return {
      user,
      role: 'owner' // Default to owner for new users
    }
  }

  const tenant = mockTenants.find(t => t.id === membership.tenant_id)
  
  return {
    user,
    membership,
    tenant,
    role: membership.role as UserRole
  }
}

/**
 * Create new user with tenant and wallet (simulates registration)
 */
export async function createNewUser(userData: {
  email: string
  name: string
  avatarUrl?: string
  googleId?: string
}): Promise<UserWithMembership> {
  const newUserId = `user-${Date.now()}`
  const newTenantId = `tenant-${Date.now()}`
  const newWalletId = `wallet-${Date.now()}`
  const newMembershipId = `member-${Date.now()}`

  // Create user
  const newUser: User = {
    id: newUserId,
    email: userData.email,
    name: userData.name,
    avatar_url: userData.avatarUrl || null,
    google_id: userData.googleId || null,
    is_super_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Create tenant
  const newTenant: Tenant = {
    id: newTenantId,
    name: `${userData.name}'s Organization`,
    slug: null,
    owner_id: newUserId,
    status: 'active',
    verified_at: new Date().toISOString(),
    phone: null,
    address: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Create wallet with welcome bonus
  const newWallet: CreditWallet = {
    id: newWalletId,
    tenant_id: newTenantId,
    balance: 500,
    bonus_balance: 50,
    updated_at: new Date().toISOString()
  }

  // Create membership
  const newMembership: Membership = {
    id: newMembershipId,
    user_id: newUserId,
    tenant_id: newTenantId,
    role: 'owner',
    created_at: new Date().toISOString()
  }

  // Create credit transaction for welcome bonus
  const welcomeTransaction: CreditTransaction = {
    id: `txn-${Date.now()}`,
    tenant_id: newTenantId,
    type: 'bonus',
    amount: 50,
    reference_type: 'welcome_bonus',
    reference_id: null,
    description: 'Welcome bonus for new tenant',
    created_at: new Date().toISOString()
  }

  // Add to mock data (in real app, this would be database insert)
  mockUsers.push(newUser)
  mockTenants.push(newTenant)
  mockMemberships.push(newMembership)
  mockCreditWallets.push(newWallet)
  mockCreditTransactions.push(welcomeTransaction)

  return {
    user: newUser,
    membership: newMembership,
    tenant: newTenant,
    role: 'owner'
  }
}

// =====================================
// TENANT FUNCTIONS
// =====================================

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  return mockTenants.find(t => t.id === tenantId) || null
}

/**
 * Get all tenants (for super admin)
 */
export async function getAllTenants(): Promise<Tenant[]> {
  return mockTenants
}

/**
 * Get tenant credit wallet
 */
export async function getTenantWallet(tenantId: string): Promise<CreditWallet | null> {
  return mockCreditWallets.find(w => w.tenant_id === tenantId) || null
}

/**
 * Get tenant credit transactions
 */
export async function getTenantTransactions(tenantId: string, limit = 10): Promise<CreditTransaction[]> {
  return mockCreditTransactions
    .filter(t => t.tenant_id === tenantId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}

// =====================================
// EVENT FUNCTIONS
// =====================================

/**
 * Get events by tenant ID
 */
export async function getEventsByTenant(tenantId: string): Promise<Event[]> {
  return mockEvents.filter(e => e.tenant_id === tenantId)
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  return mockEvents.find(e => e.id === eventId) || null
}

/**
 * Get event with stats
 */
export async function getEventWithStats(eventId: string): Promise<EventWithStats | null> {
  const event = mockEvents.find(e => e.id === eventId)
  if (!event) return null

  const participants = mockParticipants.filter(p => p.event_id === eventId)
  const ticketTypes = mockTicketTypes.filter(t => t.event_id === eventId)
  const claims = mockClaims.filter(c => c.event_id === eventId)

  return {
    event,
    participantCount: participants.length,
    checkedInCount: participants.filter(p => p.is_checked_in).length,
    claimCount: claims.length,
    ticketTypes
  }
}

/**
 * Get all events (for super admin)
 */
export async function getAllEvents(): Promise<Event[]> {
  return mockEvents
}

/**
 * Get events assigned to crew member
 */
export async function getEventsByCrew(userId: string): Promise<Event[]> {
  const staffAssignments = mockEventStaff.filter(s => s.user_id === userId)
  const eventIds = staffAssignments.map(s => s.event_id)
  return mockEvents.filter(e => eventIds.includes(e.id))
}

// =====================================
// PARTICIPANT FUNCTIONS
// =====================================

/**
 * Get participants by event ID
 */
export async function getParticipantsByEvent(eventId: string): Promise<Participant[]> {
  return mockParticipants.filter(p => p.event_id === eventId)
}

/**
 * Get participant by QR code
 */
export async function getParticipantByQrCode(qrCode: string): Promise<Participant | null> {
  return mockParticipants.find(p => p.qr_code === qrCode) || null
}

/**
 * Get participant with details
 */
export async function getParticipantWithDetails(participantId: string): Promise<ParticipantWithDetails | null> {
  const participant = mockParticipants.find(p => p.id === participantId)
  if (!participant) return null

  const ticketType = mockTicketTypes.find(t => t.id === participant.ticket_type_id)
  const checkin = mockCheckins.find(c => c.participant_id === participantId)
  const claims = mockClaims.filter(c => c.participant_id === participantId)

  return {
    participant,
    ticketType,
    checkin,
    claims
  }
}

/**
 * Check-in participant
 */
export async function checkinParticipant(
  participantId: string, 
  operatorId: string, 
  deskNumber: number
): Promise<{ success: boolean; message: string; participant?: Participant }> {
  const participant = mockParticipants.find(p => p.id === participantId)
  
  if (!participant) {
    return { success: false, message: 'Participant not found' }
  }

  if (participant.is_checked_in) {
    return { success: false, message: 'Already checked in' }
  }

  if (participant.is_blacklisted) {
    return { success: false, message: 'Participant is blacklisted' }
  }

  // Update participant
  participant.is_checked_in = true
  participant.checked_in_at = new Date().toISOString()
  participant.checkin_count += 1

  // Create checkin record
  const newCheckin: Checkin = {
    id: `checkin-${Date.now()}`,
    event_id: participant.event_id,
    participant_id: participantId,
    operator_id: operatorId,
    desk_number: deskNumber,
    checked_in_at: new Date().toISOString()
  }
  mockCheckins.push(newCheckin)

  // Create display queue entry
  const newDisplay: DisplayQueue = {
    id: `display-${Date.now()}`,
    event_id: participant.event_id,
    participant_id: participantId,
    name: participant.name,
    photo_url: participant.ai_photo_url || participant.original_photo_url,
    is_displayed: false,
    created_at: new Date().toISOString()
  }
  mockDisplayQueue.push(newDisplay)

  // Create scan log
  const newScanLog: ScanLog = {
    id: `scan-${Date.now()}`,
    tenant_id: participant.tenant_id,
    event_id: participant.event_id,
    participant_id: participantId,
    type: 'checkin',
    result: 'success',
    device: `Desk-${deskNumber}`,
    created_at: new Date().toISOString()
  }
  mockScanLogs.push(newScanLog)

  return { 
    success: true, 
    message: 'Check-in successful',
    participant 
  }
}

// =====================================
// F&B FUNCTIONS
// =====================================

/**
 * Get booths by event ID
 */
export async function getBoothsByEvent(eventId: string): Promise<Booth[]> {
  return mockBooths.filter(b => b.event_id === eventId)
}

/**
 * Get menu categories by event ID
 */
export async function getMenuCategoriesByEvent(eventId: string): Promise<MenuCategory[]> {
  return mockMenuCategories.filter(c => c.event_id === eventId)
}

/**
 * Get menu items by event ID
 */
export async function getMenuItemsByEvent(eventId: string): Promise<MenuItem[]> {
  return mockMenuItems.filter(m => m.event_id === eventId)
}

/**
 * Get menu items by category
 */
export async function getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
  return mockMenuItems.filter(m => m.category_id === categoryId)
}

/**
 * Claim F&B item
 */
export async function claimMenuItem(
  participantId: string,
  menuItemId: string,
  boothId?: string
): Promise<{ success: boolean; message: string; claim?: Claim }> {
  const participant = mockParticipants.find(p => p.id === participantId)
  const menuItem = mockMenuItems.find(m => m.id === menuItemId)

  if (!participant) {
    return { success: false, message: 'Participant not found' }
  }

  if (!menuItem) {
    return { success: false, message: 'Menu item not found' }
  }

  // Check if participant is checked in
  if (!participant.is_checked_in) {
    return { success: false, message: 'Participant must check-in first' }
  }

  // Check stock
  if (menuItem.stock <= 0) {
    return { success: false, message: 'Item out of stock' }
  }

  // Get category to determine if food or drink
  const category = mockMenuCategories.find(c => c.id === menuItem.category_id)
  const isFood = category?.type === 'food'
  const isDrink = category?.type === 'drink'

  // Check claim limits
  if (isFood && participant.food_claims >= participant.max_food_claims) {
    return { success: false, message: `Maximum food claims (${participant.max_food_claims}) reached` }
  }

  if (isDrink && participant.drink_claims >= participant.max_drink_claims) {
    return { success: false, message: `Maximum drink claims (${participant.max_drink_claims}) reached` }
  }

  // Update participant claims
  if (isFood) {
    participant.food_claims += 1
  }
  if (isDrink) {
    participant.drink_claims += 1
  }

  // Update stock
  menuItem.stock -= 1

  // Create claim record
  const newClaim: Claim = {
    id: `claim-${Date.now()}`,
    event_id: participant.event_id,
    participant_id: participantId,
    menu_item_id: menuItemId,
    booth_id: boothId || null,
    claimed_at: new Date().toISOString()
  }
  mockClaims.push(newClaim)

  // Create scan log
  const newScanLog: ScanLog = {
    id: `scan-${Date.now()}`,
    tenant_id: participant.tenant_id,
    event_id: participant.event_id,
    participant_id: participantId,
    type: 'claim',
    result: 'success',
    device: boothId ? `Booth-${boothId}` : 'Unknown',
    created_at: new Date().toISOString()
  }
  mockScanLogs.push(newScanLog)

  return {
    success: true,
    message: `${menuItem.name} claimed successfully`,
    claim: newClaim
  }
}

// =====================================
// DISPLAY FUNCTIONS
// =====================================

/**
 * Get pending display queue
 */
export async function getPendingDisplayQueue(eventId: string): Promise<DisplayQueue[]> {
  return mockDisplayQueue
    .filter(d => d.event_id === eventId && !d.is_displayed)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

/**
 * Mark display as shown
 */
export async function markDisplayShown(displayId: string): Promise<void> {
  const display = mockDisplayQueue.find(d => d.id === displayId)
  if (display) {
    display.is_displayed = true
  }
}

// =====================================
// DASHBOARD STATS FUNCTIONS
// =====================================

export interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalParticipants: number
  totalCheckIns: number
  totalClaims: number
  credits: {
    balance: number
    bonusBalance: number
    total: number
  }
}

/**
 * Get dashboard stats for EO Owner
 */
export async function getEODashboardStats(tenantId: string): Promise<DashboardStats> {
  const events = mockEvents.filter(e => e.tenant_id === tenantId)
  const participants = mockParticipants.filter(p => p.tenant_id === tenantId)
  const checkins = mockCheckins.filter(c => 
    events.some(e => e.id === c.event_id)
  )
  const claims = mockClaims.filter(c => 
    events.some(e => e.id === c.event_id)
  )
  const wallet = mockCreditWallets.find(w => w.tenant_id === tenantId)

  return {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'active').length,
    totalParticipants: participants.length,
    totalCheckIns: checkins.length,
    totalClaims: claims.length,
    credits: {
      balance: wallet?.balance || 0,
      bonusBalance: wallet?.bonus_balance || 0,
      total: (wallet?.balance || 0) + (wallet?.bonus_balance || 0)
    }
  }
}

/**
 * Get dashboard stats for Super Admin
 */
export async function getSuperAdminDashboardStats(): Promise<{
  totalTenants: number
  activeTenants: number
  totalEvents: number
  totalParticipants: number
  totalRevenue: number
}> {
  return {
    totalTenants: mockTenants.length,
    activeTenants: mockTenants.filter(t => t.status === 'active').length,
    totalEvents: mockEvents.length,
    totalParticipants: mockParticipants.length,
    totalRevenue: mockCreditTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0)
  }
}

/**
 * Get dashboard stats for Crew
 */
export async function getCrewDashboardStats(userId: string, eventId?: string): Promise<{
  events: Event[]
  checkInsToday: number
  claimsToday: number
}> {
  const events = await getEventsByCrew(userId)
  
  let checkIns = mockCheckins
  let claims = mockClaims
  
  if (eventId) {
    checkIns = checkIns.filter(c => c.event_id === eventId)
    claims = claims.filter(c => c.event_id === eventId)
  }

  const today = new Date().toDateString()
  const checkInsToday = checkIns.filter(c => 
    new Date(c.checked_in_at).toDateString() === today
  ).length
  const claimsToday = claims.filter(c => 
    new Date(c.claimed_at).toDateString() === today
  ).length

  return {
    events,
    checkInsToday,
    claimsToday
  }
}

// =====================================
// CREW MANAGEMENT FUNCTIONS
// =====================================

/**
 * Get crew members by tenant ID
 */
export async function getCrewByTenant(tenantId: string): Promise<(Membership & { user: User })[]> {
  const memberships = mockMemberships.filter(m => m.tenant_id === tenantId)
  return memberships.map(m => ({
    ...m,
    user: mockUsers.find(u => u.id === m.user_id)!
  }))
}

/**
 * Invite crew member
 */
export async function inviteCrew(
  tenantId: string,
  email: string,
  name: string,
  password: string, // In real app, this would be hashed
  role: 'admin' | 'crew' = 'crew'
): Promise<{ success: boolean; message: string; user?: User }> {
  // Check if email already exists
  const existingUser = mockUsers.find(u => u.email === email)
  if (existingUser) {
    return { success: false, message: 'Email already registered' }
  }

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    avatar_url: null,
    google_id: null,
    is_super_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Create membership
  const newMembership: Membership = {
    id: `member-${Date.now()}`,
    user_id: newUser.id,
    tenant_id: tenantId,
    role,
    created_at: new Date().toISOString()
  }

  mockUsers.push(newUser)
  mockMemberships.push(newMembership)

  return {
    success: true,
    message: 'Crew member invited successfully',
    user: newUser
  }
}

/**
 * Assign crew to event
 */
export async function assignCrewToEvent(
  eventId: string,
  userId: string,
  role: 'admin' | 'crew' = 'crew'
): Promise<{ success: boolean; message: string }> {
  // Check if already assigned
  const existing = mockEventStaff.find(
    s => s.event_id === eventId && s.user_id === userId
  )
  if (existing) {
    return { success: false, message: 'Crew already assigned to this event' }
  }

  const newStaff: EventStaff = {
    id: `staff-${Date.now()}`,
    event_id: eventId,
    user_id: userId,
    role,
    created_at: new Date().toISOString()
  }

  mockEventStaff.push(newStaff)
  return { success: true, message: 'Crew assigned to event' }
}

// =====================================
// TICKET TYPE FUNCTIONS
// =====================================

/**
 * Get ticket types by event ID
 */
export async function getTicketTypesByEvent(eventId: string): Promise<TicketType[]> {
  return mockTicketTypes.filter(t => t.event_id === eventId)
}

/**
 * Create ticket type
 */
export async function createTicketType(
  eventId: string,
  data: {
    name: string
    price?: number
    quota?: number
    features?: Record<string, unknown>
  }
): Promise<TicketType> {
  const newTicketType: TicketType = {
    id: `ticket-${Date.now()}`,
    event_id: eventId,
    name: data.name,
    price: data.price || 0,
    quota: data.quota || 0,
    features: data.features || null
  }

  mockTicketTypes.push(newTicketType)
  return newTicketType
}
