'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/supabase'
import { ChevronLeft, Package, Clock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Order = {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  created_at: string
  items: { name: string; quantity: number; price: number; removed_ingredients: string[] }[]
}

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  preparing: 'default',
  ready: 'success',
  out_for_delivery: 'secondary',
  delivered: 'success',
}



export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data)
      setLoading(false)
    }
    fetchOrders()

    const channel = supabase
      .channel('my-orders')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } as Order : o))
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/">
          <ChevronLeft size={28} className="text-brand-orange" />
        </Link>
        <h1 className="text-2xl font-black text-brand-green">Pedidos</h1>
        <div className="w-7" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando seus pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Package size={40} />
            </div>
            <h2 className="text-xl font-bold text-brand-green mb-2">Sem pedidos por aqui</h2>
            <p className="text-sm text-gray-400 px-10 mb-8">Parece que você ainda não fez nenhum pedido no Sabor Raiz.</p>
            <Link 
              href="/menu"
              className="px-8 py-3 bg-brand-orange text-white rounded-2xl font-bold shadow-lg shadow-brand-orange/20"
            >
              Fazer meu primeiro pedido
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-black text-brand-green text-lg tracking-tight">#{order.order_number}</span>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-0.5">
                      {formatDate(new Date(order.created_at))}
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    order.status === 'delivered' ? "bg-green-100 text-green-700" : "bg-orange-100 text-brand-orange"
                  )}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-50 pt-4 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        <span className="text-brand-orange font-bold mr-2">{item.quantity}x</span>
                        {item.name}
                      </span>
                      <span className="font-bold text-brand-green">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total</span>
                  <span className="font-black text-brand-price text-xl tracking-tight">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
