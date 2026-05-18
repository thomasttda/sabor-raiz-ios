'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, SlidersHorizontal, LayoutGrid, Loader2 } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { ProductDetail } from '@/components/product-detail'

import { cn } from '@/lib/utils'
import Link from 'next/link'

function MenuContent({ initialProducts, initialCategories }: { initialProducts: any[], initialCategories: any[] }) {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get('category')
  )
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filtered = activeCategory
    ? initialProducts.filter((p) => p.category === activeCategory)
    : initialProducts

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
        {initialCategories.map((cat) => (
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

export function MenuPageClient({ initialProducts, initialCategories }: { initialProducts: any[], initialCategories: any[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    }>
      <MenuContent initialProducts={initialProducts} initialCategories={initialCategories} />
    </Suspense>
  )
}
