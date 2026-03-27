'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api-client'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, isAuthenticated, fetchCurrentUser } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      const token = api.getToken()
      if (!token) {
        router.push('/login')
        return
      }
      
      if (!isAuthenticated) {
        await fetchCurrentUser()
      }
    }
    init()
  }, [fetchCurrentUser, isAuthenticated, router])

  // Check role access
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const path = pathname.split('/')[1]
      
      if (path === 'super-admin' && currentUser.role !== 'super_admin') {
        // Redirect to correct dashboard
        if (currentUser.role === 'crew') {
          router.push('/crew')
        } else {
          router.push('/eo')
        }
      }
      
      if (path === 'eo' && (currentUser.role !== 'owner' && currentUser.role !== 'admin')) {
        if (currentUser.role === 'super_admin') {
          router.push('/super-admin')
        } else if (currentUser.role === 'crew') {
          router.push('/crew')
        }
      }
      
      if (path === 'crew' && currentUser.role !== 'crew') {
        if (currentUser.role === 'super_admin') {
          router.push('/super-admin')
        } else {
          router.push('/eo')
        }
      }
    }
  }, [isAuthenticated, currentUser, pathname, router])

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#47b2e4]" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
