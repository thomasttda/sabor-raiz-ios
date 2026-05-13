'use client'

import { useEffect, useState } from 'react'
import { X, Rotate3d, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  modelUrl: string
  onClose: () => void
  productName: string
}

export function Product3DViewer({ modelUrl, onClose, productName }: Props) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Import the custom element definition
    import('@google/model-viewer')
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-fade-in">
      {/* Background Gradient: Dark Moss Green to Dark Orange */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a0a] via-[#1a2e1a] to-[#4a2500]" />
      
      {/* Glassmorphism Header */}
      <div className="relative z-10 p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Rotate3d className="h-5 w-5 text-primary" />
            Vista 3D: {productName}
          </h3>
          <p className="text-white/60 text-xs">Arraste para girar • Pinça para zoom</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* 3D Scene Container */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-white/50 text-sm animate-pulse">Carregando modelo 3D...</p>
          </div>
        )}

        {/* The Wooden Base (Circular) */}
        <div 
          className="absolute bottom-[20%] w-[280px] h-[60px] md:w-[400px] md:h-[80px] rounded-[100%] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-0"
          style={{
            background: 'radial-gradient(circle, #8b4513 0%, #3d1f0a 100%)',
            border: '4px solid #5d2f11',
            transform: 'perspective(500px) rotateX(60deg)',
          }}
        >
          {/* Wooden Texture Overlay */}
          <div className="absolute inset-0 opacity-20 rounded-full" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }} />
          
          {/* Subtle Glow */}
          <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-50" />
        </div>

        {/* Model Viewer */}
        {/* @ts-ignore */}
        <model-viewer
          src={modelUrl}
          alt={`Modelo 3D de ${productName}`}
          auto-rotate
          camera-controls
          shadow-intensity="1"
          environment-image="neutral"
          exposure="1.2"
          interaction-prompt="none"
          onLoad={() => setLoading(false)}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            position: 'relative',
            zIndex: 10,
          }}
          class="drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Footer Info */}
      <div className="relative z-10 p-6 text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">
          Sabor Raiz — Experiência Imersiva
        </p>
      </div>
    </div>
  )
}
