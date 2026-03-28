'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Helper to subscribe to nothing (for useSyncExternalStore)
const emptySubscribe = () => () => {}

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // Use useSyncExternalStore to safely check if we're on the client
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  useEffect(() => {
    if (!mounted) return
    
    // Small delay to ensure hydration is complete
    const timer = setTimeout(() => {
      const token = localStorage.getItem('auth_token')
      const demoRole = localStorage.getItem('demo_role')
      
      if (token) {
        // User is authenticated
        if (demoRole) {
          // Demo mode - redirect based on role
          if (demoRole === 'super_admin') {
            router.push('/super-admin')
          } else if (demoRole === 'crew') {
            router.push('/crew')
          } else {
            router.push('/eo')
          }
        } else {
          // Real auth - default to EO dashboard
          // Could verify with API here if needed
          router.push('/eo')
        }
      } else {
        // Not authenticated, redirect to login
        router.push('/login')
      }
      setLoading(false)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [mounted, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#47b2e4]" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
