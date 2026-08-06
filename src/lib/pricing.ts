import { Product } from '@/types/database'

/**
 * BR-01: Tính đơn giá B2B tự động cho 1 đơn vị cơ sở (base_unit: Chai/Hộp/Gói)
 * - baseQuantity: Tổng số lượng đơn vị cơ sở trong giỏ hàng.
 * - Nếu baseQuantity >= wholesale_min_qty -> wholesale_price / base_unit
 * - Ngược lại -> retail_price / base_unit
 */
export function getB2BUnitPrice(
  product: Partial<Product>,
  baseQuantity: number
): number {
  const retailBase = Number(product.retail_price ?? (product as any).selling_price ?? (product as any).price ?? 0)
  const wholesaleBase = Number(product.wholesale_price ?? retailBase)
  const minQty = Number(product.wholesale_min_qty ?? 1)

  if (minQty > 0 && baseQuantity >= minQty) {
    return wholesaleBase
  }
  return retailBase
}

/**
 * Hàm phân tích quy đổi hiển thị số lượng gồm Thùng + Lẻ
 * Ví dụ: 13 Hộp (gồm 1 Thùng + 1 Hộp lẻ)
 */
export function formatUnitQuantityBreakdown(
  product: Product,
  baseQuantity: number
): string {
  const conversion = Number(product.conversion_rate || 1)
  const unitName = product.unit || 'Thùng'
  const baseUnitName = product.base_unit || 'Cái'

  if (conversion <= 1) {
    return `${baseQuantity} ${baseUnitName}`
  }

  const wholesaleCount = Math.floor(baseQuantity / conversion)
  const remainderBaseCount = baseQuantity % conversion

  if (wholesaleCount > 0 && remainderBaseCount > 0) {
    return `${baseQuantity} ${baseUnitName} (gồm ${wholesaleCount} ${unitName} + ${remainderBaseCount} ${baseUnitName} lẻ)`
  } else if (wholesaleCount > 0 && remainderBaseCount === 0) {
    return `${baseQuantity} ${baseUnitName} (gồm ${wholesaleCount} ${unitName})`
  }

  return `${baseQuantity} ${baseUnitName}`
}
