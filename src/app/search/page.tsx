'use client'

import { useState } from 'react'
import { ChevronLeft, Search as SearchIcon, Mic } from 'lucide-react'
import { SearchBar } from '@/components/search-bar'
import { ProductCard } from '@/components/product-card'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 flex items-center gap-4">
        <Link href="/">
          <ChevronLeft size={28} className="text-brand-orange" />
        </Link>
        <div className="flex-1">
           <SearchBar />
        </div>
      </header>

      <main className="px-4 py-6">
        <h2 className="text-lg font-bold text-brand-green mb-4">Buscas Recentes</h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {['Picanha', 'Hambúrguer', 'Coca-Cola', 'Combo Duplo'].map((term) => (
            <button key={term} className="px-4 py-2 bg-gray-50 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
              {term}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold text-brand-green mb-4">Sugestões para você</h2>
        <div className="grid grid-cols-2 gap-4">
          {DEMO_PRODUCTS.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={() => {}}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
