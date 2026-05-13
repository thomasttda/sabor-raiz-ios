'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, User, Mail, MapPin, Bell, Shield, LogOut, ChevronRight, Camera, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(prof)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-brand-orange">
          <User size={48} />
        </div>
        <h1 className="text-2xl font-black text-brand-green mb-2">Acesse sua conta</h1>
        <p className="text-gray-400 text-sm mb-8 px-10">Faça login para acompanhar seus pedidos, salvar endereços e muito mais.</p>
        <Link 
          href="/login"
          className="w-full max-w-xs h-14 bg-brand-orange text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20"
        >
          <LogIn size={20} />
          Fazer Login ou Cadastrar
        </Link>
        <Link href="/" className="mt-6 text-sm font-bold text-gray-400 hover:text-brand-green transition-colors">
          Voltar para o Início
        </Link>
      </div>
    )
  }

  const menuItems = [
    { icon: User, label: 'Dados Pessoais', value: profile?.full_name || 'Não informado', href: '/profile/personal-data' },
    { icon: MapPin, label: 'Endereços', value: '2 endereços salvos', href: '/profile/addresses' },
    { icon: Bell, label: 'Notificações', value: 'Ativado' },
    ...(profile?.role === 'admin' ? [{ 
      icon: Shield, 
      label: 'Painel Administrativo', 
      value: 'Gestão de Loja', 
      href: '/admin',
      highlight: true 
    }] : []),
    { icon: Shield, label: 'Privacidade e Segurança', value: '' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <Link href="/">
          <ChevronLeft size={28} className="text-brand-orange" />
        </Link>
        <h1 className="text-2xl font-black text-brand-green">Perfil</h1>
        <div className="w-7" />
      </header>

      <main className="px-6 py-8 pb-24">
        {/* Profile Card */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100 bg-gray-50 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-300" />
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Camera size={16} />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-brand-green">
            {profile?.full_name || 'Seu Nome'}
          </h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>

        {/* Menu Items */}
        <div className="space-y-4 mb-10">
          {menuItems.map((item, idx) => {
            const content = (
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                  item.highlight ? "bg-brand-green text-white" : "bg-white text-brand-green"
                )}>
                  <item.icon size={20} />
                </div>
                <div className="text-left">
                  <p className={cn(
                    "text-sm font-bold",
                    item.highlight ? "text-brand-orange" : "text-brand-green"
                  )}>{item.label}</p>
                  {item.value && <p className="text-xs text-gray-400">{item.value}</p>}
                </div>
              </div>
            )

            if (item.href) {
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl group active:scale-[0.98] transition-all border",
                    item.highlight ? "bg-brand-green/5 border-brand-green/20" : "bg-gray-50 border-transparent"
                  )}
                >
                  {content}
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-orange transition-colors" />
                </Link>
              )
            }

            return (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl group active:scale-[0.98] transition-all"
              >
                {content}
                <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-orange transition-colors" />
              </button>
            )
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full h-14 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          Sair da Conta
        </button>
      </main>
    </div>
  )
}
