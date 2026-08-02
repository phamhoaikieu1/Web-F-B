import { CartItem, CART_STORAGE_KEY, CART_UPDATED_EVENT, getCartItems } from './cart'

export const WISHLIST_STORAGE_KEY = 'b2b_wishlist'
export const CUSTOMER_INFO_STORAGE_KEY = 'b2b_customer_info'

/**
 * 1. HÀM XÓA SẠCH DỮ LIỆU LOCAL KHI ĐĂNG XUẤT (Logout Privacy Guard)
 */
export function clearLocalGuestData() {
  if (typeof window === 'undefined') return

  // Xóa sạch các dữ liệu nhạy cảm lưu tạm
  localStorage.removeItem(CART_STORAGE_KEY)
  localStorage.removeItem(WISHLIST_STORAGE_KEY)
  localStorage.removeItem(CUSTOMER_INFO_STORAGE_KEY)

  // Phát sự kiện thông báo toàn ứng dụng cập nhật Badge giỏ hàng & yêu thích về 0
  window.dispatchEvent(new Event('storage'))
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: [] }))
}

/**
 * 2. THUẬT TOÁN GỘP DỒN GIỎ HÀNG & YÊU THÍCH KHI ĐĂNG NHẬP (Smart Merge)
 */
export async function mergeGuestCartToUser(supabase: any, user: any) {
  if (typeof window === 'undefined' || !user) return

  try {
    // BƯỚC 1: Đọc giỏ hàng & yêu thích tạm ở LocalStorage
    const localCart: CartItem[] = getCartItems()
    let localWishlist: string[] = []
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (savedWishlist) {
      try {
        localWishlist = JSON.parse(savedWishlist)
      } catch (e) {}
    }

    // BƯỚC 2: Đọc giỏ hàng & yêu thích đang lưu trên Supabase DB của User
    const dbCart: CartItem[] = user.user_metadata?.cart_items || []
    const dbWishlist: string[] = user.user_metadata?.wishlist_items || []

    // BƯỚC 3: Thuật toán gộp dồn Giỏ hàng (Cart Smart Merge)
    const mergedCartMap = new Map<string, CartItem>()

    // Đưa toàn bộ món cũ trên DB vào Map trước
    dbCart.forEach((item) => {
      const key = `${item.product.id}-${item.selectedUnit}`
      mergedCartMap.set(key, { ...item })
    })

    // Gộp dồn số lượng từ món ở Local
    localCart.forEach((localItem) => {
      const key = `${localItem.product.id}-${localItem.selectedUnit}`
      if (mergedCartMap.has(key)) {
        const existing = mergedCartMap.get(key)!
        existing.quantity += localItem.quantity
      } else {
        mergedCartMap.set(key, { ...localItem })
      }
    })

    const mergedCart = Array.from(mergedCartMap.values())

    // Thuật toán gộp dồn Yêu thích (Wishlist Union Array)
    const mergedWishlistSet = new Set<string>([...dbWishlist, ...localWishlist])
    const mergedWishlist = Array.from(mergedWishlistSet)

    // BƯỚC 4: Lưu kết quả gộp mới lên Supabase DB
    await supabase.auth.updateUser({
      data: {
        cart_items: mergedCart,
        wishlist_items: mergedWishlist,
      },
    })

    // Đồng bộ lại LocalStorage và UI
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mergedCart))
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(mergedWishlist))

    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: mergedCart }))

    return { mergedCart, mergedWishlist }
  } catch (error) {
    console.error('Lỗi khi đồng bộ giỏ hàng & yêu thích:', error)
  }
}
