import { Product } from '@/types/database'
import { getB2BUnitPrice } from './pricing'

export interface CartItem {
  product: Product
  quantity: number // Luôn là tổng số lượng đơn vị cơ sở (base_unit)
  unitPrice: number // Đơn giá B2B cho 1 base_unit
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

/**
 * Thêm sản phẩm vào giỏ hàng B2B (Mỗi product.id chỉ có duy nhất 1 dòng)
 * @param product Sản phẩm nguyên liệu
 * @param addBaseQuantity Số lượng đơn vị cơ sở (base_unit) cần cộng thêm (ví dụ: +1 hoặc +conversion_rate)
 */
export function addItemToB2bCart(
  product: Product,
  addBaseQuantity: number = 1
): CartItem[] {
  if (typeof window === 'undefined') return []
  
  const currentCart = getCartItems()
  const productId = product.id
  
  const existingIndex = currentCart.findIndex(
    (item) => item.product.id === productId
  )

  let updatedCart: CartItem[]

  if (existingIndex > -1) {
    updatedCart = [...currentCart]
    const newQty = updatedCart[existingIndex].quantity + addBaseQuantity
    updatedCart[existingIndex].quantity = newQty
    updatedCart[existingIndex].product = product // Cập nhật thông tin mới nhất
    updatedCart[existingIndex].unitPrice = getB2BUnitPrice(product, newQty)
  } else {
    const unitPrice = getB2BUnitPrice(product, addBaseQuantity)
    updatedCart = [
      ...currentCart,
      {
        product,
        quantity: addBaseQuantity,
        unitPrice,
      },
    ]
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart))
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: updatedCart }))
  return updatedCart
}
