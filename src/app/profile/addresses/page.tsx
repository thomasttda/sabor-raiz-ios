'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, MapPin, Plus, Trash2, Home, Briefcase, Map, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AddressesPage() {
  const [user, setUser] = useState<any>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Tentamos buscar de uma tabela 'addresses', se não existir usamos demo
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
        
        if (!error && data) {
          setAddresses(data)
        } else {
          // Fallback para demonstração se a tabela não existir ou estiver vazia
          setAddresses([
            { id: '1', label: 'Casa', street: 'Rua das Flores, 123', suburb: 'Jardim América', is_default: true, type: 'home' },
            { id: '2', label: 'Trabalho', street: 'Av. Paulista, 1000', suburb: 'Bela Vista', is_default: false, type: 'work' },
          ])
        }
      }
      setLoading(false)
    }
    fetchAddresses()
  }, [])

  const handleDelete = async (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
    // Opcional: deletar do banco se a tabela existir
    await supabase.from('addresses').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-100">
        <Link href="/profile">
          <ChevronLeft size={28} className="text-brand-orange" />
        </Link>
        <h1 className="text-xl font-black text-brand-green">Meus Endereços</h1>
        <div className="w-7" />
      </header>

      <main className="px-6 py-8 pb-24">
        <div className="flex flex-col gap-4">
          {addresses.map((addr) => (
            <div 
              key={addr.id}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between group"
            >
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  addr.is_default ? "bg-brand-green text-white" : "bg-orange-50 text-brand-orange"
                )}>
                  {addr.type === 'home' ? <Home size={24} /> : addr.type === 'work' ? <Briefcase size={24} /> : <Map size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-brand-green text-sm uppercase tracking-wider">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full font-bold uppercase">Padrão</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{addr.street}</p>
                  <p className="text-xs text-gray-400">{addr.suburb}</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(addr.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <Button className="w-full h-16 rounded-3xl bg-white border-2 border-dashed border-gray-200 text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all flex items-center justify-center gap-2 mt-4">
            <Plus size={20} />
            <span className="font-bold">Adicionar Novo Endereço</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
