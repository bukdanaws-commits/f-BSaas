'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface MenuItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string | number
  disabled?: boolean
}

export interface MenuGroup {
  label?: string
  items: MenuItem[]
}

export interface SidebarTheme {
  bg: string
  headerBg: string
  activeBg: string
  activeText: string
  hoverBg: string
  text: string
  textMuted: string
  border: string
  gradientFrom: string
  gradientTo: string
  logoBg: string
  creditBg: string
}

export const SIDEBAR_THEMES: Record<string, SidebarTheme> = {
  superAdmin: {
    bg: 'bg-slate-900',
    headerBg: 'bg-slate-900',
    activeBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
    activeText: 'text-white',
    hoverBg: 'hover:bg-slate-800',
    text: 'text-slate-300',
    textMuted: 'text-slate-400',
    border: 'border-slate-700',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    logoBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    creditBg: 'bg-amber-500/10',
  },
  eo: {
    bg: 'bg-slate-900/95 backdrop-blur-xl',
    headerBg: 'bg-slate-900/95',
    activeBg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30',
    activeText: 'text-white',
    hoverBg: 'hover:bg-slate-800/50',
    text: 'text-slate-400',
    textMuted: 'text-slate-400',
    border: 'border-slate-700/50',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    logoBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    creditBg: 'bg-emerald-500/10',
  },
  crew: {
    bg: 'bg-gradient-to-b from-[#37517e] to-[#2a3d5e]',
    headerBg: 'bg-gradient-to-b from-[#37517e] to-[#2a3d5e]',
    activeBg: 'bg-gradient-to-r from-[#47b2e4] to-[#37517e]',
    activeText: 'text-white',
    hoverBg: 'hover:bg-white/10',
    text: 'text-slate-200',
    textMuted: 'text-slate-300',
    border: 'border-white/10',
    gradientFrom: 'from-[#47b2e4]',
    gradientTo: 'to-[#37517e]',
    logoBg: 'bg-gradient-to-br from-[#47b2e4] to-[#37517e]',
    creditBg: 'bg-[#47b2e4]/10',
  },
}

interface UserInfo {
  name: string
  email?: string
  avatar?: string
  role?: string
}

interface DashboardSidebarProps {
  menuGroups: MenuGroup[]
  theme?: SidebarTheme
  themeKey?: 'superAdmin' | 'eo' | 'crew'
  logo: ReactNode
  title: string
  subtitle?: string
  userInfo?: UserInfo
  creditBalance?: {
    balance: number
    bonus: number
  }
  onLogout?: () => void
}

export function DashboardSidebar({
  menuGroups,
  theme: themeProp,
  themeKey = 'eo',
  logo,
  title,
  subtitle,
  userInfo,
  creditBalance,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const theme = themeProp || SIDEBAR_THEMES[themeKey]
  const isCollapsed = state === 'collapsed'

  const isActive = (href: string) => {
    // Handle root dashboard routes
    const dashboardPaths = ['/super-admin', '/eo', '/crew']
    if (dashboardPaths.includes(href)) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar
      collapsible="icon"
      className={cn('border-r', theme.border, theme.bg)}
    >
      {/* Header */}
      <SidebarHeader className={cn('border-b p-4', theme.border)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn('p-2.5 rounded-xl shadow-lg flex-shrink-0', theme.logoBg)}>
              {logo}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-lg text-white truncate">{title}</h1>
                {subtitle && (
                  <p className={cn('text-xs truncate', theme.textMuted)}>{subtitle}</p>
                )}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn('h-8 w-8 text-white/70 hover:text-white hover:bg-white/10')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Credit Balance - Only show if provided */}
        {creditBalance && !isCollapsed && (
          <div className={cn('mt-4 p-4 rounded-xl border', theme.creditBg, theme.border)}>
            <div className={cn('text-xs', theme.textMuted)}>Credit Balance</div>
            <div className="text-2xl font-bold text-emerald-400">
              {(creditBalance.balance + creditBalance.bonus).toLocaleString()}
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className={theme.textMuted}>
                Main: <span className="text-white">{creditBalance.balance.toLocaleString()}</span>
              </span>
              <span className={theme.textMuted}>
                Bonus: <span className="text-teal-400">{creditBalance.bonus.toLocaleString()}</span>
              </span>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <ScrollArea className="h-full">
          {menuGroups.map((group, groupIndex) => (
            <SidebarGroup key={groupIndex}>
              {group.label && (
                <SidebarGroupLabel className={theme.textMuted}>
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={isCollapsed ? item.title : undefined}
                          disabled={item.disabled}
                          className={cn(
                            'transition-all duration-200',
                            active
                              ? cn(theme.activeBg, theme.activeText, 'shadow-lg')
                              : cn(theme.text, theme.hoverBg, 'hover:text-white'),
                            isCollapsed && 'justify-center'
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span className="font-medium truncate">{item.title}</span>
                                {item.badge !== undefined && (
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      'ml-auto text-[10px] h-5',
                                      active ? 'bg-white/20' : 'bg-white/10'
                                    )}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className={cn('border-t p-3 space-y-2', theme.border)}>
        {/* User Info */}
        {userInfo && !isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9 border-2 border-white/10">
              <AvatarImage src={userInfo.avatar} />
              <AvatarFallback className={cn('text-white text-sm', theme.logoBg)}>
                {userInfo.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userInfo.name}</p>
              {userInfo.email && (
                <p className={cn('text-xs truncate', theme.textMuted)}>{userInfo.email}</p>
              )}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            'w-full text-red-400 hover:text-red-300 hover:bg-red-500/10',
            isCollapsed ? 'justify-center px-2' : 'justify-start gap-2'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </Button>

        {/* Expand Button (when collapsed) */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn('w-full text-white/70 hover:text-white hover:bg-white/10')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
