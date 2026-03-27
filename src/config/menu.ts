import type { MenuGroup } from '@/components/dashboard/DashboardSidebar'
import {
  Activity,
  Building2,
  CreditCard,
  TrendingUp,
  Settings,
  LayoutDashboard,
  Calendar,
  Users,
  UtensilsCrossed,
  Utensils,
  FileText,
  CheckCircle,
  Monitor,
} from 'lucide-react'

// Super Admin Menu
export const SUPER_ADMIN_MENU: MenuGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { title: 'Dashboard', href: '/super-admin', icon: Activity },
      { title: 'Kelola EO', href: '/super-admin/tenants', icon: Building2 },
      { title: 'Billing', href: '/super-admin/billing', icon: CreditCard },
      { title: 'Analytics', href: '/super-admin/analytics', icon: TrendingUp },
      { title: 'Settings', href: '/super-admin/settings', icon: Settings },
    ],
  },
]

// EO Owner Menu - Updated per PRD
export const EO_OWNER_MENU: MenuGroup[] = [
  {
    label: 'Event Management',
    items: [
      { title: 'Dashboard', href: '/eo', icon: LayoutDashboard },
      { title: 'My Events', href: '/eo/events', icon: Calendar },
      { title: 'Participants', href: '/eo/participants', icon: Users },
    ],
  },
  {
    label: 'Settings',
    items: [
      { title: 'F&B Settings', href: '/eo/fnb-settings', icon: Utensils },
      { title: 'Team & Crew', href: '/eo/team', icon: Users },
      { title: 'Credits', href: '/eo/credits', icon: CreditCard },
      { title: 'Reports', href: '/eo/reports', icon: FileText },
      { title: 'Settings', href: '/eo/settings', icon: Settings },
    ],
  },
]

// Crew Menu
export const CREW_MENU: MenuGroup[] = [
  {
    label: 'Actions',
    items: [
      { title: 'Dashboard', href: '/crew', icon: Activity },
      { title: 'Check-in', href: '/crew/checkin', icon: CheckCircle },
      { title: 'F&B Claim', href: '/crew/claim', icon: UtensilsCrossed },
      { title: 'Display', href: '/crew/display', icon: Monitor },
    ],
  },
]

// Dashboard meta information
export const DASHBOARD_META = {
  superAdmin: {
    title: 'Super Admin',
    subtitle: 'Platform Management',
    description: 'Platform Owner Dashboard',
  },
  eo: {
    title: 'Eventify',
    subtitle: 'Event Management',
    description: 'Event Organizer Dashboard',
  },
  crew: {
    title: 'Panitia Panel',
    subtitle: 'Event Staff',
    description: 'Crew Dashboard',
  },
}

// Event categories
export const EVENT_CATEGORIES = [
  { value: 'conference', label: 'Conference' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'concert', label: 'Concert' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'festival', label: 'Festival' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'networking', label: 'Networking' },
  { value: 'other', label: 'Other' },
]

// Credit packages
export const CREDIT_PACKAGES = [
  { id: 'starter', name: 'Starter', credits: 500, price: 50000, bonus: 50, popular: false },
  { id: 'growth', name: 'Growth', credits: 2500, price: 225000, bonus: 250, popular: false },
  { id: 'business', name: 'Business', credits: 5000, price: 400000, bonus: 500, popular: true },
  { id: 'enterprise', name: 'Enterprise', credits: 25000, price: 1750000, bonus: 2500, popular: false },
]

// Credit usage costs
export const CREDIT_COSTS = {
  createEvent: 50,
  checkin: 1,
  fbClaim: 1,
  aiPhotoGeneration: 2,
}

// F&B defaults
export const FNBS_DEFAULTS = {
  maxFoodPerParticipant: 4,
  maxDrinkPerParticipant: 2,
  enableFood: true,
  enableDrink: true,
  multiBooth: true,
}

// Welcome bonus for new EO
export const WELCOME_BONUS = {
  balance: 500,
  bonus: 50,
}
