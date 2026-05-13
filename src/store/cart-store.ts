import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
  removed_ingredients?: string[]
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (product_id: string) => void
  updateQuantity: (product_id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const qty = item.quantity || 1
        const existing = get().items.find(
          (i) =>
            i.product_id === item.product_id &&
            JSON.stringify((i.removed_ingredients || []).sort()) === JSON.stringify((item.removed_ingredients || []).sort())
        )
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product_id === item.product_id &&
              JSON.stringify((i.removed_ingredients || []).sort()) === JSON.stringify((item.removed_ingredients || []).sort())
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          })
        } else {
          const { quantity, ...itemWithoutQty } = item
          set({ items: [...get().items, { ...itemWithoutQty, quantity: qty, removed_ingredients: item.removed_ingredients || [] }] })
        }
      },
      removeItem: (product_id) => {
        set({ items: get().items.filter((i) => i.product_id !== product_id) })
      },
      updateQuantity: (product_id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.product_id !== product_id) })
        } else {
          set({
            items: get().items.map((i) =>
              i.product_id === product_id ? { ...i, quantity } : i
            ),
          })
        }
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      subtotal: () =>
        get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      totalItems: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: 'sabor-raiz-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
