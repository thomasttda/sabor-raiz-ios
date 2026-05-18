import { supabase } from '@/lib/supabase'
import { HomePageClient } from './home-client'

// Revalidate data every 60 seconds (Incremental Static Regeneration)
export const revalidate = 60

export default async function HomePage() {
  // O Fetch agora acontece no Servidor ANTES da página carregar no cliente
  const [productsRes, bannersRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('banners')
      .select('*')
      .eq('active', true)
      .not('title', 'eq', 'SYSTEM_STORE_STATUS')
      .order('order')
  ])

  return <HomePageClient initialProducts={productsRes.data || []} initialBanners={bannersRes.data || []} />
}
