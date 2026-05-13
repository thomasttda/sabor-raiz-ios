'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, User, Phone, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function PersonalDataPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (prof && !profError) {
          const profileData = prof as any
          setProfile(profileData)
          setName(profileData.full_name || '')
          setPhone(profileData.phone || '')
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        phone: phone,
      } as never)
      .eq('id', user.id)

    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10 border-b border-gray-50">
        <Link href="/profile">
          <ChevronLeft size={28} className="text-brand-orange" />
        </Link>
        <h1 className="text-xl font-black text-brand-green">Dados Pessoais</h1>
        <div className="w-7" />
      </header>

      <main className="px-6 py-8">
        <div className="mb-8">
          <p className="text-gray-400 text-sm">
            Mantenha seus dados atualizados para facilitar suas entregas e comunicações.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
              <User size={14} className="text-brand-orange" />
              Nome Completo
            </label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} className="text-brand-orange" />
              Telefone / WhatsApp
            </label>
            <Input 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
            />
          </div>

          <div className="space-y-2 opacity-60">
            <label className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} className="text-brand-orange" />
              E-mail (Não editável)
            </label>
            <Input 
              value={user?.email || ''}
              disabled
              className="h-14 rounded-2xl bg-gray-50 border-gray-100"
            />
          </div>

          <Button 
            type="submit" 
            disabled={saving}
            className="w-full h-14 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white font-bold shadow-lg shadow-brand-green/20 transition-all mt-10"
          >
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : success ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />
                Dados Salvos!
              </div>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
