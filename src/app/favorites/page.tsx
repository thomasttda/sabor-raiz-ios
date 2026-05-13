'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Heart, Search } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { ProductDetail } from '@/components/product-detail'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FavoritesPage() {
  const [products, setProducts] = useState(DEMO_PRODUCTS.slice(0, 2)) // Mocking favorites
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    // In a real app, we would fetch from a 'favorites' table
    supabase
      .from('products')
      .select('*')
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) setProducts(data)
      })
  }, [])

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <Link href="/">
          <ChevronLeft size={28} className="text-brand-orange" />
        </Link>
        <h1 className="text-2xl font-black text-brand-green">Favoritos</h1>
        <button className="p-2 text-brand-orange">
          <Search size={24} />
        </button>
      </header>

      <main className="px-4 py-6 pb-24">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
              <Heart size={40} />
            </div>
            <h2 className="text-xl font-bold text-brand-green mb-2">Nada por aqui ainda</h2>
            <p className="text-sm text-gray-400 px-10">
              Toque no coração nos produtos para salvá-los aqui e encontrá-los mais rápido.
            </p>
            <Link 
              href="/menu"
              className="mt-8 px-8 py-3 bg-brand-orange text-white rounded-2xl font-bold shadow-lg shadow-brand-orange/20"
            >
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={handleSelectProduct}
              />
            ))}
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
