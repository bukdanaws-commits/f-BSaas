'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle, XCircle, Coffee, Utensils, Loader2, RefreshCw, Camera, CameraOff, Upload, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Participant {
  id: string
  qrCode: string
  name: string
  email: string
  company: string | null
  photoUrl: string | null
  foodClaims: number
  drinkClaims: number
  maxFoodClaims: number
  maxDrinkClaims: number
}

interface ClaimResult {
  success: boolean
  message: string
  participant?: Participant
  menuItem?: { id: string; name: string; category: string }
  error?: string
}

// Mock booths and menu items - will be replaced with Supabase data
const MOCK_BOOTHS = [
  { id: '1', name: 'Food Booth 1', boothType: 'food', boothNumber: 1 },
  { id: '2', name: 'Food Booth 2', boothType: 'food', boothNumber: 2 },
  { id: '3', name: 'Drink Booth 1', boothType: 'drink', boothNumber: 1 },
  { id: '4', name: 'Drink Booth 2', boothType: 'drink', boothNumber: 2 },
]

const MOCK_MENU_ITEMS = [
  { id: '1', name: 'Nasi Box A', description: 'Nasi + Ayam Goreng', category: { id: '1', name: 'Food' }, currentStock: 100 },
  { id: '2', name: 'Nasi Box B', description: 'Nasi + Rendang', category: { id: '1', name: 'Food' }, currentStock: 80 },
  { id: '3', name: 'Snack Box', description: 'Berbagai snack', category: { id: '1', name: 'Food' }, currentStock: 150 },
  { id: '4', name: 'Mineral Water', description: 'Air mineral 600ml', category: { id: '2', name: 'Drink' }, currentStock: 200 },
  { id: '5', name: 'Coffee', description: 'Hot/Ice Coffee', category: { id: '2', name: 'Drink' }, currentStock: 100 },
]

