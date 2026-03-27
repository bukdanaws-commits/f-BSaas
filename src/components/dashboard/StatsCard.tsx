'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  isLoading?: boolean
  variant?: 'default' | 'gradient'
  gradientFrom?: string
  gradientTo?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  isLoading = false,
  variant = 'default',
  gradientFrom = 'from-emerald-500',
  gradientTo = 'to-emerald-600',
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20 mt-2" />
        </CardContent>
      </Card>
    )
  }

  if (variant === 'gradient') {
    return (
      <Card
        className={cn(
          'relative overflow-hidden border-0 text-white',
          `bg-gradient-to-br ${gradientFrom} ${gradientTo}`,
          className
        )}
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {description && (
                <p className="text-xs opacity-75 mt-1">{description}</p>
              )}
            </div>
            <div className="p-3 rounded-full bg-white/20">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          {trend && (
            <div
              className={cn(
                'text-xs mt-3 flex items-center gap-1',
                trend.isPositive ? 'text-white' : 'text-red-200'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% dari bulan lalu</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              'text-xs mt-2 flex items-center gap-1',
              trend.isPositive ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% dari bulan lalu</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Stats Grid Component
interface StatsGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4 | 5 | 6
  className?: string
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  )
}
