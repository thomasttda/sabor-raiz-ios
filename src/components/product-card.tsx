'use client'

import { Star, Clock, Heart, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type ProductCardProps = {
  product: any
  variant?: 'horizontal' | 'grid'
  onSelect: (product: any) => void
  isNew?: boolean
}

export function ProductCard({ product, variant = 'grid', onSelect, isNew }: ProductCardProps) {
  const isHorizontal = variant === 'horizontal'

  return (
    <div
      onClick={() => onSelect(product)}
      className={cn(
        "relative flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 text-left cursor-pointer group",
        isHorizontal ? "w-44 flex-shrink-0" : "w-full"
      )}
    >
      {/* Badge Novo */}
      {isNew && (
        <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-orange-600 text-[10px] font-bold text-white rounded-md uppercase tracking-wider">
          NOVO
        </div>
      )}

      {/* Favorito */}
      <div className="absolute top-3 right-3 z-10">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite logic here
          }}
          className="p-1.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
        >
          <Heart size={16} />
        </button>
      </div>

      {/* Imagem */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Rating overlay if grid */}
        {!isHorizontal && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/30 backdrop-blur-sm rounded-lg flex items-center gap-1 text-white text-[10px] font-bold">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            4.8
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-brand-green text-sm line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        {isHorizontal && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
            <Star size={10} className="fill-yellow-400 text-yellow-400 border-none" />
            <span className="font-bold text-gray-600">4.8</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-brand-price font-bold text-sm">
              {formatCurrency(product.price)}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
              <Clock size={10} />
              <span>25-35 min</span>
            </div>
          </div>

          <div className={cn(
            "rounded-full bg-[#D9480F] flex items-center justify-center text-white shadow-lg shadow-[#D9480F]/30 transition-transform active:scale-90",
            isHorizontal ? "w-7 h-7" : "w-8 h-8"
          )}>
            <Plus size={isHorizontal ? 16 : 18} />
          </div>
        </div>
      </div>
    </div>
  )
}
