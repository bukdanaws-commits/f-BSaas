// =====================================
// AUTH STORE - Zustand State Management
// Connected to Golang Backend API
// =====================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, User, Tenant, CreditWallet } from '@/lib/api-client'

// =====================================
// TYPES
// =====================================
export type UserRole = 'super_admin' | 'owner' | 'admin' | 'crew'

export interface CurrentUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  is_super_admin: boolean
  role: UserRole
  tenant?: Tenant
  wallet?: CreditWallet
}

// =====================================
// AUTH STORE
// =====================================
interface AuthState {
  currentUser: CurrentUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  fetchCurrentUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      loginWithGoogle: async (googleToken: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await api.loginWithGoogle(googleToken)
          
          if (response.success && response.data) {
            const { token, user } = response.data
            
            set({
              currentUser: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url,
                is_super_admin: user.is_super_admin,
                role: user.role as UserRole,
                tenant: user.tenant,
                wallet: user.wallet,
              },
              isAuthenticated: true,
              isLoading: false,
            })
            
            return { success: true, message: 'Login successful' }
          } else {
            set({ 
              isLoading: false, 
              error: response.error || 'Login failed' 
            })
            return { success: false, message: response.error || 'Login failed' }
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Network error' 
          })
          return { success: false, message: 'Network error' }
        }
      },

      logout: () => {
        api.logout()
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
        })
      },

      fetchCurrentUser: async () => {
        const token = api.getToken()
        if (!token) {
          set({ isAuthenticated: false, currentUser: null })
          return
        }

        set({ isLoading: true })
        
        try {
          const response = await api.getCurrentUser()
          
          if (response.success && response.data) {
            const user = response.data
            set({
              currentUser: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url,
                is_super_admin: user.is_super_admin,
                role: user.role as UserRole,
                tenant: user.tenant,
                wallet: user.wallet,
              },
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Token invalid, logout
            api.logout()
            set({
              currentUser: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          set({ 
            isLoading: false,
            currentUser: null,
            isAuthenticated: false,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist basic info, token is managed by api client
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // On app load, verify token is still valid
        if (state?.isAuthenticated) {
          state.fetchCurrentUser()
        }
      },
    }
  )
)

// =====================================
// SELECTORS
// =====================================
export const useUser = () => useAuthStore((state) => state.currentUser)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsLoading = () => useAuthStore((state) => state.isLoading)
export const useUserRole = () => useAuthStore((state) => state.currentUser?.role)
export const useTenant = () => useAuthStore((state) => state.currentUser?.tenant)
export const useWallet = () => useAuthStore((state) => state.currentUser?.wallet)
