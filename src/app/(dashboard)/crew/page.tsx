'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  CheckCircle, 
  Utensils, 
  Monitor, 
  Users,
  TrendingUp,
  Coffee,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function CrewDashboard() {
  const [stats] = useState({
    totalParticipants: 250,
    checkedIn: 45,
    notCheckedIn: 205,
    totalFoodClaims: 120,
    totalDrinkClaims: 85,
    totalClaims: 205,
    checkInRate: 18,
  })

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Peserta</p>
                <p className="text-3xl font-bold">{stats.totalParticipants}</p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Sudah Check-in</p>
                <p className="text-3xl font-bold">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-200" />
            </div>
            <div className="mt-3">
              <Progress value={stats.checkInRate} className="h-2 bg-emerald-700" />
              <p className="text-xs mt-1 text-emerald-100">{stats.checkInRate}% hadir</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Food Claims</p>
                <p className="text-3xl font-bold">{stats.totalFoodClaims}</p>
              </div>
              <Utensils className="h-10 w-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm">Drink Claims</p>
                <p className="text-3xl font-bold">{stats.totalDrinkClaims}</p>
              </div>
              <Coffee className="h-10 w-10 text-cyan-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/crew/checkin">
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-emerald-200 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Check-in Peserta</CardTitle>
                  <CardDescription>Scan QR untuk check-in</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/crew/claim">
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-orange-200 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <Utensils className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Claim Makanan</CardTitle>
                  <CardDescription>Proses klaim food/drink</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/crew/display">
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Monitor className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">Display Screen</CardTitle>
                  <CardDescription>Welcome monitor</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Progress Kehadiran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Check-in Rate</span>
            <span className="text-2xl font-bold text-emerald-600">{stats.checkInRate}%</span>
          </div>
          <Progress value={stats.checkInRate} className="h-4" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{stats.checkedIn}</p>
              <p className="text-sm text-muted-foreground">Hadir</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-600">{stats.notCheckedIn}</p>
              <p className="text-sm text-muted-foreground">Belum Hadir</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
