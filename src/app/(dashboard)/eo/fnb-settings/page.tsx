'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Utensils,
  Coffee,
  Plus,
  Minus,
  Save,
  RefreshCw,
  Store,
  Package,
  Settings,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  History,
  Search,
  ChevronDown,
  Eye,
  X,
  Calendar,
  MapPin,
  ArrowUpDown,
  Filter,
  Download,
  Upload,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { StatsCard, StatsGrid } from '@/components/dashboard/StatsCard'
import { FNBS_DEFAULTS } from '@/config/menu'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useTenantEvents, useEventFnb, useDataStore } from '@/stores/mock-store'

// =====================================
// TYPES
// =====================================
interface MenuItem {
  id: string
  name: string
  category: 'food' | 'drink'
  categoryName: string
  stock: number
  initialStock: number
  claimed: number
  boothId: string | null
  boothName: string
  isActive: boolean
  createdAt: string
}

interface Booth {
  id: string
  name: string
  type: 'food' | 'drink' | 'both'
  menuCount: number
  status: 'active' | 'inactive'
}

interface StockLog {
  id: string
  menuItemId: string
  menuItemName: string
  type: 'add' | 'subtract' | 'set'
  previousStock: number
  newStock: number
  difference: number
  reason: string
  operatorName: string
  createdAt: string
}

interface FNBSettings {
  enableFood: boolean
  enableDrink: boolean
  maxFoodPerParticipant: number
  maxDrinkPerParticipant: number
  multiBooth: boolean
}

// =====================================
// MOCK DATA
// =====================================
const MOCK_MENU_CATEGORIES = [
  { id: 'cat-1', name: 'Main Course', type: 'food' },
  { id: 'cat-2', name: 'Snacks', type: 'food' },
  { id: 'cat-3', name: 'Dessert', type: 'food' },
  { id: 'cat-4', name: 'Beverages', type: 'drink' },
  { id: 'cat-5', name: 'Coffee & Tea', type: 'drink' },
  { id: 'cat-6', name: 'Juice', type: 'drink' },
]

const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Nasi Box Special', category: 'food', categoryName: 'Main Course', stock: 200, initialStock: 200, claimed: 45, boothId: 'b1', boothName: 'Booth A', isActive: true, createdAt: '2024-03-10' },
  { id: 'm2', name: 'Snack Box', category: 'food', categoryName: 'Snacks', stock: 300, initialStock: 300, claimed: 78, boothId: 'b1', boothName: 'Booth A', isActive: true, createdAt: '2024-03-10' },
  { id: 'm3', name: 'Sandwich', category: 'food', categoryName: 'Main Course', stock: 150, initialStock: 150, claimed: 32, boothId: 'b2', boothName: 'Booth B', isActive: true, createdAt: '2024-03-11' },
  { id: 'm4', name: 'Burger', category: 'food', categoryName: 'Main Course', stock: 100, initialStock: 100, claimed: 28, boothId: 'b2', boothName: 'Booth B', isActive: true, createdAt: '2024-03-11' },
  { id: 'm5', name: 'Ice Cream', category: 'food', categoryName: 'Dessert', stock: 80, initialStock: 80, claimed: 15, boothId: 'b2', boothName: 'Booth B', isActive: true, createdAt: '2024-03-12' },
  { id: 'm6', name: 'Mineral Water', category: 'drink', categoryName: 'Beverages', stock: 500, initialStock: 500, claimed: 156, boothId: 'b3', boothName: 'Drink Station', isActive: true, createdAt: '2024-03-10' },
  { id: 'm7', name: 'Orange Juice', category: 'drink', categoryName: 'Juice', stock: 200, initialStock: 200, claimed: 45, boothId: 'b3', boothName: 'Drink Station', isActive: true, createdAt: '2024-03-10' },
  { id: 'm8', name: 'Coffee', category: 'drink', categoryName: 'Coffee & Tea', stock: 150, initialStock: 150, claimed: 38, boothId: 'b4', boothName: 'Coffee Corner', isActive: true, createdAt: '2024-03-11' },
  { id: 'm9', name: 'Tea', category: 'drink', categoryName: 'Coffee & Tea', stock: 150, initialStock: 150, claimed: 25, boothId: 'b4', boothName: 'Coffee Corner', isActive: true, createdAt: '2024-03-11' },
  { id: 'm10', name: 'Smoothie', category: 'drink', categoryName: 'Juice', stock: 100, initialStock: 100, claimed: 12, boothId: 'b3', boothName: 'Drink Station', isActive: true, createdAt: '2024-03-12' },
]

