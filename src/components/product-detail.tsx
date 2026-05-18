'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { BeverageUpsell } from './beverage-upsell'
import { Minus, Plus, Star, Clock, Flame, ChevronLeft, Heart, Boxes, Camera, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import useEmblaCarousel from 'embla-carousel-react'

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
  gallery_urls?: string[] | null
}

type Props = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}


export function ProductDetail({ product, open, onOpenChange }: Props) {
  const [viewMode, setViewMode] = useState<'photo' | '3d'>('photo')
  const [quantity, setQuantity] = useState(1)
  const [showBeverageUpsell, setShowBeverageUpsell] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [emblaRef] = useEmblaCarousel({ loop: true })

  const has3D = Boolean(product.model_3d_url)
  const allImages = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean)

  // Load @google/model-viewer when user switches to 3D mode
  useEffect(() => {
    if (viewMode === '3d' && has3D) {
      setModelLoading(true)
      import('@google/model-viewer').finally(() => setModelLoading(false))
    }
  }, [viewMode, has3D])


  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity,
    })
    onOpenChange(false)
    setQuantity(1)
    // Show beverage upsell instead of going directly to cart
    setShowBeverageUpsell(true)
  }

  const handleBeverageUpsellClose = () => {
    setShowBeverageUpsell(false)
    openCart()
  }

  return (
    <>
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

              {/* View Mode Toggle — só mostra 3D/AR se o produto tiver modelo */}
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
                {has3D && (
                  <>
                    <button 
                      onClick={() => setViewMode('3d')}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                        viewMode === '3d' ? "bg-brand-orange text-white" : "text-white/60"
                      )}
                    >
                      3D
                    </button>
                  </>
                )}
              </div>

              <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-800 shadow-sm">
                <Heart size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Media Content */}
            <div className="w-full h-full flex items-center justify-center">
              {viewMode === 'photo' ? (
                allImages.length > 1 ? (
                  <div className="w-full h-full overflow-hidden" ref={emblaRef}>
                    <div className="flex h-full">
                      {allImages.map((imgUrl, i) => (
                        <div key={i} className="flex-[0_0_100%] min-w-0 h-full relative">
                          <img 
                            src={imgUrl} 
                            alt={`${product.name} - Imagem ${i + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Dots Overlay */}
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {allImages.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                )
              ) : has3D ? (
                <div className="relative w-full h-full bg-gradient-to-br from-[#0a1a0a] via-[#1a2e1a] to-[#4a2500]">
                  {modelLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Camera size={32} className="text-brand-orange animate-pulse" />
                        <p className="text-white/60 text-xs">Carregando modelo 3D...</p>
                      </div>
                    </div>
                  )}
                  {/* @ts-ignore */}
                  <model-viewer
                    src={product.model_3d_url!}
                    alt={`Modelo 3D de ${product.name}`}
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    exposure="1.2"
                    interaction-prompt="none"
                    onLoad={() => setModelLoading(false)}
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'transparent',
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white gap-4">
                  <Boxes size={80} className="text-brand-orange/40" />
                  <p className="text-sm font-medium text-white/40">Modelo 3D não disponível</p>
                </div>
              )}
            </div>

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
      <BeverageUpsell 
        open={showBeverageUpsell} 
        onClose={handleBeverageUpsellClose} 
      />
    </>
  )
}