export default function ClaimSection() {
  const [booths] = useState(MOCK_BOOTHS)
  const [selectedBooth, setSelectedBooth] = useState<string>('1')
  const [menuItems] = useState(MOCK_MENU_ITEMS)
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('')
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(null)
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualQrCode, setManualQrCode] = useState('')
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null)
  const [scannerActive, setScannerActive] = useState(false)
  const [emailSearch, setEmailSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const html5QrCodeRef = useRef<any>(null)
  const { toast } = useToast()

  // Check camera availability
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
      } catch (error) {
        setCameraAvailable(false)
      }
    }
    checkCamera()
  }, [])

  const scanParticipant = useCallback(async (qrCode: string) => {
    if (isProcessing || !qrCode.trim()) return
    setIsProcessing(true)

    try {
      // TODO: Replace with Supabase API call
      // Mock participant data
      const participant: Participant = {
        id: '1',
        qrCode,
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Tech Corp',
        photoUrl: null,
        foodClaims: 1,
        drinkClaims: 0,
        maxFoodClaims: 4,
        maxDrinkClaims: 2,
      }
      setScannedParticipant(participant)
      toast({ title: 'Peserta Ditemukan', description: participant.name })
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memindai peserta', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, toast])

  const processClaim = async () => {
    if (!scannedParticipant || !selectedBooth || !selectedMenuItem) {
      toast({ title: 'Informasi Kurang', description: 'Pilih booth dan menu item', variant: 'destructive' })
      return
    }

    setIsProcessing(true)
    try {
      // TODO: Replace with Supabase API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const result: ClaimResult = {
        success: true,
        message: 'Claim berhasil!',
        participant: { ...scannedParticipant, foodClaims: scannedParticipant.foodClaims + 1 },
        menuItem: { id: selectedMenuItem, name: 'Nasi Box A', category: 'Food' }
      }
      
      setClaimResult(result)
      toast({ title: 'Claim Berhasil', description: result.message })
      
      if (result.participant) {
        setScannedParticipant(result.participant)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memproses claim', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const startScanner = useCallback(async () => {
    if (cameraAvailable === false || scannerActive) return
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5QrCode = new Html5Qrcode('claim-qr-reader')
      html5QrCodeRef.current = html5QrCode
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => scanParticipant(decodedText),
        () => {}
      )
      setScannerActive(true)
    } catch (error) {
      setCameraAvailable(false)
    }
  }, [cameraAvailable, scannerActive, scanParticipant])

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && scannerActive) {
      await html5QrCodeRef.current.stop()
      setScannerActive(false)
    }
  }, [scannerActive])

  const resetScanner = () => {
    setScannedParticipant(null)
    setClaimResult(null)
    setSelectedMenuItem('')
    setManualQrCode('')
    setEmailSearch('')
  }

  const selectedBoothData = booths.find((b) => b.id === selectedBooth)
  const filteredMenuItems = menuItems.filter(
    (m) => m.category.name.toLowerCase() === selectedBoothData?.boothType
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Scanner / Participant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {scannedParticipant ? 'Peserta' : 'Scan QR Code'}
          </CardTitle>
          <CardDescription>
            {scannedParticipant ? 'Pilih menu item dan proses claim' : 'Scan QR code peserta untuk claim makanan/minuman'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scannedParticipant ? (
            <div className="space-y-4">
              {/* Participant Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-[#37517e] text-white">
                    {scannedParticipant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{scannedParticipant.name}</h3>
                  <p className="text-muted-foreground">{scannedParticipant.company || 'Tidak ada perusahaan'}</p>
                </div>
              </div>

              {/* Claim Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Food Claims</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {scannedParticipant.maxFoodClaims - scannedParticipant.foodClaims}/{scannedParticipant.maxFoodClaims}
                  </p>
                  <p className="text-xs text-muted-foreground">sisa</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Coffee className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Drink Claims</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {scannedParticipant.maxDrinkClaims - scannedParticipant.drinkClaims}/{scannedParticipant.maxDrinkClaims}
                  </p>
                  <p className="text-xs text-muted-foreground">sisa</p>
                </div>
              </div>

              <Button variant="outline" onClick={resetScanner} className="w-full gap-2">
                <RefreshCw className="h-4 w-4" /> Scan Peserta Lain
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="claim-qr-reader-hidden" style={{ display: 'none' }} />
              
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
                  <div id="claim-qr-reader" className="w-full overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-800" style={{ minHeight: '280px' }} />
                ) : (
                  <div className="w-full h-[280px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border cursor-pointer hover:bg-slate-200 transition-colors" onClick={startScanner}>
                    <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">Klik untuk Mulai Scanner</p>
                  </div>
                )}
              </div>

              {cameraAvailable && (
                <Button variant="outline" onClick={scannerActive ? stopScanner : startScanner} className="w-full">
                  {scannerActive ? 'Stop Scanner' : 'Start Scanner'}
                </Button>
              )}

              {/* Alternative Methods */}
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual" className="text-xs"><Camera className="h-3 w-3 mr-1" />Manual</TabsTrigger>
                  <TabsTrigger value="email" className="text-xs"><Mail className="h-3 w-3 mr-1" />Email</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="mt-3">
                  <div className="flex gap-2">
                    <Input placeholder="HKI-2025-0001" value={manualQrCode} onChange={(e) => setManualQrCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && scanParticipant(manualQrCode)} />
                    <Button onClick={() => scanParticipant(manualQrCode)} disabled={isProcessing}>Cari</Button>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="email peserta..." value={emailSearch} onChange={(e) => setEmailSearch(e.target.value)} className="pl-10" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Booth & Menu Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Proses Claim</CardTitle>
          <CardDescription>Pilih booth dan menu item</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booth Selection */}
          <div className="space-y-3">
            <Label>Pilih Booth</Label>
            <div className="grid grid-cols-2 gap-2">
              {booths.map((booth) => (
                <div
                  key={booth.id}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBooth === booth.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedBooth(booth.id)}
                >
                  {booth.boothType === 'food' ? (
                    <Utensils className="h-5 w-5 mb-1 text-orange-500" />
                  ) : (
                    <Coffee className="h-5 w-5 mb-1 text-[#47b2e4]" />
                  )}
                  <span className="text-sm font-medium text-center">{booth.name}</span>
                  <Badge variant="outline" className="text-xs mt-1 capitalize">{booth.boothType}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            <Label>Pilih Menu Item</Label>
            <ScrollArea className="h-48 rounded-lg border">
              <div className="p-2 space-y-2">
                {filteredMenuItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Tidak ada item tersedia</p>
                ) : (
                  filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMenuItem === item.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      } ${item.currentStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => item.currentStock > 0 && setSelectedMenuItem(item.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                        <Badge variant={item.currentStock > 0 ? 'secondary' : 'destructive'}>
                          Stok: {item.currentStock}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Claim Result */}
          {claimResult && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              claimResult.success
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {claimResult.success ? <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" /> : <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
              <div>
                <p className="font-medium">{claimResult.message || claimResult.error}</p>
                {claimResult.menuItem && (
                  <p className="text-sm mt-1">Item: {claimResult.menuItem.name} ({claimResult.menuItem.category})</p>
                )}
              </div>
            </div>
          )}

          {/* Process Claim Button */}
          <Button onClick={processClaim} disabled={!scannedParticipant || !selectedBooth || !selectedMenuItem || isProcessing} className="w-full bg-[#37517e] hover:bg-[#37517e]/90">
            {isProcessing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memproses...</>
            ) : 'Proses Claim'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
