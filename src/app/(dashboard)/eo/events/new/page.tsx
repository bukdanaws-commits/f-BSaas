'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Settings,
  Sparkles,
  CheckCircle2,
  Upload,
  X,
  Plus,
  Trash2,
  Info,
  Clock,
  Volume2,
  MonitorPlay,
  Utensils
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useDataStore, useAuthStore } from '@/stores/mock-store'
import { EVENT_CATEGORIES } from '@/config/menu'

// Steps configuration
const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Event details', icon: Calendar },
  { id: 2, title: 'Date & Location', description: 'When & where', icon: MapPin },
  { id: 3, title: 'Capacity & Tickets', description: 'Participant limits', icon: Users },
  { id: 4, title: 'Settings', description: 'Check-in & F&B', icon: Settings },
  { id: 5, title: 'Review', description: 'Confirm details', icon: CheckCircle2 },
]

// Form data type
interface EventFormData {
  // Basic Info
  name: string
  title: string
  description: string
  category: string
  banner_url: string

  // Date & Location
  start_date: string
  end_date: string
  location: string

  // Capacity
  capacity: number

  // Settings
  welcome_message: string
  display_duration: number
  enable_sound: boolean
  check_in_desks: number
  default_max_food_claims: number
  default_max_drink_claims: number
  storage_days: number

  // Ticket Types
  ticketTypes: Array<{
    id: string
    name: string
    price: number
    quota: number
    features: Record<string, boolean | number>
  }>
}

const initialFormData: EventFormData = {
  name: '',
  title: '',
  description: '',
  category: '',
  banner_url: '',
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
  ticketTypes: [
    { id: '1', name: 'Regular', price: 0, quota: 500, features: {} }
  ]
}

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const currentUser = useAuthStore((state) => state.currentUser)
  const addEvent = useDataStore((state) => state.addEvent)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EventFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)

  // Progress calculation
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100

  // Handlers
  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addTicketType = () => {
    const newId = String(formData.ticketTypes.length + 1)
    updateFormData({
      ticketTypes: [...formData.ticketTypes, {
        id: newId,
        name: '',
        price: 0,
        quota: 0,
        features: {}
      }]
    })
  }

  const removeTicketType = (id: string) => {
    if (formData.ticketTypes.length <= 1) return
    updateFormData({
      ticketTypes: formData.ticketTypes.filter(t => t.id !== id)
    })
  }

  const updateTicketType = (id: string, updates: Partial<EventFormData['ticketTypes'][0]>) => {
    updateFormData({
      ticketTypes: formData.ticketTypes.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
    })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.category)
      case 2:
        return !!(formData.start_date && formData.location)
      case 3:
        return formData.capacity > 0 && formData.ticketTypes.every(t => t.name && t.quota > 0)
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!currentUser?.tenant) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const eventId = `event-${Date.now()}`
      setCreatedEventId(eventId)
      setShowSuccessDialog(true)

      toast({
        title: 'Event Created!',
        description: `"${formData.name}" has been created successfully`,
      })

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <DateLocationStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <CapacityTicketsStep
          formData={formData}
          updateFormData={updateFormData}
          addTicketType={addTicketType}
          removeTicketType={removeTicketType}
          updateTicketType={updateTicketType}
        />
      case 4:
        return <SettingsStep formData={formData} updateFormData={updateFormData} />
      case 5:
        return <ReviewStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/eo/events">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Event</h1>
              <p className="text-slate-400 text-sm">Set up your event step by step</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-slate-400">Step {currentStep} of {STEPS.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2 bg-slate-700" indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-colors",
                    isActive ? "text-amber-400" : isCompleted ? "text-emerald-400" : "text-slate-500"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium",
                    isActive && "bg-amber-500/20 border border-amber-500/50",
                    isCompleted && "bg-emerald-500/20",
                    !isActive && !isCompleted && "bg-slate-700"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3 w-3" />}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-medium"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      ◌
                    </motion.div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Event
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </motion.div>
              </div>
              <DialogTitle className="text-center text-xl">Event Created!</DialogTitle>
              <DialogDescription className="text-center text-slate-400">
                Your event &quot;{formData.name}&quot; has been created successfully.
                <br /><br />
                What would you like to do next?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Link href="/eo/events" className="w-full">
                <Button variant="outline" className="w-full border-slate-700 text-slate-300">
                  Back to Events
                </Button>
              </Link>
              <Link href={createdEventId ? `/eo/participants?event=${createdEventId}` : '/eo/participants'} className="w-full">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                  <Users className="h-4 w-4 mr-2" />
                  Add Participants
                </Button>
              </Link>
              <Link href="/eo/fnb-settings" className="w-full">
                <Button variant="secondary" className="w-full">
                  <Utensils className="h-4 w-4 mr-2" />
                  Setup F&B
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// ==================== STEP COMPONENTS ====================

