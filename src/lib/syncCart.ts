import { CartItem, CART_STORAGE_KEY, CART_UPDATED_EVENT, getCartItems } from './cart'

export const CUSTOMER_INFO_STORAGE_KEY = 'b2b_customer_info'

/**
 * 1. HÀM XÓA SẠCH DỮ LIỆU LOCAL KHI ĐĂNG XUẤT (Logout Privacy Guard)
 */
export function clearLocalGuestData() {
  if (typeof window === 'undefined') return

  // Xóa sạch các dữ liệu nhạy cảm lưu tạm
  localStorage.removeItem(CART_STORAGE_KEY)
  localStorage.removeItem(CUSTOMER_INFO_STORAGE_KEY)

  // Phát sự kiện thông báo toàn ứng dụng cập nhật Badge giỏ hàng về 0
  window.dispatchEvent(new Event('storage'))
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: [] }))
}

/**
 * 2. THUẬT TOÁN GỘP DỒN GIỎ HÀNG KHI ĐĂNG NHẬP (Smart Merge theo product.id)
 */
export async function mergeGuestCartToUser(supabase: any, user: any) {
  if (typeof window === 'undefined' || !user) return

  try {
    // BƯỚC 1: Đọc giỏ hàng tạm ở LocalStorage
    const localCart: CartItem[] = getCartItems()

    // BƯỚC 2: Đọc giỏ hàng đang lưu trên Supabase DB của User
    const dbCart: CartItem[] = user.user_metadata?.cart_items || []

    // BƯỚC 3: Thuật toán gộp dồn Giỏ hàng theo product.id
    const mergedCartMap = new Map<string, CartItem>()

    // Đưa toàn bộ món cũ trên DB vào Map trước
    dbCart.forEach((item) => {
      if (item?.product?.id) {
        mergedCartMap.set(item.product.id, { ...item })
      }
    })

    // Gộp dồn số lượng từ món ở Local
    localCart.forEach((localItem) => {
      if (localItem?.product?.id) {
        const productId = localItem.product.id
        if (mergedCartMap.has(productId)) {
          const existing = mergedCartMap.get(productId)!
          existing.quantity += localItem.quantity
        } else {
          mergedCartMap.set(productId, { ...localItem })
        }
      }
    })

    const mergedCart = Array.from(mergedCartMap.values())

    // BƯỚC 4: Lưu kết quả gộp mới lên Supabase DB
    await supabase.auth.updateUser({
      data: {
        cart_items: mergedCart,
      },
    })

    // Đồng bộ lại LocalStorage và UI
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mergedCart))

    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: mergedCart }))

    return { mergedCart }
  } catch (error) {
    console.error('Lỗi khi đồng bộ giỏ hàng:', error)
  }
}
