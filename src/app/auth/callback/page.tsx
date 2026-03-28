'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setErrorMessage(searchParams.get('error_description') || error)
        return
      }

      if (!code) {
        setStatus('error')
        setErrorMessage('No authorization code received')
        return
      }

      try {
        // Exchange code with backend
        const result = await api.googleCallback(code)

        if (result.success && result.data?.token) {
          // Store JWT token
          localStorage.setItem('auth_token', result.data.token)
          localStorage.setItem('user', JSON.stringify(result.data.user))

          // Remove demo role if exists
          localStorage.removeItem('demo_role')

          setStatus('success')

          toast({
            title: 'Login Successful',
            description: `Welcome, ${result.data.user.name || result.data.user.email}!`,
          })

          // Redirect based on role
          setTimeout(() => {
            const user = result.data.user
            if (user.is_super_admin) {
              router.push('/super-admin')
            } else if (user.role === 'crew') {
              router.push('/crew')
            } else {
              router.push('/eo')
            }
          }, 1000)
        } else {
          setStatus('error')
          setErrorMessage(result.error || 'Failed to authenticate')
        }
      } catch (err) {
        setStatus('error')
        setErrorMessage('An unexpected error occurred')
        console.error('Auth callback error:', err)
      }
    }

    handleCallback()
  }, [searchParams, router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md text-center">
        {status === 'processing' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#47b2e4]" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Authenticating...
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we verify your identity
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Login Successful!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Authentication Failed
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-[#47b2e4] text-white rounded-lg hover:bg-[#37517e] transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
