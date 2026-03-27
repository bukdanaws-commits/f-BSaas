'use client'

import { useState, useCallback } from 'react'
import { Utensils, Coffee, AlertCircle, CheckCircle, User, RefreshCw, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ClaimResult {
  success: boolean
  message: string
  participant?: {
    id: string
    name: string
    email: string
    foodClaims: number
    drinkClaims: number
    maxFoodClaims: number
    maxDrinkClaims: number
  }
}

export default function ClaimPage() {
  const [qrCode, setQrCode] = useState('')
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [claimType, setClaimType] = useState<'food' | 'drink'>('food')
  const { toast } = useToast()

  const processClaim = useCallback(async (qr: string, type: 'food' | 'drink') => {
    if (!qr.trim()) return
    
    setIsProcessing(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result: ClaimResult = {
        success: true,
        message: `Claim ${type} berhasil!`,
        participant: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          foodClaims: type === 'food' ? 2 : 1,
          drinkClaims: type === 'drink' ? 1 : 0,
          maxFoodClaims: 4,
          maxDrinkClaims: 2,
        }
      }
      
      setClaimResult(result)
      toast({
        title: `Claim ${type} Berhasil!`,
        description: result.message,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memproses claim',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [toast])

  const handleClaim = () => {
    if (qrCode.trim()) {
      processClaim(qrCode.trim(), claimType)
    }
  }

  const clearResult = () => {
    setClaimResult(null)
    setQrCode('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Claim Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Claim Makanan & Minuman
          </CardTitle>
          <CardDescription>Proses klaim F&B peserta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Claim Type Selection */}
          <div className="space-y-3">
            <Label>Jenis Claim</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setClaimType('food')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                  claimType === 'food'
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-orange-300"
                )}
              >
                <Utensils className="h-5 w-5" />
                <span className="font-medium">Food</span>
              </button>
              <button
                onClick={() => setClaimType('drink')}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                  claimType === 'drink'
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-slate-200 dark:border-slate-700 hover:border-cyan-300"
                )}
              >
                <Coffee className="h-5 w-5" />
                <span className="font-medium">Drink</span>
              </button>
            </div>
          </div>

          {/* QR Code Input */}
          <div className="space-y-3">
            <Label>QR Code Peserta</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Scan atau input QR code..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
                className="flex-1"
              />
              <Button onClick={handleClaim} disabled={isProcessing || !qrCode.trim()}>
                {isProcessing ? 'Processing...' : 'Claim'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {claimResult ? (
              claimResult.success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <User className="h-5 w-5" />
            )}
            Hasil Claim
          </CardTitle>
        </CardHeader>
        <CardContent>
          {claimResult ? (
            <div className="space-y-4">
              {claimResult.participant && (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                      {claimResult.participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{claimResult.participant.name}</h3>
                    <p className="text-muted-foreground">{claimResult.participant.email}</p>
                  </div>
                </div>
              )}
              
              {/* Claim Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                    <Utensils className="h-5 w-5" />
                    <span className="font-medium">Food</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                    {claimResult.participant?.foodClaims} / {claimResult.participant?.maxFoodClaims}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                    <Coffee className="h-5 w-5" />
                    <span className="font-medium">Drink</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mt-2">
                    {claimResult.participant?.drinkClaims} / {claimResult.participant?.maxDrinkClaims}
                  </p>
                </div>
              </div>

              <Button variant="outline" onClick={clearResult} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" /> Scan Peserta Lain
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Input QR code untuk melihat info peserta</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