const INITIAL_BOOTHS: Booth[] = [
  { id: 'b1', name: 'Booth A', type: 'food', menuCount: 2, status: 'active' },
  { id: 'b2', name: 'Booth B', type: 'both', menuCount: 3, status: 'active' },
  { id: 'b3', name: 'Drink Station', type: 'drink', menuCount: 3, status: 'active' },
  { id: 'b4', name: 'Coffee Corner', type: 'drink', menuCount: 2, status: 'active' },
]

const INITIAL_STOCK_LOGS: StockLog[] = [
  { id: 'sl1', menuItemId: 'm1', menuItemName: 'Nasi Box Special', type: 'subtract', previousStock: 250, newStock: 200, difference: -50, reason: 'Claimed by participants', operatorName: 'System', createdAt: '2024-03-15 10:30:00' },
  { id: 'sl2', menuItemId: 'm6', menuItemName: 'Mineral Water', type: 'subtract', previousStock: 700, newStock: 500, difference: -200, reason: 'Claimed by participants', operatorName: 'System', createdAt: '2024-03-15 11:00:00' },
  { id: 'sl3', menuItemId: 'm2', menuItemName: 'Snack Box', type: 'add', previousStock: 250, newStock: 300, difference: 50, reason: 'Restock from vendor', operatorName: 'Admin', createdAt: '2024-03-15 14:00:00' },
]

