'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar, type MenuGroup, type SidebarTheme } from './DashboardSidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/mock-store'
import type { LucideIcon } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
  menuGroups: MenuGroup[]
  themeKey?: 'superAdmin' | 'eo' | 'crew'
  theme?: SidebarTheme
  logo: ReactNode
  logoTitle: string
  logoSubtitle?: string
  creditBalance?: {
    balance: number
    bonus: number
  }
  showCredit?: boolean
}

// Breadcrumb configuration
const BREADCRUMB_CONFIG: Record<string, { label: string }> = {
  // Super Admin
  '/super-admin': { label: 'Dashboard' },
  '/super-admin/tenants': { label: 'Kelola EO' },
  '/super-admin/billing': { label: 'Billing' },
  '/super-admin/analytics': { label: 'Analytics' },
  '/super-admin/settings': { label: 'Settings' },
  // EO
  '/eo': { label: 'Dashboard' },
  '/eo/events': { label: 'Events' },
  '/eo/participants': { label: 'Participants' },
  '/eo/fnb-settings': { label: 'F&B Settings' },
  '/eo/team': { label: 'Team' },
  '/eo/credits': { label: 'Credits' },
  '/eo/reports': { label: 'Reports' },
  '/eo/settings': { label: 'Settings' },
  // Crew
  '/crew': { label: 'Dashboard' },
  '/crew/checkin': { label: 'Check-in' },
  '/crew/claim': { label: 'F&B Claim' },
  '/crew/display': { label: 'Display' },
}

export function DashboardLayout({
  children,
  title,
  description,
  menuGroups,
  themeKey = 'eo',
  theme,
  logo,
  logoTitle,
  logoSubtitle,
  creditBalance,
  showCredit = false,
}: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, isAuthenticated, logout } = useAuthStore()

  // Role check - redirect to correct dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const role = currentUser.role
      let correctPath = '/eo' // default
      
      if (role === 'super_admin') {
        correctPath = '/super-admin'
      } else if (role === 'crew') {
        correctPath = '/crew'
      }
      
      // Redirect if on wrong dashboard
      if (!pathname.startsWith(correctPath) && pathname !== '/login') {
        router.push(correctPath)
      }
    } else if (!isAuthenticated && pathname !== '/login') {
      // Redirect to login if not authenticated
      router.push('/login')
    }
  }, [isAuthenticated, currentUser, pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Get breadcrumb
  const getBreadcrumb = () => {
    const config = BREADCRUMB_CONFIG[pathname]
    return config?.label || title
  }

  // Loading state
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-slate-100 dark:bg-slate-950">
        <DashboardSidebar
          menuGroups={menuGroups}
          themeKey={themeKey}
          theme={theme}
          logo={logo}
          title={logoTitle}
          subtitle={logoSubtitle}
          userInfo={{
            name: currentUser.user?.name || 'User',
            email: currentUser.user?.email,
            avatar: currentUser.user?.avatar_url,
            role: currentUser.role,
          }}
          creditBalance={showCredit ? creditBalance : undefined}
          onLogout={handleLogout}
        />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-lg font-semibold">
                    {getBreadcrumb()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex-1" />
            {description && (
              <p className="hidden md:block text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-white dark:bg-slate-900 px-4 lg:px-6 py-4 mt-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Eventify - SaaS Event Management</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Powered by</span>
                <a 
                  href="https://goopps.id/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-amber-500 hover:text-amber-600 transition-colors"
                >
                  Goopps.id
                </a>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
