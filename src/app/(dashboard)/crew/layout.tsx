'use client'

import { User } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard'
import { CREW_MENU, DASHBOARD_META } from '@/config/menu'

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout
      title="Crew Dashboard"
      description="Event Staff Dashboard"
      menuGroups={CREW_MENU}
      themeKey="crew"
      logo={<User className="h-6 w-6 text-white" />}
      logoTitle={DASHBOARD_META.crew.title}
      logoSubtitle={DASHBOARD_META.crew.subtitle}
      showCredit={false}
    >
      {children}
    </DashboardLayout>
  )
}
