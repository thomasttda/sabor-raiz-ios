'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { Minus, Plus, Star, Clock, Flame, ChevronLeft, Heart, Boxes, Camera, Scan, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  ingredients: string[]
  available: boolean
  model_3d_url?: string | null
}

type Props = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ACCOMPANIMENTS = [
  { id: '1', name: 'Arroz Branco', price: 0, image: '/sides/arroz.png', included: true },
  { id: '2', name: 'Farofa', price: 4, image: '/sides/farofa.png' },
  { id: '3', name: 'Vinagrete', price: 3, image: '/sides/vinagrete.png' },
  { id: '4', name: 'Batata Frita', price: 8, image: '/sides/batata.png' },
]

export function ProductDetail({ product, open, onOpenChange }: Props) {
  const [viewMode, setViewMode] = useState<'photo' | '3d' | 'ar'>('photo')
  const [quantity, setQuantity] = useState(1)
  const [selectedSides, setSelectedSides] = useState<string[]>(['1'])
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const toggleSide = (id: string) => {
    setSelectedSides(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity,
    })
    onOpenChange(false)
    openCart()
    setQuantity(1)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] p-0 overflow-hidden rounded-t-[3rem] border-none focus:outline-none">
        <SheetHeader className="sr-only">
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>{product.description}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full bg-white relative">
          
          {/* Top Section: Media Viewer */}
          <div className={cn(
            "relative h-[40%] transition-colors duration-500",
            viewMode === 'photo' ? "bg-gray-100" : "bg-black"
          )}>
            {/* Header Controls */}
            <div className="absolute top-6 left-0 right-0 z-20 px-6 flex items-center justify-between">
              <button 
                onClick={() => onOpenChange(false)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-800 shadow-sm"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
                <button 
                  onClick={() => setViewMode('photo')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    viewMode === 'photo' ? "bg-brand-orange text-white" : "text-white/60"
                  )}
                >
                  Foto
                </button>
                <button 
                  onClick={() => setViewMode('3d')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    viewMode === '3d' ? "bg-brand-orange text-white" : "text-white/60"
                  )}
                >
                  3D
                </button>
                <button 
                  onClick={() => setViewMode('ar')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    viewMode === 'ar' ? "bg-brand-orange text-white" : "text-white/60"
                  )}
                >
                  AR
                </button>
              </div>

              <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-800 shadow-sm">
                <Heart size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Media Content */}
            <div className="w-full h-full flex items-center justify-center">
              {viewMode === 'photo' ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white gap-4">
                   {/* Simplificado para o exemplo, o model-viewer ficaria aqui */}
                   <Boxes size={120} className="text-brand-orange animate-pulse" />
                   <p className="text-sm font-medium opacity-60">Visualização 3D Ativada</p>
                </div>
              )}
            </div>

            {/* AR Button Overlay */}
            {viewMode === '3d' && (
              <button className="absolute bottom-6 right-6 bg-white rounded-full px-6 py-3 flex items-center gap-2 shadow-2xl animate-bounce-subtle">
                <Scan size={20} className="text-brand-green" />
                <span className="text-sm font-bold text-brand-green uppercase tracking-wider">Ver em AR</span>
              </button>
            )}

            {/* 360 Badge */}
            <div className="absolute bottom-6 left-6 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 text-white">
              <Boxes size={16} />
              <span className="text-xs font-bold">360°</span>
            </div>
          </div>

          {/* Bottom Section: Details */}
          <div className="flex-1 bg-white -mt-8 rounded-t-[3rem] relative z-10 px-6 pt-8 overflow-y-auto pb-32">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            
            <div className="flex flex-col gap-2 mb-6">
              <h2 className="text-3xl font-extrabold text-brand-green">{product.name}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-700">4.8</span>
                  <span>(234 avaliações)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>25-35 min</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 text-brand-orange font-bold">
                  <Flame size={16} className="fill-brand-orange" />
                  <span>Popular</span>
                </div>
              </div>
            </div>

            <div className="text-4xl font-black text-brand-price mb-4">
              {formatCurrency(product.price)}
            </div>

            <p className="text-gray-500 leading-relaxed text-sm mb-8">
              {product.description || "Delicioso prato preparado com ingredientes selecionados, garantindo o melhor sabor e qualidade para sua refeição."}
            </p>

            {/* Sides Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-brand-green mb-4">Escolha os Acompanhamentos</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {ACCOMPANIMENTS.map((side) => {
                  const isSelected = selectedSides.includes(side.id)
                  return (
                    <button
                      key={side.id}
                      onClick={() => toggleSide(side.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[100px] transition-all",
                        isSelected 
                          ? "bg-green-50/50 border-brand-green shadow-sm ring-1 ring-brand-green/20" 
                          : "bg-white border-gray-100"
                      )}
                    >
                      <div className="w-12 h-12 relative mb-2 rounded-lg overflow-hidden">
                        <img src={side.image} alt={side.name} className="w-full h-full object-cover" />
                      </div>
                      <span className={cn(
                        "text-[11px] font-bold mb-0.5",
                        isSelected ? "text-brand-green" : "text-gray-700"
                      )}>{side.name}</span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        isSelected ? "text-brand-green" : "text-brand-orange"
                      )}>
                        {side.price === 0 ? "Incluso" : `+${formatCurrency(side.price)}`}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-brand-green text-white rounded-full p-0.5">
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Observations */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-brand-green mb-3">Observações</h3>
              <textarea
                placeholder="Ex.: ponto da carne, alergias, etc."
                className="w-full h-24 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer: Price and Add Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center gap-4 z-50">
            <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-brand-orange"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-brand-orange"
              >
                <Plus size={18} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-1 h-14 bg-[#D9480F] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#D9480F]/30 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Adicionar • {formatCurrency(product.price * quantity)}
            </button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
