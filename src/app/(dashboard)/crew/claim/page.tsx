'use client'

import { useState, useCallback, useEffect } from 'react'
import { Utensils, Coffee, AlertCircle, CheckCircle, User, RefreshCw, Calendar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useClaim, useTenantEvents } from '@/hooks/use-api'

interface ClaimResult {
  success: boolean
  message: string
  participant?: {
    id: string
    name: string
    email: string
    food_claims: number
    drink_claims: number
    max_food_claims: number
    max_drink_claims: number
  }
}

export default function ClaimPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [qrCode, setQrCode] = useState('')
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null)
  const [claimType, setClaimType] = useState<'food' | 'drink'>('food')
  
  const { toast } = useToast()
  const { claim, loading: isProcessing } = useClaim()
  const { events, loading: eventsLoading } = useTenantEvents()

  // Filter active events only
  const activeEvents = events.filter(e => e.status === 'active')

  // Get event_id from URL on mount (for direct links)
  useEffect(() => {
    const urlEventId = new URLSearchParams(window.location.search).get('event')
    if (urlEventId && urlEventId !== selectedEventId) {
      setSelectedEventId(urlEventId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-select first active event if only one exists
  useEffect(() => {
    if (activeEvents.length === 1 && !selectedEventId && activeEvents[0].id !== selectedEventId) {
      setSelectedEventId(activeEvents[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvents.length])

  const processClaim = useCallback(async (qr: string, type: 'food' | 'drink') => {
    if (!qr.trim()) return

    if (!selectedEventId) {
      toast({
        title: 'Pilih Event',
        description: 'Silakan pilih event terlebih dahulu',
        variant: 'destructive',
      })
      return
    }
    
    try {
      const response = await claim({
        qr_code: qr.trim(),
        event_id: selectedEventId,
        claim_type: type
      })

      if (response.success && response.data) {
        const participant = response.data.participant
        const result: ClaimResult = {
          success: true,
          message: response.data.message || `Claim ${type} berhasil!`,
          participant: {
            id: participant.id,
            name: participant.name,
            email: participant.email,
            food_claims: participant.food_claims,
            drink_claims: participant.drink_claims,
            max_food_claims: participant.max_food_claims,
            max_drink_claims: participant.max_drink_claims,
          }
        }
        setClaimResult(result)
        toast({
          title: `Claim ${type} Berhasil!`,
          description: result.message,
        })
      } else {
        setClaimResult({
          success: false,
          message: response.error || 'Claim gagal'
        })
        toast({
          title: 'Claim Gagal',
          description: response.error || 'Peserta tidak ditemukan',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memproses claim',
        variant: 'destructive',
      })
    }
  }, [claim, selectedEventId, toast])

  const handleClaim = () => {
    if (qrCode.trim()) {
      processClaim(qrCode.trim(), claimType)
    }
  }

  const clearResult = () => {
    setClaimResult(null)
    setQrCode('')
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)

  return (
    <div className="space-y-6">
      {/* Event Selection Banner */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-400" />
            Pilih Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">Memuat events...</span>
            </div>
          ) : activeEvents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>Tidak ada event aktif</p>
              <p className="text-sm">Hubungi admin untuk membuat event</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Pilih event untuk claim F&B" />
                </SelectTrigger>
                <SelectContent>
                  {activeEvents.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex items-center gap-2">
                        <span>{event.name}</span>
                        {event.start_date && (
                          <span className="text-xs text-muted-foreground">
                            ({new Date(event.start_date).toLocaleDateString('id-ID')})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedEvent && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Active
                  </Badge>
                  <span>Max Food: {selectedEvent.default_max_food_claims}</span>
                  <span>Max Drink: {selectedEvent.default_max_drink_claims}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
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
                  disabled={!selectedEventId}
                  className={cn(
                    "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                    claimType === 'food'
                      ? "border-orange-500 bg-orange-500/10 text-orange-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-orange-300",
                    !selectedEventId && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Utensils className="h-5 w-5" />
                  <span className="font-medium">Food</span>
                </button>
                <button
                  onClick={() => setClaimType('drink')}
                  disabled={!selectedEventId}
                  className={cn(
                    "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                    claimType === 'drink'
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-cyan-300",
                    !selectedEventId && "opacity-50 cursor-not-allowed"
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
                  placeholder={selectedEventId ? "Scan atau input QR code..." : "Pilih event terlebih dahulu..."}
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleClaim()}
                  className="flex-1"
                  disabled={!selectedEventId}
                />
                <Button onClick={handleClaim} disabled={isProcessing || !qrCode.trim() || !selectedEventId}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : 'Claim'}
                </Button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
              <p className="font-medium mb-2">Tips:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Scan QR code peserta untuk melihat sisa klaim</li>
                <li>• Pastikan peserta sudah check-in sebelum claim</li>
                <li>• Maksimal food: {selectedEvent?.default_max_food_claims || 4}x, drink: {selectedEvent?.default_max_drink_claims || 2}x</li>
              </ul>
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
                {claimResult.participant && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <Utensils className="h-5 w-5" />
                        <span className="font-medium">Food</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                        {claimResult.participant.food_claims} / {claimResult.participant.max_food_claims}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Sisa: {claimResult.participant.max_food_claims - claimResult.participant.food_claims}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                        <Coffee className="h-5 w-5" />
                        <span className="font-medium">Drink</span>
                      </div>
                      <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mt-2">
                        {claimResult.participant.drink_claims} / {claimResult.participant.max_drink_claims}
                      </p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                        Sisa: {claimResult.participant.max_drink_claims - claimResult.participant.drink_claims}
                      </p>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className={cn(
                  "p-4 rounded-lg",
                  claimResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                )}>
                  <p className="font-medium">{claimResult.message}</p>
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
    </div>
  )
}
