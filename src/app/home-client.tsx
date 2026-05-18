'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { SearchBar } from '@/components/search-bar'
import { CategoryScroll } from '@/components/category-scroll'
import { BannerCarousel } from '@/components/banner-carousel'
import { HorizontalProductList } from '@/components/horizontal-product-list'
import { ProductDetail } from '@/components/product-detail'

export function HomePageClient({ initialProducts, initialBanners }: { initialProducts: any[], initialBanners: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pb-10">
        <SearchBar />
        <CategoryScroll />
        
        {/* Banner de Promoção */}
        <div className="py-4">
          <BannerCarousel initialBanners={initialBanners} />
        </div>

        {initialProducts && initialProducts.length > 0 && (
          <HorizontalProductList 
            title="Nosso Cardápio" 
            products={initialProducts} 
            onSelect={handleSelectProduct}
          />
        )}

        {initialProducts && initialProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
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