// =====================================
// MAIN COMPONENT
// =====================================
export default function FNBSettingsPage() {
  const { toast } = useToast()
  const events = useTenantEvents()
  
  // State
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '')
  const [settings, setSettings] = useState<FNBSettings>({
    enableFood: FNBS_DEFAULTS.enableFood,
    enableDrink: FNBS_DEFAULTS.enableDrink,
    maxFoodPerParticipant: FNBS_DEFAULTS.maxFoodPerParticipant,
    maxDrinkPerParticipant: FNBS_DEFAULTS.maxDrinkPerParticipant,
    multiBooth: FNBS_DEFAULTS.multiBooth,
  })
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS)
  const [booths, setBooths] = useState<Booth[]>(INITIAL_BOOTHS)
  const [stockLogs, setStockLogs] = useState<StockLog[]>(INITIAL_STOCK_LOGS)
  const [saving, setSaving] = useState(false)
  
  // Filter states
  const [menuSearchTerm, setMenuSearchTerm] = useState('')
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('all')
  const [menuBoothFilter, setMenuBoothFilter] = useState<string>('all')
  
  // Dialog states
  const [menuDialogOpen, setMenuDialogOpen] = useState(false)
  const [boothDialogOpen, setBoothDialogOpen] = useState(false)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [stockLogDialogOpen, setStockLogDialogOpen] = useState(false)
  const [deleteMenuDialogOpen, setDeleteMenuDialogOpen] = useState(false)
  const [deleteBoothDialogOpen, setDeleteBoothDialogOpen] = useState(false)
  
  // Form states
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null)
  const [stockAdjustment, setStockAdjustment] = useState<{ menu: MenuItem | null; type: 'add' | 'subtract' | 'set'; amount: number; reason: string }>({
    menu: null,
    type: 'add',
    amount: 0,
    reason: ''
  })
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    category: 'food' as 'food' | 'drink',
    categoryName: '',
    stock: 0,
    boothId: '',
    isActive: true
  })
  const [boothFormData, setBoothFormData] = useState({
    name: '',
    type: 'both' as 'food' | 'drink' | 'both',
    status: 'active' as 'active' | 'inactive'
  })

  // =====================================
  // COMPUTED VALUES
  // =====================================
  const stats = useMemo(() => {
    const foodItems = menuItems.filter(m => m.category === 'food')
    const drinkItems = menuItems.filter(m => m.category === 'drink')
    const totalFoodStock = foodItems.reduce((sum, item) => sum + item.stock, 0)
    const totalFoodClaimed = foodItems.reduce((sum, item) => sum + item.claimed, 0)
    const totalDrinkStock = drinkItems.reduce((sum, item) => sum + item.stock, 0)
    const totalDrinkClaimed = drinkItems.reduce((sum, item) => sum + item.claimed, 0)
    const activeBooths = booths.filter(b => b.status === 'active').length
    
    return {
      totalFoodStock,
      totalFoodClaimed,
      totalDrinkStock,
      totalDrinkClaimed,
      totalBooths: booths.length,
      activeBooths,
      totalMenuItems: menuItems.length,
      lowStockItems: menuItems.filter(m => m.stock < 50).length,
    }
  }, [menuItems, booths])

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())
      const matchesCategory = menuCategoryFilter === 'all' || item.category === menuCategoryFilter
      const matchesBooth = menuBoothFilter === 'all' || item.boothId === menuBoothFilter
      return matchesSearch && matchesCategory && matchesBooth
    })
  }, [menuItems, menuSearchTerm, menuCategoryFilter, menuBoothFilter])

  const foodMenuItems = filteredMenuItems.filter(m => m.category === 'food')
  const drinkMenuItems = filteredMenuItems.filter(m => m.category === 'drink')

  // =====================================
  // HANDLERS
  // =====================================
  
  // Settings handlers
  const updateSetting = (key: keyof FNBSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast({
      title: 'Berhasil',
      description: 'Pengaturan F&B berhasil disimpan'
    })
  }

  // Menu handlers
  const openAddMenuDialog = () => {
    setEditingMenu(null)
    setMenuFormData({
      name: '',
      category: 'food',
      categoryName: '',
      stock: 0,
      boothId: booths[0]?.id || '',
      isActive: true
    })
    setMenuDialogOpen(true)
  }

  const openEditMenuDialog = (menu: MenuItem) => {
    setEditingMenu(menu)
    setMenuFormData({
      name: menu.name,
      category: menu.category,
      categoryName: menu.categoryName,
      stock: menu.stock,
      boothId: menu.boothId || '',
      isActive: menu.isActive
    })
    setMenuDialogOpen(true)
  }

  const handleSaveMenu = () => {
    if (!menuFormData.name.trim()) {
      toast({ title: 'Error', description: 'Nama menu wajib diisi', variant: 'destructive' })
      return
    }

    const selectedBooth = booths.find(b => b.id === menuFormData.boothId)

    if (editingMenu) {
      // Update existing
      setMenuItems(prev => prev.map(m => 
        m.id === editingMenu.id 
          ? { 
              ...m, 
              name: menuFormData.name,
              category: menuFormData.category,
              categoryName: menuFormData.categoryName,
              boothId: menuFormData.boothId,
              boothName: selectedBooth?.name || ''
            }
          : m
      ))
      toast({ title: 'Berhasil', description: 'Menu berhasil diperbarui' })
    } else {
      // Add new
      const newMenu: MenuItem = {
        id: `m-${Date.now()}`,
        name: menuFormData.name,
        category: menuFormData.category,
        categoryName: menuFormData.categoryName,
        stock: menuFormData.stock,
        initialStock: menuFormData.stock,
        claimed: 0,
        boothId: menuFormData.boothId,
        boothName: selectedBooth?.name || '',
        isActive: menuFormData.isActive,
        createdAt: new Date().toISOString()
      }
      setMenuItems(prev => [...prev, newMenu])
      toast({ title: 'Berhasil', description: 'Menu baru berhasil ditambahkan' })
    }

    setMenuDialogOpen(false)
  }

  const handleDeleteMenu = () => {
    if (!editingMenu) return
    setMenuItems(prev => prev.filter(m => m.id !== editingMenu.id))
    setDeleteMenuDialogOpen(false)
    setEditingMenu(null)
    toast({ title: 'Berhasil', description: 'Menu berhasil dihapus' })
  }

  // Booth handlers
  const openAddBoothDialog = () => {
    setEditingBooth(null)
    setBoothFormData({
      name: '',
      type: 'both',
      status: 'active'
    })
    setBoothDialogOpen(true)
  }

  const openEditBoothDialog = (booth: Booth) => {
    setEditingBooth(booth)
    setBoothFormData({
      name: booth.name,
      type: booth.type,
      status: booth.status
    })
    setBoothDialogOpen(true)
  }

  const handleSaveBooth = () => {
    if (!boothFormData.name.trim()) {
      toast({ title: 'Error', description: 'Nama booth wajib diisi', variant: 'destructive' })
      return
    }

    if (editingBooth) {
      // Update existing
      setBooths(prev => prev.map(b => 
        b.id === editingBooth.id 
          ? { ...b, name: boothFormData.name, type: boothFormData.type, status: boothFormData.status }
          : b
      ))
      // Update menu items with this booth
      setMenuItems(prev => prev.map(m => 
        m.boothId === editingBooth.id 
          ? { ...m, boothName: boothFormData.name }
          : m
      ))
      toast({ title: 'Berhasil', description: 'Booth berhasil diperbarui' })
    } else {
      // Add new
      const newBooth: Booth = {
        id: `b-${Date.now()}`,
        name: boothFormData.name,
        type: boothFormData.type,
        menuCount: 0,
        status: boothFormData.status
      }
      setBooths(prev => [...prev, newBooth])
      toast({ title: 'Berhasil', description: 'Booth baru berhasil ditambahkan' })
    }

    setBoothDialogOpen(false)
  }

  const handleDeleteBooth = () => {
    if (!editingBooth) return
    
    // Check if booth has menu items
    const hasMenus = menuItems.some(m => m.boothId === editingBooth.id)
    if (hasMenus) {
      toast({ 
        title: 'Tidak Dapat Dihapus', 
        description: 'Booth memiliki menu terkait. Hapus atau pindahkan menu terlebih dahulu.',
        variant: 'destructive' 
      })
      setDeleteBoothDialogOpen(false)
      return
    }
    
    setBooths(prev => prev.filter(b => b.id !== editingBooth.id))
    setDeleteBoothDialogOpen(false)
    setEditingBooth(null)
    toast({ title: 'Berhasil', description: 'Booth berhasil dihapus' })
  }

  // Stock handlers
  const openStockDialog = (menu: MenuItem, type: 'add' | 'subtract' | 'set') => {
    setStockAdjustment({
      menu,
      type,
      amount: 0,
      reason: ''
    })
    setStockDialogOpen(true)
  }

  const handleStockAdjustment = () => {
    if (!stockAdjustment.menu) return
    
    const { menu, type, amount, reason } = stockAdjustment
    let newStock = menu.stock
    
    switch (type) {
      case 'add':
        newStock = menu.stock + amount
        break
      case 'subtract':
        newStock = Math.max(0, menu.stock - amount)
        break
      case 'set':
        newStock = amount
        break
    }

    // Update menu item
    setMenuItems(prev => prev.map(m => 
      m.id === menu.id ? { ...m, stock: newStock } : m
    ))

    // Add stock log
    const log: StockLog = {
      id: `sl-${Date.now()}`,
      menuItemId: menu.id,
      menuItemName: menu.name,
      type,
      previousStock: menu.stock,
      newStock,
      difference: newStock - menu.stock,
      reason: reason || (type === 'add' ? 'Restock' : type === 'subtract' ? 'Used' : 'Manual adjustment'),
      operatorName: 'Admin',
      createdAt: new Date().toISOString()
    }
    setStockLogs(prev => [log, ...prev])

    setStockDialogOpen(false)
    toast({ 
      title: 'Berhasil', 
      description: `Stok ${menu.name} diupdate dari ${menu.stock} ke ${newStock}` 
    })
  }

  // Export
  const handleExportMenu = () => {
    const headers = ['Name', 'Category', 'Stock', 'Claimed', 'Booth', 'Status']
    const rows = menuItems.map(m => [
      m.name, m.categoryName, m.stock.toString(), m.claimed.toString(), m.boothName, m.isActive ? 'Active' : 'Inactive'
    ])
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fnb_menu_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({ title: 'Berhasil', description: 'Data menu berhasil diexport' })
  }

  // =====================================
  // RENDER
  // =====================================
  return (
    <div className="space-y-6 pb-8">
      {/* Event Selector */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-300">Event:</span>
            </div>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[300px] bg-slate-900/50 border-slate-700">
                <SelectValue placeholder="Pilih event" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    <div className="flex items-center gap-2">
                      <span>{event.name}</span>
                      {event.status === 'active' && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Active</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEventId && (
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {events.find(e => e.id === selectedEventId)?.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {events.find(e => e.id === selectedEventId)?.start_date 
                    ? new Date(events.find(e => e.id === selectedEventId)!.start_date).toLocaleDateString('id-ID')
                    : 'TBD'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Makanan"
          value={stats.totalFoodStock}
          description={`${stats.totalFoodClaimed} telah diklaim`}
          icon={Utensils}
          variant="gradient"
          gradientFrom="from-orange-500"
          gradientTo="to-orange-600"
        />
        <StatsCard
          title="Total Minuman"
          value={stats.totalDrinkStock}
          description={`${stats.totalDrinkClaimed} telah diklaim`}
          icon={Coffee}
          variant="gradient"
          gradientFrom="from-cyan-500"
          gradientTo="to-cyan-600"
        />
        <StatsCard
          title="Total Booth"
          value={stats.totalBooths}
          description={`${stats.activeBooths} aktif`}
          icon={Store}
          variant="gradient"
          gradientFrom="from-purple-500"
          gradientTo="to-purple-600"
        />
        <StatsCard
          title="Menu Items"
          value={stats.totalMenuItems}
          description={stats.lowStockItems > 0 ? `${stats.lowStockItems} stok rendah` : 'Semua stok aman'}
          icon={Package}
          variant="gradient"
          gradientFrom={stats.lowStockItems > 0 ? "from-red-500" : "from-emerald-500"}
          gradientTo={stats.lowStockItems > 0 ? "to-red-600" : "to-emerald-600"}
        />
      </StatsGrid>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-2">
            <Utensils className="h-4 w-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="booths" className="gap-2">
            <Store className="h-4 w-4" />
            Booths
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5 text-amber-500" />
                F&B Configuration
              </CardTitle>
              <CardDescription>
                Konfigurasi batas klaim per peserta untuk event ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-white">Aktifkan Makanan</Label>
                    <p className="text-sm text-slate-400">
                      Peserta dapat mengklaim makanan
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableFood}
                    onCheckedChange={(checked) => updateSetting('enableFood', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-white">Aktifkan Minuman</Label>
                    <p className="text-sm text-slate-400">
                      Peserta dapat mengklaim minuman
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableDrink}
                    onCheckedChange={(checked) => updateSetting('enableDrink', checked)}
                  />
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Limits */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">Batas Klaim per Peserta</h4>
                <p className="text-sm text-slate-400">
                  Tentukan jumlah maksimal klaim untuk setiap peserta
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Maksimal Makanan</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateSetting('maxFoodPerParticipant', Math.max(0, settings.maxFoodPerParticipant - 1))}
                        disabled={!settings.enableFood}
                        className="border-slate-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={settings.maxFoodPerParticipant}
                        onChange={(e) => updateSetting('maxFoodPerParticipant', parseInt(e.target.value) || 0)}
                        className="text-center bg-slate-900/50 border-slate-700"
                        disabled={!settings.enableFood}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateSetting('maxFoodPerParticipant', settings.maxFoodPerParticipant + 1)}
                        disabled={!settings.enableFood}
                        className="border-slate-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Maksimal Minuman</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateSetting('maxDrinkPerParticipant', Math.max(0, settings.maxDrinkPerParticipant - 1))}
                        disabled={!settings.enableDrink}
                        className="border-slate-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={settings.maxDrinkPerParticipant}
                        onChange={(e) => updateSetting('maxDrinkPerParticipant', parseInt(e.target.value) || 0)}
                        className="text-center bg-slate-900/50 border-slate-700"
                        disabled={!settings.enableDrink}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateSetting('maxDrinkPerParticipant', settings.maxDrinkPerParticipant + 1)}
                        disabled={!settings.enableDrink}
                        className="border-slate-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Multi Booth */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium text-white">Multi Booth Mode</Label>
                  <p className="text-sm text-slate-400">
                    Aktifkan multiple booth untuk distribusi F&B
                  </p>
                </div>
                <Switch
                  checked={settings.multiBooth}
                  onCheckedChange={(checked) => updateSetting('multiBooth', checked)}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveSettings} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black">
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Pengaturan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Tab */}
        <TabsContent value="menu" className="space-y-6">
          {/* Filters & Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full md:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Cari menu..."
                      value={menuSearchTerm}
                      onChange={(e) => setMenuSearchTerm(e.target.value)}
                      className="pl-9 bg-slate-900/50 border-slate-700"
                    />
                  </div>
                  <Select value={menuCategoryFilter} onValueChange={setMenuCategoryFilter}>
                    <SelectTrigger className="w-[140px] bg-slate-900/50 border-slate-700">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="food">Makanan</SelectItem>
                      <SelectItem value="drink">Minuman</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={menuBoothFilter} onValueChange={setMenuBoothFilter}>
                    <SelectTrigger className="w-[160px] bg-slate-900/50 border-slate-700">
                      <SelectValue placeholder="Booth" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">Semua Booth</SelectItem>
                      {booths.map(booth => (
                        <SelectItem key={booth.id} value={booth.id}>{booth.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" onClick={handleExportMenu} className="border-slate-700 text-slate-300">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" onClick={openAddMenuDialog} className="bg-amber-500 hover:bg-amber-600 text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Menu
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food Menu */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Utensils className="h-5 w-5 text-orange-500" />
                    Menu Makanan
                    <Badge variant="outline" className="ml-2 text-slate-400 border-slate-600">
                      {foodMenuItems.length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {foodMenuItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Tidak ada menu makanan
                        </div>
                      ) : (
                        foodMenuItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors",
                              item.stock < 50 && "border-red-500/30"
                            )}
                          >
                            <div className="p-2 rounded-lg bg-orange-500/10">
                              <Utensils className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white truncate">{item.name}</p>
                                {item.stock < 50 && (
                                  <Badge className="bg-red-500/20 text-red-400 text-[10px]">Low Stock</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-400">{item.boothName} • {item.categoryName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">{item.stock}</p>
                              <p className="text-xs text-slate-500">Stok</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-400">{item.claimed}</p>
                              <p className="text-xs text-slate-500">Claimed</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                <DropdownMenuItem onClick={() => openEditMenuDialog(item)} className="text-slate-300">
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openStockDialog(item, 'add')} className="text-slate-300">
                                  <TrendingUp className="h-4 w-4 mr-2" /> Tambah Stok
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openStockDialog(item, 'subtract')} className="text-slate-300">
                                  <TrendingDown className="h-4 w-4 mr-2" /> Kurangi Stok
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem 
                                  onClick={() => { setEditingMenu(item); setDeleteMenuDialogOpen(true) }}
                                  className="text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Drink Menu */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Coffee className="h-5 w-5 text-cyan-500" />
                    Menu Minuman
                    <Badge variant="outline" className="ml-2 text-slate-400 border-slate-600">
                      {drinkMenuItems.length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {drinkMenuItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          Tidak ada menu minuman
                        </div>
                      ) : (
                        drinkMenuItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors",
                              item.stock < 50 && "border-red-500/30"
                            )}
                          >
                            <div className="p-2 rounded-lg bg-cyan-500/10">
                              <Coffee className="h-5 w-5 text-cyan-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white truncate">{item.name}</p>
                                {item.stock < 50 && (
                                  <Badge className="bg-red-500/20 text-red-400 text-[10px]">Low Stock</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-400">{item.boothName} • {item.categoryName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">{item.stock}</p>
                              <p className="text-xs text-slate-500">Stok</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-400">{item.claimed}</p>
                              <p className="text-xs text-slate-500">Claimed</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                <DropdownMenuItem onClick={() => openEditMenuDialog(item)} className="text-slate-300">
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openStockDialog(item, 'add')} className="text-slate-300">
                                  <TrendingUp className="h-4 w-4 mr-2" /> Tambah Stok
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openStockDialog(item, 'subtract')} className="text-slate-300">
                                  <TrendingDown className="h-4 w-4 mr-2" /> Kurangi Stok
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem 
                                  onClick={() => { setEditingMenu(item); setDeleteMenuDialogOpen(true) }}
                                  className="text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Booths Tab */}
        <TabsContent value="booths" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Store className="h-5 w-5 text-purple-500" />
                    Daftar Booth
                  </CardTitle>
                  <CardDescription>Kelola booth distribusi makanan & minuman</CardDescription>
                </div>
                <Button size="sm" onClick={openAddBoothDialog} className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Booth
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {booths.map((booth) => (
                  <Card key={booth.id} className="overflow-hidden bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <div className={cn(
                      "h-2",
                      booth.type === 'food' ? "bg-orange-500" : 
                      booth.type === 'drink' ? "bg-cyan-500" : 
                      "bg-gradient-to-r from-orange-500 to-cyan-500"
                    )} />
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            booth.type === 'food' ? "bg-orange-500/10" : 
                            booth.type === 'drink' ? "bg-cyan-500/10" : 
                            "bg-gradient-to-br from-orange-500/10 to-cyan-500/10"
                          )}>
                            <Store className={cn(
                              "h-5 w-5",
                              booth.type === 'food' ? "text-orange-500" : 
                              booth.type === 'drink' ? "text-cyan-500" : 
                              "text-purple-500"
                            )} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{booth.name}</p>
                            <p className="text-sm text-slate-400 capitalize">{booth.type === 'both' ? 'Food & Drink' : booth.type}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            booth.status === 'active' 
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" 
                              : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                          )}
                        >
                          {booth.status}
                        </Badge>
                      </div>
                      <Separator className="my-4 bg-slate-700" />
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-slate-500">Menu tersedia: </span>
                          <span className="font-medium text-white">{booth.menuCount} items</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem onClick={() => openEditBoothDialog(booth)} className="text-slate-300">
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem 
                              onClick={() => { setEditingBooth(booth); setDeleteBoothDialogOpen(true) }}
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <History className="h-5 w-5 text-amber-500" />
                    Stock Adjustment Log
                  </CardTitle>
                  <CardDescription>History perubahan stok menu</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export Log
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {stockLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700"
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        log.difference > 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                      )}>
                        {log.difference > 0 ? (
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{log.menuItemName}</p>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              log.type === 'add' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" :
                              log.type === 'subtract' ? "bg-red-500/20 text-red-400 border-red-500/20" :
                              "bg-blue-500/20 text-blue-400 border-blue-500/20"
                            )}
                          >
                            {log.type === 'add' ? 'Restock' : log.type === 'subtract' ? 'Used' : 'Adjusted'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{log.reason}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.operatorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{log.previousStock}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-bold text-white">{log.newStock}</span>
                        </div>
                        <p className={cn(
                          "text-sm font-medium",
                          log.difference > 0 ? "text-emerald-400" : "text-red-400"
                        )}>
                          {log.difference > 0 ? '+' : ''}{log.difference}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===================================== */}
      {/* DIALOGS */}
      {/* ===================================== */}

      {/* Menu Dialog */}
      <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</DialogTitle>
            <DialogDescription>
              {editingMenu ? 'Perbarui data menu' : 'Isi data menu baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nama Menu *</Label>
              <Input
                value={menuFormData.name}
                onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Nasi Goreng"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Kategori *</Label>
                <Select 
                  value={menuFormData.category} 
                  onValueChange={(v) => setMenuFormData(prev => ({ ...prev, category: v as 'food' | 'drink' }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="food">Makanan</SelectItem>
                    <SelectItem value="drink">Minuman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Sub Kategori</Label>
                <Select 
                  value={menuFormData.categoryName} 
                  onValueChange={(v) => setMenuFormData(prev => ({ ...prev, categoryName: v }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {MOCK_MENU_CATEGORIES
                      .filter(c => c.type === menuFormData.category)
                      .map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!editingMenu && (
              <div className="space-y-2">
                <Label className="text-slate-300">Stok Awal</Label>
                <Input
                  type="number"
                  value={menuFormData.stock}
                  onChange={(e) => setMenuFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-300">Booth</Label>
              <Select 
                value={menuFormData.boothId} 
                onValueChange={(v) => setMenuFormData(prev => ({ ...prev, boothId: v }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Pilih booth..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {booths
                    .filter(b => b.type === 'both' || b.type === menuFormData.category)
                    .map(booth => (
                      <SelectItem key={booth.id} value={booth.id}>{booth.name}</SelectItem>
                    ))
                    }
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuDialogOpen(false)} className="border-slate-700 text-slate-300">
              Batal
            </Button>
            <Button onClick={handleSaveMenu} className="bg-amber-500 hover:bg-amber-600 text-black">
              {editingMenu ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booth Dialog */}
      <Dialog open={boothDialogOpen} onOpenChange={setBoothDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBooth ? 'Edit Booth' : 'Tambah Booth Baru'}</DialogTitle>
            <DialogDescription>
              {editingBooth ? 'Perbarui data booth' : 'Isi data booth baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nama Booth *</Label>
              <Input
                value={boothFormData.name}
                onChange={(e) => setBoothFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Booth A"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Tipe</Label>
                <Select 
                  value={boothFormData.type} 
                  onValueChange={(v) => setBoothFormData(prev => ({ ...prev, type: v as 'food' | 'drink' | 'both' }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="food">Makanan</SelectItem>
                    <SelectItem value="drink">Minuman</SelectItem>
                    <SelectItem value="both">Keduanya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select 
                  value={boothFormData.status} 
                  onValueChange={(v) => setBoothFormData(prev => ({ ...prev, status: v as 'active' | 'inactive' }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBoothDialogOpen(false)} className="border-slate-700 text-slate-300">
              Batal
            </Button>
            <Button onClick={handleSaveBooth} className="bg-amber-500 hover:bg-amber-600 text-black">
              {editingBooth ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {stockAdjustment.type === 'add' ? 'Tambah' : stockAdjustment.type === 'subtract' ? 'Kurangi' : 'Set'} Stok
            </DialogTitle>
            <DialogDescription>
              Menu: {stockAdjustment.menu?.name} (Stok saat ini: {stockAdjustment.menu?.stock})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Jumlah</Label>
              <Input
                type="number"
                value={stockAdjustment.amount}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Alasan</Label>
              <Textarea
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g., Restock dari vendor"
                className="bg-slate-800 border-slate-700 resize-none"
                rows={3}
              />
            </div>
            {stockAdjustment.menu && (
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-sm text-slate-400">Preview:</p>
                <p className="text-lg font-bold text-white">
                  {stockAdjustment.menu.stock} → {
                    stockAdjustment.type === 'add' 
                      ? stockAdjustment.menu.stock + stockAdjustment.amount
                      : stockAdjustment.type === 'subtract'
                      ? Math.max(0, stockAdjustment.menu.stock - stockAdjustment.amount)
                      : stockAdjustment.amount
                  }
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialogOpen(false)} className="border-slate-700 text-slate-300">
              Batal
            </Button>
            <Button onClick={handleStockAdjustment} className="bg-amber-500 hover:bg-amber-600 text-black">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Confirmation */}
      <AlertDialog open={deleteMenuDialogOpen} onOpenChange={setDeleteMenuDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Hapus Menu
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus menu <span className="text-amber-400 font-medium">"{editingMenu?.name}"</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMenu} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Booth Confirmation */}
      <AlertDialog open={deleteBoothDialogOpen} onOpenChange={setDeleteBoothDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Hapus Booth
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Apakah Anda yakin ingin menghapus booth <span className="text-amber-400 font-medium">"{editingBooth?.name}"</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooth} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
