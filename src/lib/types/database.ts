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
      lists: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          is_public: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      list_items: {
        Row: {
          id: string
          list_id: string
          race_id: string
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          race_id: string
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          race_id?: string
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      list_likes: {
        Row: {
          id: string
          list_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          created_at?: string
        }
      }
      list_follows: {
        Row: {
          id: string
          list_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          created_at?: string
        }
      }
      list_comments: {
        Row: {
          id: string
          list_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      races: {
        Row: {
          id: string
          name: string
          date: string
          circuit_name: string
          circuit_location: string
          circuit_country: string
          poster_url: string | null
          season: number
          round: number
          status: 'upcoming' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          circuit_name: string
          circuit_location: string
          circuit_country: string
          poster_url?: string | null
          season: number
          round: number
          status: 'upcoming' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          circuit_name?: string
          circuit_location?: string
          circuit_country?: string
          poster_url?: string | null
          season?: number
          round?: number
          status?: 'upcoming' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      create_list: {
        Args: {
          p_title: string
          p_description?: string
          p_is_public?: boolean
        }
        Returns: string
      }
      get_popular_lists: {
        Args: {
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          owner_id: string
          owner_username: string
          owner_avatar_url: string
          title: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          race_count: number
          like_count: number
          comment_count: number
          is_liked: boolean
        }[]
      }
      get_list_details: {
        Args: {
          p_list_id: string
        }
        Returns: {
          id: string
          owner_id: string
          owner_username: string
          owner_avatar_url: string
          title: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
          race_count: number
          like_count: number
          comment_count: number
          is_liked: boolean
        }
      }
      add_race_to_list: {
        Args: {
          p_list_id: string
          p_race_id: number
          p_note?: string
        }
        Returns: string
      }
      reorder_list_items: {
        Args: {
          p_list_id: string
          p_item_orders: Json
        }
        Returns: void
      }
      toggle_list_like: {
        Args: {
          p_list_id: string
        }
        Returns: boolean
      }
    }
  }
} 