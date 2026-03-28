'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface DbCheckResult {
  status: string
  connection: boolean
  supabase_url: string
  tables: { name: string; count: number; error?: string }[]
  errors: string[]
  total_tables: number
  missing_tables: string[]
}

export default function DbCheckPage() {
  const [result, setResult] = useState<DbCheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkDatabase = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/db-check')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  const getStatusBadge = () => {
    if (!result) return null
    
    switch (result.status) {
      case 'schema_valid':
        return <Badge className="bg-green-500">✅ Schema Valid</Badge>
      case 'schema_incomplete':
        return <Badge className="bg-yellow-500">⚠️ Schema Incomplete</Badge>
      case 'connected':
        return <Badge className="bg-blue-500">🔗 Connected</Badge>
      case 'connection_failed':
        return <Badge className="bg-red-500">❌ Connection Failed</Badge>
      default:
        return <Badge variant="secondary">{result.status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Database Schema Check</h1>
            <p className="text-muted-foreground">Verifikasi koneksi dan schema database Supabase</p>
          </div>
          <Button onClick={checkDatabase} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>

        {loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>Checking database connection...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-red-500">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-red-500">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <>
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Connection Status</CardTitle>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Supabase URL</p>
                    <p className="font-mono text-sm truncate">{result.supabase_url}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Connection</p>
                    <div className="flex items-center gap-2">
                      {result.connection ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>{result.connection ? 'Connected' : 'Failed'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tables Required</p>
                    <p className="text-2xl font-bold">{result.total_tables}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tables Found</p>
                    <p className="text-2xl font-bold">{result.total_tables - result.missing_tables.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tables Status */}
            <Card>
              <CardHeader>
                <CardTitle>Tables Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.tables.map((table) => (
                    <div
                      key={table.name}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        table.error ? 'bg-red-50 dark:bg-red-950/20' : 'bg-green-50 dark:bg-green-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {table.error ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-medium">{table.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {table.error ? (
                          <Badge variant="destructive">{table.error}</Badge>
                        ) : (
                          <Badge variant="outline">{table.count} rows</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Errors */}
            {result.errors.length > 0 && (
              <Card className="border-red-500">
                <CardHeader>
                  <CardTitle className="text-red-500">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.errors.map((err, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-red-600">{err}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Missing Tables */}
            {result.missing_tables.length > 0 && (
              <Card className="border-yellow-500">
                <CardHeader>
                  <CardTitle className="text-yellow-600">Missing Tables ({result.missing_tables.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_tables.map((table) => (
                      <Badge key={table} variant="destructive">{table}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
