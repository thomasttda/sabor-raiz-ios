'use client'

import { Search, Mic } from 'lucide-react'

export function SearchBar() {
  return (
    <div className="px-4 py-2">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-orange transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="O que você quer comer?"
          className="w-full h-14 pl-12 pr-12 bg-white border border-gray-100 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all text-sm"
        />
        <div className="absolute inset-y-0 right-4 flex items-center text-gray-400 cursor-pointer hover:text-brand-orange transition-colors">
          <Mic size={20} />
        </div>
      </div>
    </div>
  )
}
