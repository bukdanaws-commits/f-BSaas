import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

// Check if Supabase is configured
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY

// Demo users for development without Supabase
const demoUsers = [
  {
    id: 'demo-super-admin',
    email: 'superadmin@eventify.id',
    name: 'Super Admin',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
    isSuperAdmin: true,
    role: 'super_admin',
    tenant: null,
  },
  {
    id: 'demo-owner',
    email: 'owner@techconference.id',
    name: 'Budi Santoso',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi',
    isSuperAdmin: false,
    role: 'owner',
    tenant: {
      id: 'demo-tenant-1',
      name: 'Tech Conference Indonesia',
      slug: 'techconference',
      status: 'active',
    },
  },
  {
    id: 'demo-crew',
    email: 'crew1@techconference.id',
    name: 'Ahmad Wijaya',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmad',
    isSuperAdmin: false,
    role: 'crew',
    tenant: {
      id: 'demo-tenant-1',
      name: 'Tech Conference Indonesia',
      slug: 'techconference',
      status: 'active',
    },
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth - only if configured
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                scope: "openid email profile"
              }
            }
          })
        ]
      : []),
    
    // Demo credentials for development
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Login',
      credentials: {
        role: { label: 'Role', type: 'text', placeholder: 'owner' }
      },
      async authorize(credentials) {
        const role = credentials?.role || 'owner'
        const user = demoUsers.find(u => u.role === role)
        
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            isSuperAdmin: user.isSuperAdmin,
            role: user.role,
            tenant: user.tenant,
          }
        }
        
        return null
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For demo credentials, always allow
      if (account?.provider === 'demo') {
        return true
      }

      // For Google OAuth without Supabase, use demo mode
      if (account?.provider === 'google' && !isSupabaseConfigured) {
        // Find a demo user based on email or default to owner
        const demoUser = demoUsers.find(u => u.email === user.email) || demoUsers[1]
        user.id = demoUser.id
        user.isSuperAdmin = demoUser.isSuperAdmin
        user.role = demoUser.role
        user.tenant = demoUser.tenant
        return true
      }

      // For Google OAuth with Supabase configured
      if (account?.provider === 'google' && isSupabaseConfigured) {
        try {
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          // Check if user exists
          const { data: existingUser, error } = await supabase
            .from('users')
            .select(`
              *,
              memberships (
                *,
                tenants (*)
              )
            `)
            .eq('email', user.email)
            .single()

          if (existingUser && !error) {
            user.id = existingUser.id
            user.isSuperAdmin = existingUser.is_super_admin
            
            if (existingUser.memberships && existingUser.memberships.length > 0) {
              const membership = existingUser.memberships[0]
              user.role = membership.role
              user.tenant = membership.tenants
            } else {
              user.role = existingUser.is_super_admin ? 'super_admin' : 'owner'
              user.tenant = null
            }
          } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                email: user.email!,
                name: user.name,
                avatar_url: user.image,
                google_id: account.providerAccountId,
                is_super_admin: false,
              })
              .select()
              .single()

            if (createError || !newUser) {
              console.error('Error creating user:', createError)
              return false
            }

            user.id = newUser.id
            user.isSuperAdmin = false
            user.role = 'owner'
            user.tenant = null
          }

          return true
        } catch (err) {
          console.error('SignIn error:', err)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.isSuperAdmin = user.isSuperAdmin
        token.role = user.role
        token.tenant = user.tenant
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
        session.user.role = token.role as string
        session.user.tenant = token.tenant as any
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-for-development',
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
