'use client'

import { useState } from 'react'
import { Building2, Search, MoreVertical, Eye, CheckCircle, XCircle, Calendar, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const MOCK_TENANTS = [
  { id: '1', name: 'PT Event Organizer Indonesia', slug: 'eoi', status: 'active', owner: 'John Doe', email: 'john@eoi.com', events: 12, credits: 5250, revenue: 2500000, createdAt: '2024-01-15' },
  { id: '2', name: 'Creative Events ID', slug: 'creative', status: 'active', owner: 'Jane Smith', email: 'jane@creative.id', events: 8, credits: 3200, revenue: 1500000, createdAt: '2024-02-20' },
  { id: '3', name: 'Gathering Corp', slug: 'gathering', status: 'pending', owner: 'Bob Wilson', email: 'bob@gathering.com', events: 0, credits: 550, revenue: 0, createdAt: '2024-03-10' },
  { id: '4', name: 'Tech Conference Pro', slug: 'techconf', status: 'suspended', owner: 'Alice Chen', email: 'alice@techconf.id', events: 3, credits: 0, revenue: 500000, createdAt: '2024-01-05' },
]

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTenants = MOCK_TENANTS.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Event Organizer</h1>
          <p className="text-muted-foreground">Manage all registered EO tenants</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search EO..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tenant List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="overflow-hidden">
            <div className={cn(
              "h-1",
              tenant.status === 'active' ? 'bg-emerald-500' :
              tenant.status === 'pending' ? 'bg-amber-500' :
              'bg-red-500'
            )} />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#47b2e4] to-[#37517e] flex items-center justify-center text-white font-bold">
                    {tenant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription>{tenant.email}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {tenant.status === 'pending' && (
                      <DropdownMenuItem className="text-emerald-600">
                        <CheckCircle className="h-4 w-4 mr-2" /> Approve
                      </DropdownMenuItem>
                    )}
                    {tenant.status === 'active' && (
                      <DropdownMenuItem className="text-red-600">
                        <XCircle className="h-4 w-4 mr-2" /> Suspend
                      </DropdownMenuItem>
                    )}
                    {tenant.status === 'suspended' && (
                      <DropdownMenuItem className="text-emerald-600">
                        <CheckCircle className="h-4 w-4 mr-2" /> Reactivate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Owner</span>
                <span className="font-medium">{tenant.owner}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{tenant.events}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#47b2e4]">{tenant.credits.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Credits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">Rp {(tenant.revenue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge variant="outline" className={cn(
                  tenant.status === 'active' ? 'border-emerald-500 text-emerald-600' :
                  tenant.status === 'pending' ? 'border-amber-500 text-amber-600' :
                  'border-red-500 text-red-600'
                )}>
                  {tenant.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Joined {new Date(tenant.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
