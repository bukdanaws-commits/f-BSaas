'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const loginWithGoogle = useCallback(() => {
    signIn('google', { callbackUrl: '/' })
  }, [])

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' })
  }, [])

  const refreshSession = useCallback(async () => {
    await update()
    router.refresh()
  }, [update, router])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    loginWithGoogle,
    logout,
    refreshSession,
  }
}
