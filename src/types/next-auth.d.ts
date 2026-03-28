import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isSuperAdmin: boolean
      role: string
      tenant?: {
        id: string
        name: string
        slug: string | null
        status: string
      } | null
    }
  }

  interface User {
    id: string
    isSuperAdmin: boolean
    role: string
    tenant?: {
      id: string
      name: string
      slug: string | null
      status: string
    } | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    isSuperAdmin: boolean
    role: string
    tenant?: {
      id: string
      name: string
      slug: string | null
      status: string
    } | null
  }
}
