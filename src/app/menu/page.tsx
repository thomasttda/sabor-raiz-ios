'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, SlidersHorizontal, LayoutGrid } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { ProductDetail } from '@/components/product-detail'

import { DEMO_PRODUCTS, DEMO_CATEGORIES } from '@/lib/demo-data'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function MenuPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [categories, setCategories] = useState(DEMO_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get('category')
  )
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('available', true)
      .then(({ data }) => {
        if (data && data.length > 0) setProducts(data)
      })

    supabase
      .from('categories')
      .select('*')
      .order('order')
      .then(({ data }) => {
        if (data && data.length > 0) setCategories(data)
      })
  }, [])

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <Link href="/">
          <ChevronLeft size={28} className="text-brand-orange" />
        </Link>
        <h1 className="text-2xl font-black text-brand-green">Cardápio</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 text-brand-orange">
            <SlidersHorizontal size={24} />
          </button>
          <button className="p-2 text-brand-orange">
            <LayoutGrid size={24} />
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto px-4 py-4 no-scrollbar">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "flex-shrink-0 px-6 py-2 rounded-xl text-sm font-bold transition-all",
            activeCategory === null
              ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
              : "bg-gray-100 text-gray-400"
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={cn(
              "flex-shrink-0 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeCategory === cat.slug
                ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <main className="px-4 py-4 grid grid-cols-2 gap-4 pb-40">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={handleSelectProduct}
          />
        ))}
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
