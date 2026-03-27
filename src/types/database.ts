export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          google_id: string | null
          is_super_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          google_id?: string | null
          is_super_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          google_id?: string | null
          is_super_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string | null
          owner_id: string | null
          status: string
          verified_at: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          owner_id?: string | null
          status?: string
          verified_at?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          owner_id?: string | null
          status?: string
          verified_at?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          role?: string
          created_at?: string
        }
      }
      credit_wallets: {
        Row: {
          id: string
          tenant_id: string
          balance: number
          bonus_balance: number
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          balance?: number
          bonus_balance?: number
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          balance?: number
          bonus_balance?: number
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          tenant_id: string
          type: string
          amount: number
          reference_type: string | null
          reference_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          type: string
          amount: number
          reference_type?: string | null
          reference_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          type?: string
          amount?: number
          reference_type?: string | null
          reference_id?: string | null
          description?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          tenant_id: string
          name: string
          title: string | null
          description: string | null
          banner_url: string | null
          start_date: string | null
          end_date: string | null
          location: string | null
          category: string | null
          capacity: number
          welcome_message: string | null
          display_duration: number
          enable_sound: boolean
          check_in_desks: number
          default_max_food_claims: number
          default_max_drink_claims: number
          storage_days: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          title?: string | null
          description?: string | null
          banner_url?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          category?: string | null
          capacity?: number
          welcome_message?: string | null
          display_duration?: number
          enable_sound?: boolean
          check_in_desks?: number
          default_max_food_claims?: number
          default_max_drink_claims?: number
          storage_days?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          title?: string | null
          description?: string | null
          banner_url?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          category?: string | null
          capacity?: number
          welcome_message?: string | null
          display_duration?: number
          enable_sound?: boolean
          check_in_desks?: number
          default_max_food_claims?: number
          default_max_drink_claims?: number
          storage_days?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_staff: {
        Row: {
          id: string
          event_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          price: number
          quota: number
          features: Json | null
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          price?: number
          quota?: number
          features?: Json | null
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          price?: number
          quota?: number
          features?: Json | null
        }
      }
      participants: {
        Row: {
          id: string
          tenant_id: string
          event_id: string
          name: string
          email: string
          phone: string | null
          ticket_type_id: string | null
          qr_code: string
          original_photo_url: string | null
          ai_photo_url: string | null
          bio: string | null
          ai_generation_status: string
          ai_generated_at: string | null
          is_checked_in: boolean
          checked_in_at: string | null
          checkin_count: number
          food_claims: number
          drink_claims: number
          max_food_claims: number
          max_drink_claims: number
          is_active: boolean
          is_blacklisted: boolean
          meta: Json | null
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          event_id: string
          name: string
          email: string
          phone?: string | null
          ticket_type_id?: string | null
          qr_code: string
          original_photo_url?: string | null
          ai_photo_url?: string | null
          bio?: string | null
          ai_generation_status?: string
          ai_generated_at?: string | null
          is_checked_in?: boolean
          checked_in_at?: string | null
          checkin_count?: number
          food_claims?: number
          drink_claims?: number
          max_food_claims?: number
          max_drink_claims?: number
          is_active?: boolean
          is_blacklisted?: boolean
          meta?: Json | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          event_id?: string
          name?: string
          email?: string
          phone?: string | null
          ticket_type_id?: string | null
          qr_code?: string
          original_photo_url?: string | null
          ai_photo_url?: string | null
          bio?: string | null
          ai_generation_status?: string
          ai_generated_at?: string | null
          is_checked_in?: boolean
          checked_in_at?: string | null
          checkin_count?: number
          food_claims?: number
          drink_claims?: number
          max_food_claims?: number
          max_drink_claims?: number
          is_active?: boolean
          is_blacklisted?: boolean
          meta?: Json | null
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      checkins: {
        Row: {
          id: string
          event_id: string
          participant_id: string
          operator_id: string | null
          desk_number: number
          checked_in_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_id: string
          operator_id?: string | null
          desk_number?: number
          checked_in_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_id?: string
          operator_id?: string | null
          desk_number?: number
          checked_in_at?: string
        }
      }
      booths: {
        Row: {
          id: string
          event_id: string
          name: string
          type: string
          is_active: boolean
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          type: string
          is_active?: boolean
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          type?: string
          is_active?: boolean
        }
      }
      menu_categories: {
        Row: {
          id: string
          event_id: string
          name: string
          type: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          type: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          type?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          event_id: string
          category_id: string | null
          name: string
          stock: number
          is_active: boolean
        }
        Insert: {
          id?: string
          event_id: string
          category_id?: string | null
          name: string
          stock?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          event_id?: string
          category_id?: string | null
          name?: string
          stock?: number
          is_active?: boolean
        }
      }
      claims: {
        Row: {
          id: string
          event_id: string
          participant_id: string
          menu_item_id: string
          booth_id: string | null
          claimed_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_id: string
          menu_item_id: string
          booth_id?: string | null
          claimed_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_id?: string
          menu_item_id?: string
          booth_id?: string | null
          claimed_at?: string
        }
      }
      display_queue: {
        Row: {
          id: string
          event_id: string
          participant_id: string | null
          name: string
          photo_url: string | null
          is_displayed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          participant_id?: string | null
          name: string
          photo_url?: string | null
          is_displayed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          participant_id?: string | null
          name?: string
          photo_url?: string | null
          is_displayed?: boolean
          created_at?: string
        }
      }
      scan_logs: {
        Row: {
          id: string
          tenant_id: string
          event_id: string | null
          participant_id: string | null
          type: string | null
          result: string | null
          device: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          event_id?: string | null
          participant_id?: string | null
          type?: string | null
          result?: string | null
          device?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          event_id?: string | null
          participant_id?: string | null
          type?: string | null
          result?: string | null
          device?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific types
export type User = Tables<'users'>
export type Tenant = Tables<'tenants'>
export type Membership = Tables<'memberships'>
export type CreditWallet = Tables<'credit_wallets'>
export type CreditTransaction = Tables<'credit_transactions'>
export type Event = Tables<'events'>
export type EventStaff = Tables<'event_staff'>
export type TicketType = Tables<'ticket_types'>
export type Participant = Tables<'participants'>
export type Checkin = Tables<'checkins'>
export type Booth = Tables<'booths'>
export type MenuCategory = Tables<'menu_categories'>
export type MenuItem = Tables<'menu_items'>
export type Claim = Tables<'claims'>
export type DisplayQueue = Tables<'display_queue'>
export type ScanLog = Tables<'scan_logs'>
