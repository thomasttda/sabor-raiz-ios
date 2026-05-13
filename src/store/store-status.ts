import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type StoreStatus = {
  isOpen: boolean
  isLoading: boolean
  toggle: () => Promise<void>
  refresh: () => Promise<void>
}

export const useStoreStatus = create<StoreStatus>((set, get) => ({
  isOpen: true, // Default to open
  isLoading: true,
  
  refresh: async () => {
    try {
      set({ isLoading: true })
      // We use a special banner as a proxy for store settings to avoid schema changes
      const { data, error } = await supabase
        .from('banners')
        .select('image_url')
        .eq('title', 'SYSTEM_STORE_STATUS')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Setting doesn't exist, create it (default to open)
          await supabase.from('banners').insert({
            title: 'SYSTEM_STORE_STATUS',
            image_url: 'open',
            active: false,
            order: 999
          })
          set({ isOpen: true, isLoading: false })
        } else {
          console.error('Error fetching store status:', error)
          set({ isLoading: false })
        }
        return
      }

      set({ isOpen: data.image_url === 'open', isLoading: false })
    } catch (err) {
      console.error('Failed to refresh store status:', err)
      set({ isLoading: false })
    }
  },

  toggle: async () => {
    const nextStatus = !get().isOpen
    const statusStr = nextStatus ? 'open' : 'closed'
    
    set({ isLoading: true })
    
    const { error } = await supabase
      .from('banners')
      .update({ image_url: statusStr })
      .eq('title', 'SYSTEM_STORE_STATUS')

    if (error) {
      console.error('Error updating store status:', error)
      set({ isLoading: false })
      return
    }

    set({ isOpen: nextStatus, isLoading: false })
  }
}))
