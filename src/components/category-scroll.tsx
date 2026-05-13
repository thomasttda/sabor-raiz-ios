'use client'

import { Flame, UtensilsCrossed, Sandwich, CupSoda, CakeSlice } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'promotions', label: 'Promoções', icon: Flame, color: 'bg-orange-500 text-white' },
  { id: 'dishes', label: 'Pratos', icon: UtensilsCrossed, color: 'bg-gray-100 text-gray-700' },
  { id: 'sandwiches', label: 'Lanches', icon: Sandwich, color: 'bg-gray-100 text-gray-700' },
  { id: 'drinks', label: 'Bebidas', icon: CupSoda, color: 'bg-gray-100 text-gray-700' },
  { id: 'desserts', label: 'Sobremesas', icon: CakeSlice, color: 'bg-gray-100 text-gray-700' },
]

export function CategoryScroll() {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4 px-4">
      <div className="flex gap-6 min-w-max">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isPromo = cat.id === 'promotions'

          return (
            <button
              key={cat.id}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-sm",
                cat.color,
                isPromo && "shadow-[0_4px_15px_rgba(249,115,22,0.3)]"
              )}>
                <Icon size={28} />
              </div>
              <span className={cn(
                "text-xs font-semibold transition-colors",
                isPromo ? "text-brand-orange" : "text-gray-500"
              )}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
