'use client'

import { Flame, UtensilsCrossed, Sandwich, CupSoda } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// Mapeamento: label exibido → slug real no banco de dados
const categories = [
  { id: 'promocoes',    slug: null,            label: 'Promoções', icon: Flame,           color: 'bg-orange-500 text-white',  isPromo: true  },
  { id: 'pratos',       slug: 'pratos',         label: 'Pratos',    icon: UtensilsCrossed, color: 'bg-gray-100 text-gray-700', isPromo: false },
  { id: 'lanches',      slug: 'hamburgueres',   label: 'Lanches',   icon: Sandwich,        color: 'bg-gray-100 text-gray-700', isPromo: false },
  { id: 'bebidas',      slug: 'bebidas',        label: 'Bebidas',   icon: CupSoda,         color: 'bg-gray-100 text-gray-700', isPromo: false },
]

export function CategoryScroll() {
  const router = useRouter()

  const handleClick = (slug: string | null) => {
    if (!slug) {
      router.push('/menu')
    } else {
      router.push(`/menu?category=${slug}`)
    }
  }

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4 px-4">
      <div className="flex gap-6 min-w-max">
        {categories.map((cat) => {
          const Icon = cat.icon

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-95 shadow-sm",
                cat.color,
                cat.isPromo && "shadow-[0_4px_15px_rgba(249,115,22,0.3)]"
              )}>
                <Icon size={28} />
              </div>
              <span className={cn(
                "text-xs font-semibold transition-colors",
                cat.isPromo ? "text-brand-orange" : "text-gray-500"
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
