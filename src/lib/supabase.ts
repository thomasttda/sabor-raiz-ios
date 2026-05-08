import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
})

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string
          category: string
          ingredients: string[]
          available: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_email: string | null
          items: OrderItem[]
          subtotal: number
          delivery_fee: number
          discount: number
          total: number
          status: OrderStatus
          created_at: string
          user_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      banners: {
        Row: {
          id: string
          image_url: string
          title: string
          active: boolean
          order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['banners']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['banners']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string
          address: string
          role: 'customer' | 'admin'
          total_spent: number
          order_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'total_spent' | 'order_count'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
}

export type OrderItem = {
  product_id: string
  name: string
  price: number
  quantity: number
  removed_ingredients: string[]
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  out_for_delivery: 'Saiu para Entrega',
  delivered: 'Entregue',
}
