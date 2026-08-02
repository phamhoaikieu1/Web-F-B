import { Product } from '@/types/database'

export interface CartItem {
  product: Product
  selectedUnit: string
  quantity: number
  unitPrice: number
}

export const CART_STORAGE_KEY = 'b2b_cart'
export const CART_UPDATED_EVENT = 'b2b_cart_updated'

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(CART_STORAGE_KEY)
  if (!saved) return []
  try {
    return JSON.parse(saved)
  } catch (e) {
    return []
  }
}

export function addItemToB2bCart(product: Product, selectedUnit: string = product.unit || 'gói', quantity: number = 1): CartItem[] {
  if (typeof window === 'undefined') return []
  
  const currentCart = getCartItems()
  const cartKey = `${product.id}-${selectedUnit}`
  
  const existingIndex = currentCart.findIndex(
    (item) => `${item.product.id}-${item.selectedUnit}` === cartKey
  )

  let updatedCart: CartItem[]

  if (existingIndex > -1) {
    updatedCart = [...currentCart]
    updatedCart[existingIndex].quantity += quantity
  } else {
    updatedCart = [
      ...currentCart,
      {
        product,
        selectedUnit,
        quantity,
        unitPrice: Number(product.price) || 0,
      },
    ]
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart))
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: updatedCart }))
  return updatedCart
}
