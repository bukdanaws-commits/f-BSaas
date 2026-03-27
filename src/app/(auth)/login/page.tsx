'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Shield,
  Building2,
  Users,
  Loader2,
  Database,
  WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/mock-store'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const { demoLogin } = useAuthStore()
  const [demoLoading, setDemoLoading] = useState<'super_admin' | 'owner' | 'crew' | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'mock'>('checking')

  // Check if using mock mode on mount
  useEffect(() => {
    // In development, we use mock data by default
    // Set to mock mode immediately since there's no backend API
    const timer = setTimeout(() => {
      setConnectionStatus('mock')
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Handle demo login
  const handleDemoLogin = useCallback(async (role: 'super_admin' | 'owner' | 'crew') => {
    setDemoLoading(role)
    
    try {
      demoLogin(role)
      setDemoLoading(null)
      
      // Redirect based on role
      if (role === 'super_admin') {
        router.push('/super-admin')
      } else if (role === 'crew') {
        router.push('/crew')
      } else {
        router.push('/eo')
      }
    } catch (err) {
      setDemoLoading(null)
      console.error('Demo login error:', err)
    }
  }, [demoLogin, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#37517e] to-[#47b2e4] mb-4 shadow-xl"
          >
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Eventify</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">SaaS Event Management Platform</p>
        </div>

        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">Data Mode</span>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === 'checking' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  <span className="text-slate-500">Checking...</span>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-600">API Connected</span>
                </>
              )}
              {connectionStatus === 'mock' && (
                <>
                  <WifiOff className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600">Demo Mode (Mock Data)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#37517e] to-[#47b2e4]" />
          <CardContent className="pt-8 pb-8 px-6">
            {/* Demo Mode Notice */}
            {connectionStatus === 'mock' && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                  🎭 <strong>Demo Mode:</strong> Login dengan role berbeda untuk menjelajahi dashboard
                </p>
              </div>
            )}

            {/* Demo Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => handleDemoLogin('super_admin')} 
                  variant="outline" 
                  disabled={demoLoading !== null}
                  className="w-full h-auto flex-col py-4 border-2 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all"
                >
                  {demoLoading === 'super_admin' ? (
                    <Loader2 className="h-6 w-6 mb-2 animate-spin text-amber-500" />
                  ) : (
                    <Shield className="h-6 w-6 mb-2 text-amber-500" />
                  )}
                  <span className="text-xs font-medium">Super Admin</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Platform Owner</span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => handleDemoLogin('owner')} 
                  variant="outline" 
                  disabled={demoLoading !== null}
                  className="w-full h-auto flex-col py-4 border-2 hover:border-[#47b2e4] hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-all"
                >
                  {demoLoading === 'owner' ? (
                    <Loader2 className="h-6 w-6 mb-2 animate-spin text-[#47b2e4]" />
                  ) : (
                    <Building2 className="h-6 w-6 mb-2 text-[#47b2e4]" />
                  )}
                  <span className="text-xs font-medium">EO Owner</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Event Organizer</span>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => handleDemoLogin('crew')} 
                  variant="outline" 
                  disabled={demoLoading !== null}
                  className="w-full h-auto flex-col py-4 border-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                >
                  {demoLoading === 'crew' ? (
                    <Loader2 className="h-6 w-6 mb-2 animate-spin text-purple-500" />
                  ) : (
                    <Users className="h-6 w-6 mb-2 text-purple-500" />
                  )}
                  <span className="text-xs font-medium">Crew</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Event Staff</span>
                </Button>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-3 text-muted-foreground">
                  production
                </span>
              </div>
            </div>

            {/* Google OAuth Button - Disabled in mock mode */}
            <Button 
              disabled={connectionStatus === 'mock'}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium h-12 border shadow-sm disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Info */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              {connectionStatus === 'mock' 
                ? 'Demo mode menggunakan data mock. Google OAuth tersedia saat API terhubung.'
                : 'Login dengan Google untuk production'}
            </p>
          </CardContent>
        </Card>

        {/* Powered By */}
        <div className="text-center mt-6 pt-4">
          <p className="text-sm text-slate-500 mb-1">Powered by</p>
          <a 
            href="https://goopps.id/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-lg font-semibold text-[#47b2e4] hover:text-[#37517e] transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            goopps.id
          </a>
        </div>
      </motion.div>
    </div>
  )
}
