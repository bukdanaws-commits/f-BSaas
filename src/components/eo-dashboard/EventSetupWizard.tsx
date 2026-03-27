'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  Copy,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Loader2,
  Clock,
  Volume2,
  Coffee,
  Pizza
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Event } from '@/types/database'

interface EventSetupWizardProps {
  open: boolean
  onClose: () => void
  onSave: (event: Partial<Event>) => void
  initialData?: Event | null
  mode: 'create' | 'edit' | 'duplicate'
}

type Step = {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

const steps: Step[] = [
  { id: 'basic', title: 'Basic Info', description: 'Event name & description', icon: FileText },
  { id: 'date', title: 'Date & Location', description: 'When & where', icon: MapPin },
  { id: 'tickets', title: 'Tickets & Capacity', description: 'Ticket types & limits', icon: Ticket },
  { id: 'display', title: 'Display Settings', description: 'Check-in display config', icon: Palette },
  { id: 'fnb', title: 'F&B Settings', description: 'Food & drink claims', icon: Coffee },
  { id: 'preview', title: 'Preview', description: 'Review before save', icon: Eye },
]

const categories = [
  'Technology',
  'Business',
  'Music',
  'Sports',
  'Education',
  'Entertainment',
  'Conference',
  'Workshop',
  'Networking',
  'Other'
]

interface FormData {
  name: string
  title: string
  description: string
  banner_url: string
  category: string
  start_date: string
  end_date: string
  location: string
  capacity: number
  welcome_message: string
  display_duration: number
  enable_sound: boolean
  check_in_desks: number
  default_max_food_claims: number
  default_max_drink_claims: number
  storage_days: number
  status: 'draft' | 'active'
}

const defaultFormData: FormData = {
  name: '',
  title: '',
  description: '',
  banner_url: '',
  category: 'Technology',
  start_date: '',
  end_date: '',
  location: '',
  capacity: 500,
  welcome_message: 'Selamat Datang!',
  display_duration: 5,
  enable_sound: true,
  check_in_desks: 2,
  default_max_food_claims: 4,
  default_max_drink_claims: 2,
  storage_days: 15,
  status: 'draft'
}

export default function EventSetupWizard({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  mode 
}: EventSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JPEG, PNG, WebP, or GIF image',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive'
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'banner')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()

      if (result.success) {
        setFormData({ ...formData, banner_url: result.data.url })
        toast({
          title: 'Upload Successful',
          description: 'Banner image uploaded successfully',
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove banner
  const handleRemoveBanner = async () => {
    if (formData.banner_url && formData.banner_url.startsWith('/uploads/')) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(formData.banner_url)}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.error('Failed to delete file:', error)
      }
    }
    setFormData({ ...formData, banner_url: '' })
  }

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        title: initialData.title || '',
        description: initialData.description || '',
        banner_url: initialData.banner_url || '',
        category: initialData.category || 'Technology',
        start_date: initialData.start_date ? initialData.start_date.slice(0, 16) : '',
        end_date: initialData.end_date ? initialData.end_date.slice(0, 16) : '',
        location: initialData.location || '',
        capacity: initialData.capacity || 500,
        welcome_message: initialData.welcome_message || 'Selamat Datang!',
        display_duration: initialData.display_duration || 5,
        enable_sound: initialData.enable_sound ?? true,
        check_in_desks: initialData.check_in_desks || 2,
        default_max_food_claims: initialData.default_max_food_claims || 4,
        default_max_drink_claims: initialData.default_max_drink_claims || 2,
        storage_days: initialData.storage_days || 15,
        status: (mode === 'duplicate' ? 'draft' : initialData.status) as 'draft' | 'active'
      })
    } else {
      setFormData(defaultFormData)
    }
    setCurrentStep(0)
  }, [initialData, open, mode])

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      await onSave({ ...formData, status: 'draft' })
      toast({
        title: 'Draft Saved',
        description: 'Event saved as draft successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    try {
      await onSave({ ...formData, status: 'active' })
      toast({
        title: 'Event Published',
        description: 'Event has been published successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish event',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== '' && formData.category !== ''
      case 1:
        return formData.start_date !== '' && formData.location.trim() !== ''
      case 2:
        return formData.capacity > 0
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tech Summit Indonesia 2025"
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Tagline / Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Innovate. Transform. Lead."
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-300">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={4}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Banner Image</Label>
                <div className="flex gap-3">
                  <Input
                    value={formData.banner_url}
                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                    placeholder="https://example.com/banner.jpg or upload a file"
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    className="border-slate-700 text-slate-300 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-slate-500">JPEG, PNG, WebP, GIF • Max 5MB</p>
                {formData.banner_url && (
                  <div className="mt-3 relative rounded-lg overflow-hidden h-40 bg-slate-800 group">
                    <img 
                      src={formData.banner_url} 
                      alt="Banner preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveBanner}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )

      case 1: // Date & Location
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-slate-300">Start Date & Time *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-slate-300">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Jakarta Convention Center"
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div className="text-sm text-slate-400">
                    <p className="font-medium text-slate-300 mb-1">Event Duration Tips</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Set end date for multi-day events</li>
                      <li>Participants can check-in throughout the event duration</li>
                      <li>Data will be stored for {formData.storage_days} days after event ends</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 2: // Tickets & Capacity
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-slate-300">Maximum Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  min={1}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500">Total number of participants that can register</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="check_in_desks" className="text-slate-300">Number of Check-in Desks</Label>
                <Input
                  id="check_in_desks"
                  type="number"
                  value={formData.check_in_desks}
                  onChange={(e) => setFormData({ ...formData, check_in_desks: parseInt(e.target.value) || 1 })}
                  min={1}
                  max={20}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500">How many check-in counters/queues will be available</p>
              </div>

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">Ticket Types</CardTitle>
                  <CardDescription className="text-xs">
                    Configure ticket types after creating the event
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Ticket className="h-4 w-4" />
                    <span>You can add VIP, Regular, Student tickets later</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )

      case 3: // Display Settings
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome_message" className="text-slate-300">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  value={formData.welcome_message}
                  onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                  placeholder="Message displayed on check-in screen"
                  rows={2}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_duration" className="text-slate-300">Display Duration (seconds)</Label>
                  <Input
                    id="display_duration"
                    type="number"
                    value={formData.display_duration}
                    onChange={(e) => setFormData({ ...formData, display_duration: parseInt(e.target.value) || 5 })}
                    min={3}
                    max={30}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                  <p className="text-xs text-slate-500">How long participant info shows on screen</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage_days" className="text-slate-300">Data Storage Days</Label>
                  <Input
                    id="storage_days"
                    type="number"
                    value={formData.storage_days}
                    onChange={(e) => setFormData({ ...formData, storage_days: parseInt(e.target.value) || 15 })}
                    min={7}
                    max={90}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                  <p className="text-xs text-slate-500">Days to keep data after event ends</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="space-y-0.5">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Enable Sound Effects
                  </Label>
                  <p className="text-xs text-slate-500">Play sound on check-in</p>
                </div>
                <Switch
                  checked={formData.enable_sound}
                  onCheckedChange={(checked) => setFormData({ ...formData, enable_sound: checked })}
                />
              </div>
            </div>
          </motion.div>
        )

      case 4: // F&B Settings
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                    <Pizza className="h-4 w-4 text-orange-400" />
                    Food Claims
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="food_claims" className="text-slate-300">Max Food Claims per Participant</Label>
                    <Input
                      id="food_claims"
                      type="number"
                      value={formData.default_max_food_claims}
                      onChange={(e) => setFormData({ ...formData, default_max_food_claims: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={10}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/30 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-cyan-400" />
                    Drink Claims
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="drink_claims" className="text-slate-300">Max Drink Claims per Participant</Label>
                    <Input
                      id="drink_claims"
                      type="number"
                      value={formData.default_max_drink_claims}
                      onChange={(e) => setFormData({ ...formData, default_max_drink_claims: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={10}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Coffee className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div className="text-sm text-slate-400">
                    <p className="font-medium text-amber-300 mb-1">F&B Setup</p>
                    <p className="text-xs">
                      After creating the event, you can add F&B booths, menu categories, 
                      and menu items. Each participant will be able to claim up to the 
                      limits you set above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 5: // Preview
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <EventPreview formData={formData} />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-slate-900 border-slate-700 text-white overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl text-white">
                  {mode === 'create' && 'Create New Event'}
                  {mode === 'edit' && 'Edit Event'}
                  {mode === 'duplicate' && 'Duplicate Event'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {mode === 'create' && 'Set up your event in a few simple steps'}
                  {mode === 'edit' && 'Update your event details'}
                  {mode === 'duplicate' && 'Create a copy of this event'}
                </DialogDescription>
              </DialogHeader>
            </div>
            <Badge variant="outline" className="border-slate-600 text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 bg-slate-800" />

          {/* Step Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all",
                    isActive && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                    isCompleted && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    !isActive && !isCompleted && "bg-slate-800/50 text-slate-500 border border-slate-700"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6 h-[50vh]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save as Draft
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isSaving || !canProceed()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Publish Event
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Event Preview Component
function EventPreview({ formData }: { formData: FormData }) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/30 border-slate-700 overflow-hidden">
        {/* Banner */}
        {formData.banner_url ? (
          <div className="h-48 bg-slate-800 relative">
            <img 
              src={formData.banner_url} 
              alt="Event banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-slate-600" />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="mb-2 border-slate-600 text-slate-400">
                {formData.category}
              </Badge>
              <CardTitle className="text-2xl text-white">{formData.name || 'Event Name'}</CardTitle>
              {formData.title && (
                <p className="text-slate-400 mt-1">{formData.title}</p>
              )}
            </div>
            <Badge className={cn(
              formData.status === 'active' 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/20 text-amber-400 border-amber-500/20"
            )}>
              {formData.status === 'active' ? 'Active' : 'Draft'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span className="text-sm">
                {formData.start_date 
                  ? new Date(formData.start_date).toLocaleDateString('id-ID', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Date not set'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span className="text-sm truncate">{formData.location || 'Location not set'}</span>
            </div>
          </div>

          {formData.description && (
            <p className="text-sm text-slate-400 line-clamp-3">{formData.description}</p>
          )}

          <Separator className="bg-slate-700" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{formData.capacity.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Capacity</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formData.default_max_food_claims}</p>
              <p className="text-xs text-slate-500">Food Claims</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formData.default_max_drink_claims}</p>
              <p className="text-xs text-slate-500">Drink Claims</p>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Check-in Desks</span>
              <span className="text-white">{formData.check_in_desks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Display Duration</span>
              <span className="text-white">{formData.display_duration}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sound Effects</span>
              <Badge variant="outline" className={formData.enable_sound ? "border-emerald-500/20 text-emerald-400" : "border-slate-600 text-slate-400"}>
                {formData.enable_sound ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Data Storage</span>
              <span className="text-white">{formData.storage_days} days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
