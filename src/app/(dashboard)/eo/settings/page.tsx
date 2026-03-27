'use client'

import { Building2, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/mock-store'

export default function SettingsPage() {
  const currentUser = useAuthStore((state) => state.currentUser)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Organization */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 text-sm">Organization Name</Label>
              <p className="text-white font-medium">{currentUser?.tenant?.name}</p>
            </div>
            <div>
              <Label className="text-slate-400 text-sm">Status</Label>
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 mt-1">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser?.user.avatar_url || ''} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                {currentUser?.user.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium text-lg">{currentUser?.user.name}</p>
              <p className="text-slate-400">{currentUser?.user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
