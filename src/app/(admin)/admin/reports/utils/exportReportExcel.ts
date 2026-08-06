import { toast } from 'sonner'
import { InventoryReceiptItem } from '../components/AuditTrailLogTable'

export function exportReportExcel(receipts: InventoryReceiptItem[]) {
  if (receipts.length === 0) {
    return toast.warning('Chưa có dữ liệu để xuất file báo cáo!')
  }

  let csvContent = '\uFEFF'
  csvContent += 'MÃ PHIẾU,SẢN PHẨM,SỐ LƯỢNG NHẬP,ĐƠN GIÁ NHẬP,THÀNH TIỀN,GHI CHÚ,NGÀY TẠO\n'

  for (const t of receipts) {
    const prodName = t.products?.name || t.product_id
    const totalAmount = Number(t.import_quantity) * Number(t.import_price)
    const dateText = new Date(t.created_at).toLocaleString('vi-VN')

    csvContent += `"${t.id}","${prodName}",${t.import_quantity},${t.import_price},${totalAmount},"${t.notes || ''}","${dateText}"\n`
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `BaoCao_PhieuNhapKho_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.success('Đã xuất file báo cáo phiếu nhập kho Excel (.csv) thành công!')
}
