'use client'

import { ShoppingBag, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function CartBar() {
  const { items, openCart } = useCartStore()
  
  if (items.length === 0) return null

  const total = items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0)
  const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0)

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-slide-up">
      <button
        onClick={openCart}
        className="w-full h-14 bg-brand-green text-white rounded-2xl flex items-center justify-between px-6 shadow-2xl shadow-brand-green/20 ring-1 ring-white/10"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag size={24} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange text-[10px] font-bold flex items-center justify-center rounded-full">
              {count}
            </span>
          </div>
          <span className="font-bold text-sm">
            Ver Carrinho ({count} {count === 1 ? 'item' : 'itens'})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-bold">{formatCurrency(total)}</span>
          <ChevronRight size={20} />
        </div>
      </button>
    </div>
  )
}
