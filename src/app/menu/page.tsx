import { supabase } from '@/lib/supabase'
import { MenuPageClient } from './menu-client'

export const revalidate = 60 // Revalida a cada 60 segundos

export default async function MenuPage() {
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .order('order')
  ])

  const safeProducts = (productsRes.data || []).map(p => ({
    ...p,
    image_url: p.image_url?.length > 1000 && p.image_url.startsWith('data:image') ? '' : p.image_url,
    gallery_urls: p.gallery_urls?.map((url: string) => url.length > 1000 && url.startsWith('data:image') ? '' : url)
  }))

  return (
    <MenuPageClient 
      initialProducts={safeProducts} 
      initialCategories={categoriesRes.data || []} 
    />
  )
}
