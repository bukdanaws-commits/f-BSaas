'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Users, CheckCircle, Volume2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Mock queue data
const INITIAL_QUEUE = [
  { id: '1', name: 'Ahmad Fauzi', photoUrl: null, checkedInAt: new Date() },
  { id: '2', name: 'Siti Rahayu', photoUrl: null, checkedInAt: new Date() },
  { id: '3', name: 'Budi Santoso', photoUrl: null, checkedInAt: new Date() },
]

export default function DisplayPage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stats, setStats] = useState({ total: 250, checkedIn: 45 })

  // Auto-display next person
  useEffect(() => {
    if (!isPlaying || queue.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % queue.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isPlaying, queue.length])

  const currentPerson = queue[currentIndex]

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Control Panel */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-blue-500" />
                Display Monitor
              </CardTitle>
              <CardDescription>Welcome screen untuk peserta yang baru check-in</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {stats.checkedIn} / {stats.total}
              </Badge>
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className={cn(
                  isPlaying 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {isPlaying ? 'Stop' : 'Start'} Display
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Full Screen Display */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        {currentPerson && isPlaying ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPerson.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-[#47b2e4] to-[#37517e] flex items-center justify-center shadow-2xl shadow-[#47b2e4]/30 mb-8"
              >
                <span className="text-7xl font-bold text-white">
                  {currentPerson.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-6xl font-bold text-white mb-4"
              >
                {currentPerson.name}
              </motion.h1>

              {/* Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <p className="text-2xl text-[#47b2e4] font-medium">Selamat Datang!</p>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>Check-in Berhasil</span>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <Monitor className="h-24 w-24 text-slate-600 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Display</h2>
            <p className="text-slate-400 mb-6">Klik "Start Display" untuk memulai welcome screen</p>
            {!isPlaying && queue.length > 0 && (
              <div className="text-slate-500">
                <p>{queue.length} peserta dalam antrian</p>
              </div>
            )}
          </div>
        )}

        {/* Sound Indicator */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 right-4 flex items-center gap-2 text-slate-400"
          >
            <Volume2 className="h-4 w-4" />
            <span className="text-xs">Sound On</span>
          </motion.div>
        )}
      </div>

      {/* Queue Preview */}
      {isPlaying && queue.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Next in Queue</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {queue.slice(currentIndex + 1, currentIndex + 4).map((person, idx) => (
              <div
                key={person.id}
                className="flex-shrink-0 flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600">
                  {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <span className="text-sm font-medium">{person.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
