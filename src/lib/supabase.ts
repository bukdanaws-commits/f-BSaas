import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for public/anonymous access (browser)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client with service role (server-side only, bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback to anon client if service key not available

// Helper to get user session
export async function getSession(authToken?: string) {
  if (!authToken) return null
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authToken)
  
  if (error || !user) return null
  return user
}
