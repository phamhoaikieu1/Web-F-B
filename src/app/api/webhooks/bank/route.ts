import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Tạo Supabase client với Service Role Key (bypass RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * CỔNG WEBHOOK NHẬN TIỀN NGÂN HÀNG TỰ ĐỘNG
 * Tương thích format Casso / VietQR / SePay
 * 
 * Body payload mẫu:
 * {
 *   "id": 123,
 *   "description": "Thanh toan don FB-xxxx",
 *   "amount": 500000,
 *   "when": "2026-08-02T10:00:00+07:00",
 *   "bank_sub_acc_id": "0989830347"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Xác thực bảo mật qua Secret Key
    const webhookSecret = process.env.BANK_WEBHOOK_SECRET
    const headerSecret = request.headers.get('X-Webhook-Secret') || request.headers.get('secure-token') || ''

    if (!webhookSecret || headerSecret !== webhookSecret) {
      return NextResponse.json(
        { success: false, message: 'Chưa cấu hình BANK_WEBHOOK_SECRET hoặc sai mã bảo mật Webhook' },
        { status: 401 }
      )
    }

    // 2. Parse dữ liệu chuyển khoản
    const body = await request.json()

    // Hỗ trợ cả format Casso (data[] array) và format đơn lẻ
    const transactions = body.data ? (Array.isArray(body.data) ? body.data : [body.data]) : [body]

    const supabase = getAdminClient()
    const results: Array<{ order_code: string; status: string; message: string }> = []

    for (const txn of transactions) {
      const description = (txn.description || txn.content || '').toUpperCase()
      const amount = Math.abs(Number(txn.amount) || 0)

      // 3. Trích xuất Mã đơn hàng từ nội dung chuyển khoản
      // Hỗ trợ: FB-xxxx, FB xxxx, FBxxxx
      const orderCodeMatch = description.match(/FB[- ]?(\d{6,})/i)
        || description.match(/(FB-\w+)/i)

      if (!orderCodeMatch) {
        results.push({
          order_code: 'N/A',
          status: 'SKIPPED',
          message: `Không tìm thấy mã đơn hàng trong nội dung: "${txn.description}"`,
        })
        continue
      }

      // Chuẩn hóa mã đơn
      let orderCode = orderCodeMatch[0].replace(/\s+/g, '').toUpperCase()
      if (!orderCode.includes('-')) {
        orderCode = orderCode.replace(/^FB/, 'FB-')
      }

      // 4. Tìm đơn hàng tương ứng
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_code', orderCode)
        .single()

      if (orderError || !order) {
        results.push({
          order_code: orderCode,
          status: 'NOT_FOUND',
          message: `Không tìm thấy đơn hàng ${orderCode} trong hệ thống`,
        })
        continue
      }

      // 5. Kiểm tra đơn đã hoàn thành chưa
      if (order.status === 'COMPLETED' && order.payment_status === 'PAID') {
        results.push({
          order_code: orderCode,
          status: 'ALREADY_COMPLETED',
          message: `Đơn hàng ${orderCode} đã thanh toán trước đó`,
        })
        continue
      }

      // 6. So khớp số tiền
      const orderAmount = Number(order.total_amount) || 0
      const currentPaid = Number(order.paid_amount) || 0
      const newPaidTotal = currentPaid + amount

      let newPaymentStatus: string
      let newOrderStatus = order.status

      if (newPaidTotal >= orderAmount) {
        newPaymentStatus = 'PAID'
        newOrderStatus = 'COMPLETED'
      } else {
        newPaymentStatus = 'PARTIAL'
      }

      // 7. Cập nhật đơn hàng
      const updateData: Record<string, unknown> = {
        payment_status: newPaymentStatus,
        paid_amount: newPaidTotal,
        updated_at: new Date().toISOString(),
      }

      if (newOrderStatus === 'COMPLETED') {
        updateData.status = 'COMPLETED'
        updateData.completed_by_name = '🤖 Tự động xác nhận qua Ngân hàng VietQR/Casso'
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)

      if (updateError) {
        results.push({
          order_code: orderCode,
          status: 'ERROR',
          message: `Lỗi cập nhật đơn hàng: ${updateError.message}`,
        })
        continue
      }

      // 8. Ghi log vào system_audit_logs
      await supabase.from('system_audit_logs').insert({
        actor_id: null,
        actor_name: '🤖 Hệ thống Ngân hàng (Webhook)',
        target_name: `Đơn hàng ${orderCode}`,
        action: newPaymentStatus === 'PAID' ? 'HOÀN THÀNH TỰ ĐỘNG QUA NGÂN HÀNG' : 'NHẬN THANH TOÁN 1 PHẦN',
        details: `Nhận chuyển khoản ${amount.toLocaleString('vi-VN')}đ cho đơn ${orderCode}. Tổng đã thanh toán: ${newPaidTotal.toLocaleString('vi-VN')}đ / ${orderAmount.toLocaleString('vi-VN')}đ. Nội dung CK: "${txn.description}"`,
      })

      results.push({
        order_code: orderCode,
        status: newPaymentStatus === 'PAID' ? 'COMPLETED' : 'PARTIAL_PAID',
        message: `Đã ${newPaymentStatus === 'PAID' ? 'hoàn thành tự động' : 'ghi nhận thanh toán 1 phần'} cho đơn ${orderCode}`,
      })
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định'
    console.error('Webhook Bank Error:', errorMessage)
    return NextResponse.json(
      { success: false, message: `Lỗi xử lý webhook: ${errorMessage}` },
      { status: 500 }
    )
  }
}
