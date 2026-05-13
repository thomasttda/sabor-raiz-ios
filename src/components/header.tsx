'use client'

import Image from 'next/image'
import { Sun, Moon, User, LogIn, ShieldCheck } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Link from 'next/link'

import { MapPin, ChevronDown, Clock } from 'lucide-react'
import { useStoreStatus } from '@/store/store-status'

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null)
  const [address, setAddress] = useState<string>('Obtendo localização...')
  const { isOpen: storeIsOpen, refresh: refreshStore } = useStoreStatus()

  useEffect(() => {
    refreshStore()
    // 1. Get User and Profile
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single()
      
      if (data) setProfile(data)
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchProfile(data.user.id)
    })

    // 2. Get Geolocation and Address
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          const data = await response.json();
          if (data && data.address) {
            const road = data.address.road || data.address.pedestrian || '';
            const house_number = data.address.house_number || '';
            const suburb = data.address.suburb || data.address.neighbourhood || data.address.city_district || '';
            
            let formatted = road;
            if (house_number) formatted += `, ${house_number}`;
            if (suburb) formatted += (formatted ? ` - ${suburb}` : suburb);
            
            setAddress(formatted || data.display_name?.split(',')[0] || 'Localização encontrada');
          } else {
            setAddress('Localização não encontrada');
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          setAddress('Erro ao obter endereço');
        }
      }, (error) => {
        console.warn("Geolocation error:", error);
        setAddress('Localização desativada');
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } else {
      setAddress('GPS não suportado');
    }
  }, [])

  return (
    <header className="bg-white px-4 pt-6 pb-2">
      <div className="flex items-center justify-between">
        {/* Logo & Greeting Section */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <Image
              src="/logo.png"
              alt="Sabor Raiz"
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </div>
          
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                {user ? (
                  <span className="text-xl font-bold text-brand-green">
                    Olá, {profile?.full_name?.split(' ')[0] || 'Cliente'} 👋
                  </span>
                ) : (
                  <Link href="/login" className="flex flex-col">
                    <span className="text-xl font-bold text-brand-green">Seja bem-vindo!</span>
                    <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">Toque para entrar ou cadastrar</span>
                  </Link>
                )}
              </div>
            <div className="flex items-center gap-1 text-xs text-brand-orange font-medium mt-0.5 max-w-[200px]">
              <MapPin size={12} className="fill-brand-orange shrink-0" />
              <span className="truncate">{address}</span>
              <ChevronDown size={12} className="shrink-0" />
            </div>

            {/* Store Status Badge */}
            <div className="mt-2 flex items-center">
              {storeIsOpen ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100 animate-fade-in">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Estamos funcionando</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full border border-red-100 animate-fade-in">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-[10px] font-black text-red-700 uppercase tracking-wider">Fechados no momento</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <Link href="/profile">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
              {profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  fill 
                  sizes="48px"
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="text-gray-400" size={24} />
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
