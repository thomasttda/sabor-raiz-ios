'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { DEMO_PRODUCTS } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { GlassWater, X, Plus, Loader2 } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

type Beverage = {
  id: string
  name: string
  price: number
  image_url: string
  category: string
}

export function BeverageUpsell({ open, onClose }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [beverages, setBeverages] = useState<Beverage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBeverages() {
      if (!open) return
      
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, category')
          .eq('category', 'bebidas')
          .eq('available', true)
          .limit(3)

        if (error || !data || data.length === 0) {
          // Fallback to demo data if DB is empty or error
          const demoBevs = DEMO_PRODUCTS.filter((p) => p.category === 'bebidas').slice(0, 3)
          setBeverages(demoBevs)
        } else {
          setBeverages(data)
        }
      } catch (err) {
        const demoBevs = DEMO_PRODUCTS.filter((p) => p.category === 'bebidas').slice(0, 3)
        setBeverages(demoBevs)
      } finally {
        setLoading(false)
      }
    }

    fetchBeverages()
  }, [open])

  const handleAdd = (beverage: Beverage) => {
    addItem({
      product_id: beverage.id,
      name: beverage.name,
      price: beverage.price,
      image_url: beverage.image_url,
      removed_ingredients: [],
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden p-0 bg-background border-none shadow-2xl">
        <div className="bg-primary p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm animate-bounce-subtle">
              <GlassWater className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold mb-1 text-white">
            Que tal uma bebida gelada? 🧊
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Acompanhe seu pedido com uma bebida refrescante!
          </DialogDescription>
        </div>

        <div className="p-6 space-y-3">
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            beverages.map((bev) => (
              <div
                key={bev.id}
                className="flex items-center gap-4 p-3 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                  {bev.image_url ? (
                    <img 
                      src={bev.image_url} 
                      alt={bev.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🥤</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{bev.name}</p>
                  <p className="text-primary font-extrabold text-sm">{formatCurrency(bev.price)}</p>
                </div>
                <Button 
                  size="icon" 
                  className="rounded-full w-10 h-10 shadow-lg hover:scale-110 transition-transform"
                  onClick={() => handleAdd(bev)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            ))
          )}

          {!loading && beverages.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhuma bebida disponível no momento.</p>
          )}

          <Button
            variant="ghost"
            className="w-full mt-2 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Não, obrigado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