interface StepProps {
  formData: EventFormData
  updateFormData: (updates: Partial<EventFormData>) => void
}

function BasicInfoStep({ formData, updateFormData }: StepProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Tell us about your event. Fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">
            Event Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Tech Summit Indonesia 2024"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
          />
          <p className="text-xs text-slate-500">This will be displayed as the main title</p>
        </div>

        {/* Event Title/Tagline */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-300">
            Tagline / Subtitle
          </Label>
          <Input
            id="title"
            placeholder="e.g., Innovate. Transform. Lead."
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-slate-300">
            Category <span className="text-red-400">*</span>
          </Label>
          <Select value={formData.category} onValueChange={(v) => updateFormData({ category: v })}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 focus:border-amber-500">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {EVENT_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-300">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your event..."
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={4}
            className="bg-slate-900/50 border-slate-700 focus:border-amber-500 resize-none"
          />
        </div>

        {/* Banner URL */}
        <div className="space-y-2">
          <Label htmlFor="banner_url" className="text-slate-300">
            Banner Image URL
          </Label>
          <div className="flex gap-3">
            <Input
              id="banner_url"
              placeholder="https://example.com/image.jpg"
              value={formData.banner_url}
              onChange={(e) => updateFormData({ banner_url: e.target.value })}
              className="flex-1 bg-slate-900/50 border-slate-700 focus:border-amber-500"
            />
            <Button variant="outline" className="border-slate-700 text-slate-300">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {formData.banner_url && (
            <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 h-32">
              <img
                src={formData.banner_url}
                alt="Banner preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function DateLocationStep({ formData, updateFormData }: StepProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-amber-500" />
          Date & Location
        </CardTitle>
        <CardDescription>
          When and where will your event take place?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-slate-300">
              Start Date <span className="text-red-400">*</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => updateFormData({ start_date: e.target.value })}
              className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date" className="text-slate-300">
              End Date
            </Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => updateFormData({ end_date: e.target.value })}
              className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-slate-300">
            Location <span className="text-red-400">*</span>
          </Label>
          <Input
            id="location"
            placeholder="e.g., Jakarta Convention Center"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
          />
          <p className="text-xs text-slate-500">Enter the venue name or address</p>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-medium text-amber-400 mb-1">Pro Tip</p>
              <p>Set your event dates carefully. You can edit them later, but participants may have already made plans based on the original dates.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CapacityTicketsStepProps extends StepProps {
  addTicketType: () => void
  removeTicketType: (id: string) => void
  updateTicketType: (id: string, updates: Partial<EventFormData['ticketTypes'][0]>) => void
}

function CapacityTicketsStep({ formData, updateFormData, addTicketType, removeTicketType, updateTicketType }: CapacityTicketsStepProps) {
  const totalQuota = formData.ticketTypes.reduce((sum, t) => sum + t.quota, 0)

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-500" />
          Capacity & Ticket Types
        </CardTitle>
        <CardDescription>
          Set participant limits and define ticket categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Capacity */}
        <div className="space-y-2">
          <Label htmlFor="capacity" className="text-slate-300">
            Total Event Capacity <span className="text-red-400">*</span>
          </Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            value={formData.capacity}
            onChange={(e) => updateFormData({ capacity: parseInt(e.target.value) || 0 })}
            className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
          />
          <p className="text-xs text-slate-500">Maximum number of participants allowed</p>
        </div>

        <Separator className="bg-slate-700" />

        {/* Ticket Types */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300">Ticket Types</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTicketType}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Type
            </Button>
          </div>

          <div className="space-y-3">
            {formData.ticketTypes.map((ticket, index) => (
              <div
                key={ticket.id}
                className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Name</Label>
                      <Input
                        placeholder="e.g., VIP"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(ticket.id, { name: e.target.value })}
                        className="bg-slate-800 border-slate-700 h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Price (Rp)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(ticket.id, { price: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-slate-700 h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Quota</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={ticket.quota}
                        onChange={(e) => updateTicketType(ticket.id, { quota: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-slate-700 h-9"
                      />
                    </div>
                  </div>
                  {formData.ticketTypes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTicketType(ticket.id)}
                      className="text-red-400 hover:bg-red-500/10 h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quota Summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 text-sm">
            <span className="text-slate-400">Total Quota:</span>
            <span className={cn(
              "font-medium",
              totalQuota > formData.capacity ? "text-red-400" : "text-white"
            )}>
              {totalQuota.toLocaleString()} / {formData.capacity.toLocaleString()}
            </span>
          </div>
          {totalQuota > formData.capacity && (
            <p className="text-xs text-red-400">Total quota exceeds event capacity</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SettingsStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-4">
      {/* Display Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <MonitorPlay className="h-5 w-5 text-amber-500" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Configure how participants appear on the display screen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="welcome_message" className="text-slate-300">
              Welcome Message
            </Label>
            <Input
              id="welcome_message"
              placeholder="Welcome to our event!"
              value={formData.welcome_message}
              onChange={(e) => updateFormData({ welcome_message: e.target.value })}
              className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Duration */}
            <div className="space-y-2">
              <Label htmlFor="display_duration" className="text-slate-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Display Duration (seconds)
              </Label>
              <Input
                id="display_duration"
                type="number"
                min={1}
                max={30}
                value={formData.display_duration}
                onChange={(e) => updateFormData({ display_duration: parseInt(e.target.value) || 5 })}
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
              />
            </div>

            {/* Check-in Desks */}
            <div className="space-y-2">
              <Label htmlFor="check_in_desks" className="text-slate-300">
                Check-in Desks
              </Label>
              <Input
                id="check_in_desks"
                type="number"
                min={1}
                max={10}
                value={formData.check_in_desks}
                onChange={(e) => updateFormData({ check_in_desks: parseInt(e.target.value) || 1 })}
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Enable Sound */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-slate-400" />
              <div>
                <Label className="text-slate-300">Enable Sound Effects</Label>
                <p className="text-xs text-slate-500">Play sound on check-in</p>
              </div>
            </div>
            <Switch
              checked={formData.enable_sound}
              onCheckedChange={(checked) => updateFormData({ enable_sound: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* F&B Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Utensils className="h-5 w-5 text-amber-500" />
            F&B Defaults
          </CardTitle>
          <CardDescription>
            Default food and drink claim limits for participants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_max_food_claims" className="text-slate-300">
                Max Food Claims
              </Label>
              <Input
                id="default_max_food_claims"
                type="number"
                min={0}
                value={formData.default_max_food_claims}
                onChange={(e) => updateFormData({ default_max_food_claims: parseInt(e.target.value) || 0 })}
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_max_drink_claims" className="text-slate-300">
                Max Drink Claims
              </Label>
              <Input
                id="default_max_drink_claims"
                type="number"
                min={0}
                value={formData.default_max_drink_claims}
                onChange={(e) => updateFormData({ default_max_drink_claims: parseInt(e.target.value) || 0 })}
                className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Settings */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <Settings className="h-5 w-5 text-amber-500" />
            Data Retention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="storage_days" className="text-slate-300">
              Data Storage Period (days)
            </Label>
            <Input
              id="storage_days"
              type="number"
              min={1}
              max={365}
              value={formData.storage_days}
              onChange={(e) => updateFormData({ storage_days: parseInt(e.target.value) || 15 })}
              className="bg-slate-900/50 border-slate-700 focus:border-amber-500"
            />
            <p className="text-xs text-slate-500">
              Participant data will be automatically deleted after this period following the event
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReviewStep({ formData }: { formData: EventFormData }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-amber-500" />
          Review Your Event
        </CardTitle>
        <CardDescription>
          Please review all details before creating your event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-400 uppercase">Basic Information</h4>
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{formData.name}</h3>
                {formData.title && <p className="text-slate-400">{formData.title}</p>}
              </div>
              {formData.category && (
                <Badge variant="outline" className="border-slate-600 text-slate-300">
                  {formData.category}
                </Badge>
              )}
            </div>
            {formData.description && (
              <p className="text-sm text-slate-400">{formData.description}</p>
            )}
          </div>
        </div>

        {/* Date & Location */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-400 uppercase">Date & Location</h4>
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Date</p>
                <p className="text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  {formData.start_date ? new Date(formData.start_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  {formData.location || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity & Tickets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-400 uppercase">Capacity & Tickets</h4>
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Capacity</span>
              <span className="text-white font-medium">{formData.capacity.toLocaleString()}</span>
            </div>
            <Separator className="bg-slate-700" />
            <div className="space-y-2">
              {formData.ticketTypes.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{ticket.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">
                      Rp {ticket.price.toLocaleString()}
                    </span>
                    <span className="text-white">
                      {ticket.quota.toLocaleString()} pax
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-400 uppercase">Settings</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
              <p className="text-xs text-slate-500">Check-in Desks</p>
              <p className="text-lg font-semibold text-white">{formData.check_in_desks}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
              <p className="text-xs text-slate-500">Display Time</p>
              <p className="text-lg font-semibold text-white">{formData.display_duration}s</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
              <p className="text-xs text-slate-500">Max Food</p>
              <p className="text-lg font-semibold text-white">{formData.default_max_food_claims}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-center">
              <p className="text-xs text-slate-500">Max Drink</p>
              <p className="text-lg font-semibold text-white">{formData.default_max_drink_claims}</p>
            </div>
          </div>
        </div>

        {/* Credits Info */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-medium text-amber-400 mb-1">Credit Usage</p>
              <p>Creating this event will use <span className="text-white font-medium">50 credits</span> from your balance.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
