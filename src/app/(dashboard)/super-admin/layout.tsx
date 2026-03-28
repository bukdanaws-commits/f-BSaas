'use client'

import { ShieldCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard'
import { SUPER_ADMIN_MENU, DASHBOARD_META } from '@/config/menu'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout
      title="Super Admin Dashboard"
      description="Platform Owner Dashboard"
      menuGroups={SUPER_ADMIN_MENU}
      themeKey="superAdmin"
      logo={<ShieldCheck className="h-6 w-6 text-white" />}
      logoTitle={DASHBOARD_META.superAdmin.title}
      logoSubtitle={DASHBOARD_META.superAdmin.subtitle}
      showCredit={false}
    >
      {children}
    </DashboardLayout>
  )
}
