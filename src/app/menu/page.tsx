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

  return (
    <MenuPageClient 
      initialProducts={productsRes.data || []} 
      initialCategories={categoriesRes.data || []} 
    />
  )
}
