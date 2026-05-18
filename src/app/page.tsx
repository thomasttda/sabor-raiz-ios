'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { SearchBar } from '@/components/search-bar'
import { CategoryScroll } from '@/components/category-scroll'
import { BannerCarousel } from '@/components/banner-carousel'
import { HorizontalProductList } from '@/components/horizontal-product-list'
import { ProductDetail } from '@/components/product-detail'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: true }) // ORDER BY estável — evita mudança de posição após UPDATE
      .then(({ data }) => {
        if (data) setProducts(data)
        setLoading(false)
      })
  }, [])

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  // Sem slice — todos os produtos aparecem

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pb-10">
        <SearchBar />
        <CategoryScroll />
        
        {/* Banner de Promoção */}
        <div className="py-4">
          <BannerCarousel />
        </div>

        {!loading && products.length > 0 && (
          <HorizontalProductList 
            title="Nosso Cardápio" 
            products={products} 
            onSelect={handleSelectProduct}
          />
        )}

        {!loading && products.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
          </div>
        )}

        {loading && (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}
    </div>
  )
}
