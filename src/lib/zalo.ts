export interface ZaloOrderPayload {
  customerName: string
  customerPhone: string
  customerAddress: string
  notes?: string
  totalAmount: number
  items: Array<{
    name: string
    unit: string
    quantity: number
    price: number
  }>
}

// Số điện thoại Zalo của Doanh nghiệp/Admin tiếp nhận đơn
const ADMIN_ZALO_PHONE = '0989830347' // Kiều có thể đổi thành SĐT Zalo của bạn

export function buildZaloCustomerMessage(data: ZaloOrderPayload): string {
  const itemList = data.items
    .map(
      (item) =>
        `• ${item.name}: ${item.quantity} ${item.unit} x ${Math.round(
          item.price
        ).toLocaleString('vi-VN')}đ`
    )
    .join('\n')

  return `🛒 [ĐƠN ĐẶT HÀNG MỚI TỪ KHÁCH HÀNG]
Chủ quán/Khách: ${data.customerName}
SĐT Zalo: ${data.customerPhone}
Địa chỉ giao: ${data.customerAddress}
${data.notes ? `Ghi chú: ${data.notes}\n` : ''}
📋 Danh sách món đặt:
${itemList}

💰 Tổng giá trị đơn: ${Math.round(data.totalAmount).toLocaleString('vi-VN')} VNĐ

Nhờ Shop xác nhận và giao hàng giúp tôi!`
}

export function getAdminZaloDeepLink(text: string): string {
  const encodedText = encodeURIComponent(text)
  return `https://zalo.me/${ADMIN_ZALO_PHONE}?text=${encodedText}`
}