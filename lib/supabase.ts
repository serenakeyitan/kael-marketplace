import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types for our database tables (we'll expand these as we create tables)
export type Database = {
  public: {
    Tables: {
      skills: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          category: string
          author_id: string
          author_name: string
          author_username: string
          author_avatar: string | null
          installs: number
          rating: number
          total_ratings: number
          conversations: number
          weekly_active_users: number
          github_url: string | null
          documentation: string | null
          icon: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['skills']['Row'], 'id' | 'created_at' | 'updated_at' | 'installs' | 'rating' | 'total_ratings' | 'conversations' | 'weekly_active_users'>
        Update: Partial<Database['public']['Tables']['skills']['Insert']>
      }
      installed_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          enabled: boolean
          last_used: string | null
          installed_at: string
        }
        Insert: Omit<Database['public']['Tables']['installed_skills']['Row'], 'id' | 'installed_at'>
        Update: Partial<Database['public']['Tables']['installed_skills']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          skill_id: string
          user_id: string
          user_name: string
          user_username: string
          user_avatar: string | null
          rating: number
          content: string
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at' | 'helpful_count'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      review_replies: {
        Row: {
          id: string
          review_id: string
          user_id: string
          user_name: string
          user_username: string
          user_avatar: string | null
          content: string
          helpful_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['review_replies']['Row'], 'id' | 'created_at' | 'helpful_count'>
        Update: Partial<Database['public']['Tables']['review_replies']['Insert']>
      }
      liked_skills: {
        Row: {
          id: string
          user_id: string
          skill_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['liked_skills']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['liked_skills']['Insert']>
      }
      bounties: {
        Row: {
          id: string
          title: string
          description: string
          prize_pool: number
          track: string
          status: 'active' | 'completed' | 'upcoming'
          deadline: string
          participant_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bounties']['Row'], 'id' | 'created_at' | 'participant_count'>
        Update: Partial<Database['public']['Tables']['bounties']['Insert']>
      }
      bounty_submissions: {
        Row: {
          id: string
          bounty_id: string
          skill_id: string
          user_id: string
          submitted_at: string
        }
        Insert: Omit<Database['public']['Tables']['bounty_submissions']['Row'], 'id' | 'submitted_at'>
        Update: Partial<Database['public']['Tables']['bounty_submissions']['Insert']>
      }
    }
  }
}