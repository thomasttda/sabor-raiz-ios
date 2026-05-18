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

  const safeProducts = (productsRes.data || []).map(p => ({
    ...p,
    image_url: p.image_url?.length > 1000 && p.image_url.startsWith('data:image') ? '' : p.image_url,
    gallery_urls: p.gallery_urls?.map((url: string) => url.length > 1000 && url.startsWith('data:image') ? '' : url)
  }))

  return <HomePageClient initialProducts={safeProducts} initialBanners={bannersRes.data || []} />
}
