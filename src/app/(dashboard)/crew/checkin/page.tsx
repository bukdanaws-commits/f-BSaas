'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, User, Loader2, RefreshCw, Camera, CameraOff, Upload, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

const CHECKIN_DESKS = [
  { id: 1, name: 'Desk 1', description: 'Main Entrance' },
  { id: 2, name: 'Desk 2', description: 'Side Entrance' },
  { id: 3, name: 'Desk 3', description: 'VIP Entrance' },
  { id: 4, name: 'Desk 4', description: 'Express Entrance' },
]

interface CheckInResult {
  success: boolean
  message: string
  participant?: {
    id: string
    name: string
    email: string
    company: string | null
    photoUrl: string | null
    qrCode: string
  }
}

export default function CheckinPage() {
  const [selectedDesk, setSelectedDesk] = useState<number>(1)
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualQrCode, setManualQrCode] = useState('')
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const html5QrCodeRef = useRef<any>(null)
  const { toast } = useToast()

  const processCheckIn = useCallback(async (qrCode: string) => {
    if (isProcessing || !qrCode.trim()) return
    setIsProcessing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result: CheckInResult = {
        success: true,
        message: 'Check-in berhasil!',
        participant: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Tech Corp',
          photoUrl: null,
          qrCode: qrCode
        }
      }
      
      setScanResult(result)

      if (result.success) {
        toast({
          title: 'Check-in Berhasil!',
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memproses check-in',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, toast])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    toast({ title: 'Memproses QR Code...', description: 'Membaca gambar QR code' })

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5QrCode = new Html5Qrcode('qr-reader-hidden')
      html5QrCodeRef.current = html5QrCode

      const decodedText = await html5QrCode.scanFile(file, true)
      toast({ title: 'QR Code Terdeteksi!', description: 'Memproses check-in...' })
      await processCheckIn(decodedText)
    } catch (error) {
      toast({
        title: 'QR Code Tidak Terbaca',
        description: 'Pastikan gambar mengandung QR code yang jelas',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [processCheckIn, toast])

  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          setCameraAvailable(false)
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        setCameraAvailable(true)
      } catch {
        setCameraAvailable(false)
      }
    }
    checkCamera()
  }, [])

  const startScanner = useCallback(async () => {
    if (cameraAvailable === false || scannerActive) return
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5QrCode = new Html5Qrcode('qr-reader')
      html5QrCodeRef.current = html5QrCode
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => processCheckIn(decodedText),
        () => {}
      )
      setScannerActive(true)
    } catch {
      setCameraAvailable(false)
    }
  }, [cameraAvailable, scannerActive, processCheckIn])

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && scannerActive) {
      try {
        await html5QrCodeRef.current.stop()
        setScannerActive(false)
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }, [scannerActive])

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const handleManualCheckIn = () => {
    if (manualQrCode.trim()) processCheckIn(manualQrCode.trim())
  }

  const clearResult = () => {
    setScanResult(null)
    setManualQrCode('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Scanner
          </CardTitle>
          <CardDescription>Scan QR code atau gunakan metode alternatif</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Desk Selection */}
          <div className="space-y-3">
            <Label>Pilih Loket Check-in</Label>
            <div className="grid grid-cols-2 gap-2">
              {CHECKIN_DESKS.map((desk) => (
                <div
                  key={desk.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedDesk === desk.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  )}
                  onClick={() => setSelectedDesk(desk.id)}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    selectedDesk === desk.id ? 'border-primary' : 'border-muted-foreground'
                  )}>
                    {selectedDesk === desk.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{desk.name}</p>
                    <p className="text-xs text-muted-foreground">{desk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="qr-reader-hidden" style={{ display: 'none' }} />

          {/* Scanner Area */}
          <div className="relative">
            {cameraAvailable === null ? (
              <div className="w-full h-[280px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : cameraAvailable === false ? (
              <div className="w-full h-[280px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border p-4 text-center">
                <CameraOff className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">Kamera Tidak Tersedia</p>
                <p className="text-sm text-muted-foreground mt-1">Gunakan metode alternatif di bawah</p>
              </div>
            ) : scannerActive ? (
              <div
                id="qr-reader"
                className={cn(
                  "w-full overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-800",
                  isProcessing && 'opacity-50'
                )}
                style={{ minHeight: '280px' }}
              />
            ) : (
              <div 
                className="w-full h-[280px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                onClick={startScanner}
              >
                <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">Klik untuk Mulai Scanner</p>
              </div>
            )}
            {isProcessing && scannerActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>

          {cameraAvailable && (
            <div className="flex gap-2">
              {scannerActive ? (
                <Button variant="outline" onClick={stopScanner} className="flex-1">Stop Scanner</Button>
              ) : (
                <Button variant="outline" onClick={startScanner} className="flex-1">Start Scanner</Button>
              )}
            </div>
          )}

          {/* Alternative Methods */}
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="text-xs"><Upload className="h-3 w-3 mr-1" />Upload</TabsTrigger>
              <TabsTrigger value="manual" className="text-xs"><Camera className="h-3 w-3 mr-1" />Manual</TabsTrigger>
              <TabsTrigger value="email" className="text-xs"><Mail className="h-3 w-3 mr-1" />Email</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full h-20 border-dashed">
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">{isProcessing ? 'Memproses...' : 'Klik untuk upload QR'}</span>
                </div>
              </Button>
            </TabsContent>

            <TabsContent value="manual" className="mt-3">
              <div className="flex gap-2">
                <Input placeholder="HKI-2025-0001" value={manualQrCode} onChange={(e) => setManualQrCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleManualCheckIn()} />
                <Button onClick={handleManualCheckIn} disabled={isProcessing}>Check In</Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="email peserta..." className="pl-10" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Result Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {scanResult ? (
              scanResult.success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <User className="h-5 w-5" />
            )}
            Hasil Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanResult ? (
            <div className="space-y-4">
              {scanResult.participant && (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-[#37517e] text-white">
                      {scanResult.participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{scanResult.participant.name}</h3>
                    <p className="text-muted-foreground">{scanResult.participant.company}</p>
                    <p className="text-sm text-muted-foreground">{scanResult.participant.email}</p>
                  </div>
                </div>
              )}
              <div className={cn(
                "p-4 rounded-lg",
                scanResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
              )}>
                <p className="font-medium">{scanResult.message}</p>
              </div>
              <Button variant="outline" onClick={clearResult} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" /> Scan Peserta Lain
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Scan QR code untuk melihat info peserta</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
