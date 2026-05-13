'use client'

import { ProductCard } from './product-card'
import Link from 'next/link'

type HorizontalProductListProps = {
  title: string
  products: any[]
  onSelect: (product: any) => void
  isNew?: boolean
}

export function HorizontalProductList({ title, products, onSelect, isNew }: HorizontalProductListProps) {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-4">
        <h2 className="text-xl font-bold text-brand-green">{title}</h2>
        <Link href="/menu" className="text-sm font-medium text-brand-orange hover:underline">
          Ver todos
        </Link>
      </div>
      
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar pb-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="horizontal"
            onSelect={onSelect}
            isNew={isNew}
          />
        ))}
      </div>
    </section>
  )
}
