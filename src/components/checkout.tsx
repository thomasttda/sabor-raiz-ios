'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/store/cart-store'
import { supabase } from '@/lib/supabase'
import { generateOrderNumber, formatCurrency } from '@/lib/utils'
import { MapPin, Phone, User, Loader2, ArrowLeft, Truck, Clock, LogIn } from 'lucide-react'
import { useStoreStatus } from '@/store/store-status'
import { Receipt } from './receipt'
import Link from 'next/link'

type Props = {
  open: boolean
  onClose: () => void
  onBack: () => void
}

type DeliveryZone = {
  id: string
  neighborhood: string
  fee: number
}

export function Checkout({ open, onClose, onBack }: Props) {
  const { items, subtotal, clearCart } = useCartStore()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('') // Street and number
  const [selectedZoneId, setSelectedZoneId] = useState('')
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderDate, setOrderDate] = useState<Date>(new Date())
  const [scheduledTime, setScheduledTime] = useState('')
  const { isOpen: storeIsOpen } = useStoreStatus()

  useEffect(() => {
    if (open) {
      // Get auth user
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user) {
          // Pre-fill from profile
          supabase.from('profiles').select('*').eq('id', user.id).single()
            .then(({ data: profile }) => {
              if (profile) {
                const profileData = profile as any
                setName(profileData.full_name || '')
                setPhone(profileData.phone || '')
                setAddress(profileData.address || '')
              }
            })
        }
      })

      if (!storeIsOpen) {
        // Sugerir próximo horário disponível se fechado
        setScheduledTime('18:00')
      }
      supabase.from('delivery_zones').select('*').eq('active', true).order('neighborhood')
        .then(({ data }) => {
          if (data) {
            const zones = data as DeliveryZone[]
            setDeliveryZones(zones)
            if (zones.length > 0) setSelectedZoneId(zones[0].id)
          }
        })
    }
  }, [open, storeIsOpen])

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId)
  const deliveryFee = selectedZone ? selectedZone.fee : 0
  const total = subtotal() + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) return

    setLoading(true)
    const orderNum = generateOrderNumber()
    const now = new Date()

    try {
      // Check user again just in case
      if (!user) {
        alert('Você precisa estar logado para finalizar o pedido.')
        setLoading(false)
        return
      }

      const orderData = {
        order_number: orderNum,
        customer_name: name,
        customer_phone: phone,
        customer_address: `${address} - ${selectedZone?.neighborhood || ''}${scheduledTime ? ` (AGENDADO: ${scheduledTime})` : ''}`,
        customer_email: user.email,
        items: items.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          removed_ingredients: item.removed_ingredients,
        })),
        subtotal: subtotal(),
        delivery_fee: deliveryFee,
        discount: 0,
        total: total,
        status: 'pending' as const,
        user_id: user.id,
      }

      // Try inserting into Supabase
      await supabase.from('orders').insert(orderData as never)

      // Update profile stats
      const result = await supabase
        .from('profiles')
        .select('total_spent, order_count')
        .eq('id', user.id)
        .single()
      const profile = result.data as { total_spent: number, order_count: number } | null

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            total_spent: (profile.total_spent || 0) + total,
            order_count: (profile.order_count || 0) + 1,
          } as never)
          .eq('id', user.id)
      }
    } catch (err) {
      console.log('Supabase insert skipped (tables may not exist yet)')
    }

    setOrderNumber(orderNum)
    setOrderDate(now)
    setLoading(false)
    setShowReceipt(true)
  }

  if (showReceipt) {
    return (
      <Receipt
        open={true}
        onClose={() => {
          clearCart()
          setShowReceipt(false)
          onClose()
        }}
        orderNumber={orderNumber}
        orderDate={orderDate}
        customerName={name}
        customerPhone={phone}
        customerAddress={`${address} - ${selectedZone?.neighborhood || ''}`}
        items={items}
        subtotal={subtotal()}
        deliveryFee={deliveryFee}
        discount={0}
        total={total}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Finalizar Pedido</DialogTitle>
          <DialogDescription>Confirme seus dados para enviar o pedido</DialogDescription>
        </DialogHeader>

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Nome
              </label>
              <Input
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Telefone
              </label>
              <Input
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Bairro / Taxa de Entrega
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="" disabled>Selecione seu bairro...</option>
                {deliveryZones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.neighborhood} - {formatCurrency(zone.fee)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Endereço (Rua, Número e Comp)
              </label>
              <Input
                placeholder="Rua das Flores, 123 - Apto 4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {!storeIsOpen && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-bold">Estamos fechados no momento</span>
                </div>
                <p className="text-[10px] text-amber-600 leading-tight">
                  Você ainda pode fazer seu pedido! Ele será processado assim que abrirmos. 
                  Por favor, escolha o horário desejado para entrega:
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Horário de Entrega</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="bg-white border-amber-200 focus:border-amber-500 h-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Entrega</span>
                <span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-[2]"
                disabled={loading || !name || !phone || !address || !selectedZoneId}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Pedido'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-8 space-y-6 text-center animate-fade-in">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Identificação Necessária</h3>
              <p className="text-sm text-muted-foreground px-6">
                Para garantir sua segurança e manter seu histórico de pedidos, é necessário estar logado.
              </p>
            </div>
            
            {/* Summary Preview even when logged out */}
            <div className="rounded-xl bg-secondary/50 p-4 max-w-[280px] mx-auto text-sm">
              <div className="flex justify-between font-bold">
                <span>Total do Pedido:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 px-6">
              <Link href="/login" className="w-full">
                <Button className="w-full h-12 rounded-xl text-lg font-bold">
                  Fazer Login / Criar Conta
                </Button>
              </Link>
              <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Carrinho
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
