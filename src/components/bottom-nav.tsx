'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ClipboardList, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Início', icon: Home, href: '/' },
  { label: 'Buscar', icon: Search, href: '/search' },
  { label: 'Pedidos', icon: ClipboardList, href: '/orders' },
  { label: 'Favoritos', icon: Heart, href: '/favorites' },
  { label: 'Perfil', icon: User, href: '/profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-2 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-200",
                isActive ? "text-brand-orange" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                isActive && "bg-orange-50"
              )}>
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                isActive ? "text-brand-orange" : "text-gray-400"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
