'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck,
  Package,
  UtensilsCrossed,
  Users,
  Bell,
  ArrowLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  LogOut,
  Loader2,
  Volume2,
  VolumeX,
  ImagePlus,
  MonitorPlay,
  DollarSign,
  ClipboardList,
  MapPin,
} from 'lucide-react'

import { useStoreStatus } from '@/store/store-status'
import { FinanceTab } from './components/finance-tab'
import { InventoryTab } from './components/inventory-tab'
import { DeliveryTab } from './components/delivery-tab'
import { CustomerProfileModal } from './components/customer-profile'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'

type Order = {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: { name: string; quantity: number; price: number; removed_ingredients: string[] }[]
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  status: OrderStatus
  created_at: string
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  ingredients: string[]
  available: boolean
  model_3d_url?: string | null
}

type Customer = {
  id: string
  email: string
  full_name: string
  phone: string
  address?: string
  total_spent: number
  order_count: number
  created_at: string
}

type Banner = {
  id: string
  image_url: string
  title: string
  active: boolean
  order: number
  product_id?: string | null
  created_at: string
}

const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered']

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  preparing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  ready: 'bg-green-500/20 text-green-500 border-green-500/30',
  out_for_delivery: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'banners' | 'customers' | 'finance' | 'inventory' | 'delivery'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productsError, setProductsError] = useState<string | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'hamburgueres',
    ingredients: '',
    image_url: '',
    available: true,
    model_3d_url: '',
  })

  // Banner form state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [bannerForm, setBannerForm] = useState({
    title: '',
    image_url: '',
    active: true,
    order: '0',
    product_id: '',
  })

  // Customer Profile state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  // Image Picker Helper
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        callback(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Check admin auth
  const { isOpen: storeIsOpen, toggle: toggleStore, refresh: refreshStore, isLoading: storeLoading } = useStoreStatus()

  useEffect(() => {
    refreshStore()
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setCheckingAuth(false)
        return
      }

      const result = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (result.error) {
        console.warn('[Admin] Profile query error:', result.error.message)
        // Fallback: check by known admin email
        if (user.email === 'sabor@admin.com') {
          setIsAdmin(true)
        }
        setCheckingAuth(false)
        return
      }

      const profile = result.data as { role: string } | null
      if (profile?.role === 'admin') {
        setIsAdmin(true)
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  // Create audio for new order alert
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = null
  }, [])

  const playAlert = useCallback(() => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      oscillator.start()
      setTimeout(() => {
        oscillator.stop()
        audioCtx.close()
      }, 300)
      // Second beep
      setTimeout(() => {
        const audioCtx2 = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const osc2 = audioCtx2.createOscillator()
        const gain2 = audioCtx2.createGain()
        osc2.connect(gain2)
        gain2.connect(audioCtx2.destination)
        osc2.frequency.value = 1000
        osc2.type = 'sine'
        gain2.gain.value = 0.3
        osc2.start()
        setTimeout(() => {
          osc2.stop()
          audioCtx2.close()
        }, 300)
      }, 350)
    } catch {
      // Audio not supported
    }
  }, [soundEnabled])

  // Dedicated products loader with error handling
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true)
    setProductsError(null)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[Admin] Products fetch error:', error)
      setProductsError(error.message)
    } else {
      setProducts(data ?? [])
    }
    setLoadingProducts(false)
  }, [])

  // Fetch data
  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      const [ordersRes, customersRes, bannersRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'customer').order('total_spent', { ascending: false }),
        supabase.from('banners').select('*').order('order'),
      ])

      if (ordersRes.data) setOrders(ordersRes.data)
      if (customersRes.data) setCustomers(customersRes.data)
      if (bannersRes.data) setBanners(bannersRes.data)
      setLoading(false)
    }

    fetchData()
    loadProducts()

    // Real-time orders
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev])
          setNewOrderAlert(true)
          playAlert()
          setTimeout(() => setNewOrderAlert(false), 5000)
        }
      )
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
  }, [isAdmin, playAlert, loadProducts])

  // Re-fetch products every time admin opens the menu tab
  useEffect(() => {
    if (isAdmin && activeTab === 'menu') {
      loadProducts()
    }
  }, [activeTab, isAdmin, loadProducts])

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    await supabase.from('orders').update({ status: newStatus } as never).eq('id', orderId)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    )
  }

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = STATUS_FLOW.indexOf(current)
    if (idx < STATUS_FLOW.length - 1) return STATUS_FLOW[idx + 1]
    return null
  }

  // Product CRUD
  const handleSaveProduct = async () => {
    const data = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      ingredients: productForm.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
      image_url: productForm.image_url || '/products/default.jpg',
      available: productForm.available === true, // força boolean explícito
      model_3d_url: productForm.model_3d_url || null,
    }

    if (editingProduct) {
      const { error } = await supabase.from('products').update(data as never).eq('id', editingProduct.id)
      if (error) { alert('Erro ao atualizar produto: ' + error.message); return; }
    } else {
      const { data: newProduct, error } = await supabase.from('products').insert(data as never).select().single()
      if (error) { alert('Erro ao criar produto: ' + error.message); return; }
      if (newProduct) setProducts((prev) => [...prev, newProduct])
    }
    resetProductForm()
    // Re-busca do banco para garantir que o estado local reflete o que foi salvo
    await loadProducts()
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { alert('Erro ao excluir: ' + error.message); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const resetProductForm = () => {
    setEditingProduct(null)
    setShowProductForm(false)
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'hamburgueres',
      ingredients: '',
      image_url: '',
      available: true,
      model_3d_url: '',
    })
  }

  const startEditProduct = (p: Product) => {
    setEditingProduct(p)
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      category: p.category,
      ingredients: p.ingredients.join(', '),
      image_url: p.image_url,
      available: p.available,
      model_3d_url: p.model_3d_url || '',
    })
    setShowProductForm(true)
  }

  // Banner CRUD
  const handleSaveBanner = async () => {
    const data = {
      title: bannerForm.title,
      image_url: bannerForm.image_url,
      active: bannerForm.active,
      order: parseInt(bannerForm.order) || 0,
      product_id: bannerForm.product_id || null,
    }

    if (editingBanner) {
      const { error } = await supabase.from('banners').update(data as never).eq('id', editingBanner.id)
      if (error) { alert('Erro ao atualizar banner: ' + error.message); return; }
      setBanners((prev) => prev.map((b) => (b.id === editingBanner.id ? { ...b, ...data } : b)))
    } else {
      const { data: newBanner, error } = await supabase.from('banners').insert(data as never).select().single()
      if (error) { alert('Erro ao criar banner: ' + error.message); return; }
      if (newBanner) setBanners((prev) => [...prev, newBanner])
    }
    resetBannerForm()
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) { alert('Erro ao excluir: ' + error.message); return; }
    setBanners((prev) => prev.filter((b) => b.id !== id))
  }

  const resetBannerForm = () => {
    setEditingBanner(null)
    setShowBannerForm(false)
    setBannerForm({ title: '', image_url: '', active: true, order: '0', product_id: '' })
  }

  const startEditBanner = (b: Banner) => {
    setEditingBanner(b)
    setBannerForm({
      title: b.title,
      image_url: b.image_url,
      active: b.active,
      order: b.order.toString(),
      product_id: b.product_id || '',
    })
    setShowBannerForm(true)
  }

  // Auth check screens
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-card border border-border rounded-2xl p-8 max-w-md">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-danger/50" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Esta área é exclusiva para administradores. Faça login com uma conta de administrador.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
            </Link>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image 
                  src="/logo.png" 
                  alt="Sabor Raiz" 
                  fill 
                  sizes="32px"
                  className="object-contain" 
                />
              </div>
            </Link>
            <div>
              <h1 className="font-bold font-display flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Painel Admin
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Order Alert */}
            {newOrderAlert && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success text-sm font-semibold animate-pulse-gold">
                <Bell className="h-4 w-4" />
                Novo Pedido!
              </div>
            )}

            <div className="flex items-center gap-4">
            {/* Store Status Toggle */}
            <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border transition-all duration-500 ${
              storeIsOpen 
                ? "bg-green-50 border-green-100 text-green-700 shadow-[0_2px_10px_rgba(34,197,94,0.1)]" 
                : "bg-red-50 border-red-100 text-red-700 shadow-[0_2px_10px_rgba(239,68,68,0.1)]"
            }`}>
              <div className="flex flex-col items-end">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter opacity-60 leading-none">Status</span>
                <span className="text-xs sm:text-sm font-black leading-none">{storeIsOpen ? 'ABERTO' : 'FECHADO'}</span>
              </div>
              <input 
                type="checkbox"
                checked={storeIsOpen} 
                onChange={toggleStore}
                disabled={storeLoading}
                className="w-10 h-5 bg-gray-200 rounded-full appearance-none checked:bg-green-500 relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-xl"
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold">Painel Administrativo</span>
                <span className="text-[10px] text-muted-foreground">Logado como Sabor</span>
              </div>
            </div>
          </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/'
              }}
              className="rounded-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-1 bg-secondary/50 p-1 rounded-xl mb-6">
          {[
            { key: 'orders' as const, label: 'Pedidos', icon: Package },
            { key: 'menu' as const, label: 'Cardápio', icon: UtensilsCrossed },
            { key: 'banners' as const, label: 'Banners', icon: MonitorPlay },
            { key: 'customers' as const, label: 'Clientes', icon: Users },
            { key: 'finance' as const, label: 'Financeiro', icon: DollarSign },
            { key: 'inventory' as const, label: 'Estoque', icon: ClipboardList },
            { key: 'delivery' as const, label: 'Entregas', icon: MapPin },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <>
            {/* ===== ORDERS TAB ===== */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhum pedido ainda</p>
                    <p className="text-sm">Novos pedidos aparecerão aqui em tempo real</p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const nextStatus = getNextStatus(order.status)
                    return (
                      <div
                        key={order.id}
                        className="bg-card border border-border rounded-2xl p-4 sm:p-6 card-premium animate-fade-in"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">#{order.order_number}</span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
                                {ORDER_STATUS_LABELS[order.status]}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(new Date(order.created_at))}
                            </p>
                          </div>

                          {nextStatus && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                              className="gap-1"
                            >
                              {ORDER_STATUS_LABELS[nextStatus]}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-4 p-3 rounded-lg bg-secondary/30">
                          <div><span className="text-muted-foreground">Nome:</span> {order.customer_name}</div>
                          <div><span className="text-muted-foreground">Tel:</span> {order.customer_phone}</div>
                          <div><span className="text-muted-foreground">End:</span> {order.customer_address}</div>
                        </div>

                        {/* Items */}
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <div>
                                <span>{item.quantity}x {item.name}</span>
                                {item.removed_ingredients?.length > 0 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    (sem {item.removed_ingredients.join(', ')})
                                  </span>
                                )}
                              </div>
                              <span>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                          <span className="text-sm text-muted-foreground">
                            Entrega: {formatCurrency(order.delivery_fee)}
                          </span>
                          <span className="font-bold text-lg text-primary">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ===== MENU TAB ===== */}
            {activeTab === 'menu' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold font-display">Gestão do Cardápio</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={loadProducts}
                      disabled={loadingProducts}
                      className="gap-1"
                    >
                      {loadingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : '↺'} Atualizar
                    </Button>
                    <Button
                      onClick={() => {
                        resetProductForm()
                        setShowProductForm(true)
                      }}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" /> Novo Produto
                    </Button>
                  </div>
                </div>

                {/* Product Form Slide-up */}
                <Sheet open={showProductForm} onOpenChange={setShowProductForm}>
                  <SheetContent side="bottom" className="h-[90vh] sm:h-auto p-0 overflow-hidden border-none rounded-t-[32px]">
                    <div className="flex flex-col h-full max-h-[90vh]">
                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto p-6 pb-32">
                        <SheetHeader className="mb-8">
                          <SheetTitle className="text-2xl font-black text-brand-green">
                            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                          </SheetTitle>
                          <SheetDescription>
                            Preencha as informações para {editingProduct ? 'atualizar' : 'cadastrar'} o item.
                          </SheetDescription>
                        </SheetHeader>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Nome</label>
                            <Input
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              placeholder="Ex: Burger Sabor Raiz"
                              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Preço (R$)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              placeholder="0.00"
                              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Descrição</label>
                            <Input
                              value={productForm.description}
                              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                              placeholder="Descreva os sabores deste produto..."
                              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Categoria</label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                              className="flex h-14 w-full rounded-2xl border border-gray-100 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                            >
                              <option value="hamburgueres">Hambúrgueres</option>
                              <option value="combos">Combos</option>
                              <option value="bebidas">Bebidas</option>
                              <option value="sobremesas">Sobremesas</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Imagem do Produto</label>
                            <div className="flex gap-2">
                              <Input
                                value={productForm.image_url}
                                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                                placeholder="URL ou selecione..."
                                className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                              />
                              <Button type="button" variant="outline" className="h-14 w-14 shrink-0 relative overflow-hidden rounded-2xl border-gray-100" aria-label="Escolher Imagem">
                                <ImagePlus className="h-5 w-5 text-brand-orange" />
                                <input 
                                  type="file" 
                                  accept="image/png, image/jpeg, image/gif" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => handleImagePick(e, (base64) => setProductForm({ ...productForm, image_url: base64 }))} 
                                />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Ingredientes (separados por vírgula)</label>
                            <Input
                              value={productForm.ingredients}
                              onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                              placeholder="Pão, Carne, Queijo, ..."
                              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
                              <ImageIcon size={14} className="text-brand-orange" /> URL do Modelo 3D (.glb)
                            </label>
                            <Input
                              value={productForm.model_3d_url}
                              onChange={(e) => setProductForm({ ...productForm, model_3d_url: e.target.value })}
                              placeholder="https://exemplo.com/modelo.glb"
                              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                            />
                          </div>
                          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl sm:col-span-2 border border-gray-100">
                            <input
                              type="checkbox"
                              id="product-available-new"
                              checked={productForm.available}
                              onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                              className="w-6 h-6 accent-[#00a335] rounded-lg"
                            />
                            <label htmlFor="product-available-new" className="text-sm font-bold text-brand-green">Disponível para venda no aplicativo</label>
                          </div>
                        </div>
                      </div>

                      {/* Fixed Footer */}
                      <div className="p-6 bg-white border-t border-gray-100 flex gap-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <Button 
                          variant="outline" 
                          onClick={resetProductForm} 
                          className="flex-1 h-14 rounded-2xl border-gray-100 font-bold text-gray-400 hover:bg-gray-50 transition-all"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSaveProduct} 
                          className="flex-1 h-14 rounded-2xl bg-[#00a335] hover:bg-[#008a2d] text-white font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95"
                        >
                          {editingProduct ? 'Salvar' : 'Criar'}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Products List */}
                <div className="space-y-3">
                  {loadingProducts ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : productsError ? (
                    <div className="text-center py-12">
                      <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-20 text-danger" />
                      <p className="font-semibold text-danger mb-1">Erro ao carregar produtos</p>
                      <p className="text-xs text-muted-foreground mb-4">{productsError}</p>
                      <Button onClick={loadProducts} variant="outline" className="gap-2">
                        <Loader2 className="h-4 w-4" /> Tentar novamente
                      </Button>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Nenhum produto cadastrado</p>
                      <div className="flex gap-2 justify-center mt-4">
                        <Button onClick={loadProducts} variant="outline" className="gap-2">
                          <Loader2 className="h-4 w-4" /> Recarregar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center mt-1">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-base truncate">{product.name}</h3>
                              {!product.available && (
                                <Badge variant="danger">Indisponível</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                            <p className="text-sm font-bold text-primary mt-1">{formatCurrency(product.price)}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditProduct(product)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" /> Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-danger hover:text-danger hover:bg-danger/10 gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ===== BANNERS TAB ===== */}
            {activeTab === 'banners' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold font-display">Gestão de Banners</h2>
                  <Button
                    onClick={() => {
                      resetBannerForm()
                      setShowBannerForm(true)
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" /> Novo Banner
                  </Button>
                </div>

                {/* Banner Form Slide-up */}
                <Sheet open={showBannerForm} onOpenChange={setShowBannerForm}>
                  <SheetContent side="bottom" className="h-[80vh] sm:h-auto p-0 overflow-hidden border-none rounded-t-[32px]">
                    <div className="flex flex-col h-full max-h-[80vh]">
                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto p-6 pb-32">
                        <SheetHeader className="mb-8">
                          <SheetTitle className="text-2xl font-black text-brand-green">
                            {editingBanner ? 'Editar Banner' : 'Novo Banner'}
                          </SheetTitle>
                          <SheetDescription>
                            Configure as imagens promocionais da página inicial.
                          </SheetDescription>
                        </SheetHeader>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Título (Opcional)</label>
                            <Input
                              value={bannerForm.title}
                              onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                              placeholder="Ex: Promoção de Inauguração"
                              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Imagem do Banner</label>
                            <div className="flex gap-2">
                              <Input
                                value={bannerForm.image_url}
                                onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                                placeholder="URL ou selecione..."
                                className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                              />
                              <Button type="button" variant="outline" className="h-14 w-14 shrink-0 relative overflow-hidden rounded-2xl border-gray-100" aria-label="Escolher Imagem">
                                <ImagePlus className="h-5 w-5 text-brand-orange" />
                                <input 
                                  type="file" 
                                  accept="image/png, image/jpeg, image/gif" 
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => handleImagePick(e, (base64) => setBannerForm({ ...bannerForm, image_url: base64 }))} 
                                />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Ordem</label>
                            <Input
                              type="number"
                              value={bannerForm.order}
                              onChange={(e) => setBannerForm({ ...bannerForm, order: e.target.value })}
                              placeholder="Ex: 1"
                              className="h-14 rounded-2xl border-gray-100 focus:border-brand-orange transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-brand-green uppercase tracking-widest">Linkar a um Produto</label>
                            <select
                              value={bannerForm.product_id}
                              onChange={(e) => setBannerForm({ ...bannerForm, product_id: e.target.value })}
                              className="flex h-14 w-full rounded-2xl border border-gray-100 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange transition-all"
                            >
                              <option value="">Nenhum (Apenas imagem)</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl sm:col-span-2 border border-gray-100">
                            <input
                              type="checkbox"
                              id="banner-active-new"
                              checked={bannerForm.active}
                              onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                              className="w-6 h-6 accent-[#00a335] rounded-lg"
                            />
                            <label htmlFor="banner-active-new" className="text-sm font-bold text-brand-green">Banner Ativo e visível</label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Fixed Footer */}
                      <div className="p-6 bg-white border-t border-gray-100 flex gap-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <Button 
                          variant="outline" 
                          onClick={resetBannerForm} 
                          className="flex-1 h-14 rounded-2xl border-gray-100 font-bold text-gray-400 hover:bg-gray-50 transition-all"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSaveBanner} 
                          className="flex-1 h-14 rounded-2xl bg-[#00a335] hover:bg-[#008a2d] text-white font-bold shadow-lg shadow-green-900/20 transition-all active:scale-95"
                        >
                          {editingBanner ? 'Salvar' : 'Criar'}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Banners List */}
                <div className="space-y-3">
                  {banners.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MonitorPlay className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Nenhum banner cadastrado</p>
                      <Button onClick={async () => {
                        const { DEMO_BANNERS } = await import('@/lib/demo-data');
                        for (const b of DEMO_BANNERS) {
                          await supabase.from('banners').insert({
                            title: b.title, image_url: b.image_url, order: b.order, active: b.active
                          } as never);
                        }
                        window.location.reload();
                      }} className="mt-4" variant="outline">
                        Importar Banners Demo
                      </Button>
                    </div>
                  ) : (
                    banners.map((banner) => (
                      <div
                        key={banner.id}
                        className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center mt-1">
                            {banner.image_url ? (
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-base truncate">{banner.title || 'Sem título'}</h3>
                              {!banner.active && (
                                <Badge variant="danger">Inativo</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Ordem: {banner.order}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditBanner(banner)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" /> Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="text-danger hover:text-danger hover:bg-danger/10 gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ===== CUSTOMERS TAB ===== */}
            {activeTab === 'customers' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  CRM — Clientes
                </h2>

                {customers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhum cliente cadastrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Cliente</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Telefone</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Pedidos</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Total Gasto</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Ticket Médio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr 
                            key={customer.id} 
                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setShowCustomerModal(true)
                            }}
                          >
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-semibold text-sm">{customer.full_name || '—'}</p>
                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm">{customer.phone || '—'}</td>
                            <td className="py-3 px-2 text-sm text-right">{customer.order_count || 0}</td>
                            <td className="py-3 px-2 text-sm text-right font-semibold text-primary">
                              {formatCurrency(customer.total_spent || 0)}
                            </td>
                            <td className="py-3 px-2 text-sm text-right">
                              {customer.order_count
                                ? formatCurrency((customer.total_spent || 0) / customer.order_count)
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            {/* ===== FINANCE TAB ===== */}
            {activeTab === 'finance' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Painel Financeiro
                </h2>
                <FinanceTab orders={orders} />
              </div>
            )}

            {/* ===== INVENTORY TAB ===== */}
            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Controle de Estoque
                </h2>
                <InventoryTab />
              </div>
            )}

            {/* ===== DELIVERY TAB ===== */}
            {activeTab === 'delivery' && (
              <div>
                <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Gestão de Entregas
                </h2>
                <DeliveryTab />
              </div>
            )}
          </>
        )}
      </div>

      <CustomerProfileModal
        customer={selectedCustomer}
        orders={orders}
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onUpdate={(updated) => {
          setCustomers(customers.map(c => c.id === updated.id ? updated : c))
          setSelectedCustomer(updated)
        }}
      />
    </div>
  )
}
