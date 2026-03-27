'use client'

import { Ticket } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard'
import { EO_OWNER_MENU, DASHBOARD_META } from '@/config/menu'
import { useTenantWallet } from '@/stores/mock-store'

export default function EOLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const wallet = useTenantWallet()

  return (
    <DashboardLayout
      title="EO Dashboard"
      description="Event Organizer Dashboard"
      menuGroups={EO_OWNER_MENU}
      themeKey="eo"
      logo={<Ticket className="h-6 w-6 text-white" />}
      logoTitle={DASHBOARD_META.eo.title}
      logoSubtitle={DASHBOARD_META.eo.subtitle}
      creditBalance={wallet ? {
        balance: wallet.balance,
        bonus: wallet.bonus_balance,
      } : undefined}
      showCredit={true}
    >
      {children}
    </DashboardLayout>
  )
}
