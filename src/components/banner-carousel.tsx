'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductDetail } from './product-detail'

type Banner = {
  id: string
  image_url: string
  title: string
  active: boolean
  order: number
  product_id?: string | null
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  ingredients: string[]
  available: boolean
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('order')
      .then(({ data }) => {
        if (data) setBanners(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  const handleBannerClick = async (banner: Banner) => {
    if (banner.product_id) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', banner.product_id)
        .single()
        
      if (data) {
        setSelectedProduct(data)
        setSheetOpen(true)
      }
    }
  }

  return (
    <section className="w-full max-w-screen-2xl mx-auto px-4 py-4 min-h-[120px]">
      {!loading && banners.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20" ref={emblaRef}>
            <div className="flex">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`relative flex-[0_0_100%] min-w-0 ${banner.product_id ? 'cursor-pointer' : ''}`}
                  onClick={() => handleBannerClick(banner)}
                >
                  <div className="relative aspect-[3/1] bg-secondary">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement?.classList.add('bg-gray-100')
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
                      <span className="inline-block px-6 py-2 rounded-xl text-xs sm:text-sm font-black bg-white text-brand-green shadow-[0_10px_30px_rgba(0,0,0,0.2)] uppercase tracking-wider">
                        {banner.title}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-3">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === selectedIndex
                    ? 'w-8 bg-brand-orange'
                    : 'w-2 bg-muted-foreground/30'
                }`}
                onClick={() => emblaApi?.scrollTo(idx)}
                aria-label={`Ir para banner ${idx + 1}`}
              />
            ))}
          </div>
        </>
      ) : !loading && banners.length === 0 ? (
        <div className="w-full aspect-[3/1] rounded-xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
          <p className="text-gray-300 font-bold text-sm">Nenhuma oferta ativa</p>
        </div>
      ) : (
        <div className="w-full aspect-[3/1] rounded-xl bg-gray-50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-brand-orange rounded-full animate-spin" />
        </div>
      )}

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </section>
  )
}
