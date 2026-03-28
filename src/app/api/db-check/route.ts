import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const results: {
    status: string
    connection: boolean
    supabase_url: string
    tables: { name: string; count: number; error?: string }[]
    errors: string[]
    total_tables: number
    missing_tables: string[]
  } = {
    status: 'checking',
    connection: false,
    supabase_url: supabaseUrl || 'NOT_SET',
    tables: [],
    errors: [],
    total_tables: 0,
    missing_tables: []
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    results.errors.push('Supabase URL or Service Key not configured')
    results.status = 'config_missing'
    return NextResponse.json(results, { status: 500 })
  }

  try {
    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test connection by querying users table
    const { error: testError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
    
    if (testError) {
      results.errors.push(`Connection test failed: ${testError.message}`)
      results.status = 'connection_failed'
      return NextResponse.json(results, { status: 500 })
    }
    
    results.connection = true
    results.status = 'connected'

    // Check all required tables
    const requiredTables = [
      'users',
      'tenants',
      'memberships',
      'credit_wallets',
      'credit_transactions',
      'events',
      'event_staff',
      'ticket_types',
      'participants',
      'checkins',
      'booths',
      'menu_categories',
      'menu_items',
      'claims',
      'display_queue',
      'scan_logs'
    ]

    for (const table of requiredTables) {
      try {
        const { count, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results.tables.push({ name: table, count: 0, error: error.message })
          results.missing_tables.push(table)
        } else {
          results.tables.push({ name: table, count: count || 0 })
        }
      } catch {
        results.tables.push({ name: table, count: 0, error: 'Does not exist' })
        results.missing_tables.push(table)
      }
    }

    results.total_tables = requiredTables.length
    results.status = results.missing_tables.length === 0 ? 'schema_valid' : 'schema_incomplete'

    return NextResponse.json(results)

  } catch (error) {
    results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    results.status = 'error'
    return NextResponse.json(results, { status: 500 })
  }
}
