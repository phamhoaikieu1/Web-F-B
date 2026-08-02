import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra Auth Session của người gọi API
    const cookieStore = await cookies()
    const supabaseUserClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jnbdouzepmcdpzlrexbi.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabaseUserClient.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Bạn chưa đăng nhập!' },
        { status: 401 }
      )
    }

    // 2. Đọc role trong profiles của người gọi API
    const { data: callerProfile } = await supabaseUserClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!callerProfile || !['OWNER', 'ADMIN'].includes(callerProfile.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Quyền hạn không đủ để thao tác nhân sự!' },
        { status: 403 }
      )
    }

    // 3. Sử dụng Supabase Service Role Client để thực thi các thao tác Admin
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Lỗi 500: Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY trên server!' },
        { status: 500 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jnbdouzepmcdpzlrexbi.supabase.co'
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await req.json()
    const { action, staffId, requestedBy, reason, requestId, fullName, email, password, role, newPassword, newRole } = body

    // 1. THÊM TÀI KHOẢN NHÂN SỰ MỚI
    if (action === 'CREATE_STAFF') {
      if (!fullName || !email || !password) {
        return NextResponse.json({ success: false, message: 'Thiếu thông tin bắt buộc!' }, { status: 400 })
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password: password.trim(),
        email_confirm: true,
        user_metadata: { full_name: fullName.trim(), role: role || 'STAFF' },
      })

      if (authError) throw authError

      if (authData.user) {
        await supabaseAdmin.from('profiles').upsert({
          id: authData.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          role: role || 'STAFF',
        })
      }

      return NextResponse.json({ success: true, message: `Khởi tạo tài khoản ${email} thành công!` })
    }

    // 2. TRƯỞNG PHÒNG GỬI PHIẾU XIN DUYỆT XÓA NHÂN VIÊN
    if (action === 'REQUEST_DELETE') {
      if (!staffId || !requestedBy || !reason?.trim()) {
        return NextResponse.json({ success: false, message: 'Vui lòng điền lý do xin xóa nhân sự!' }, { status: 400 })
      }

      const { error } = await supabaseAdmin.from('deletion_requests').insert({
        staff_id: staffId,
        requested_by: requestedBy,
        reason: reason.trim(),
        status: 'PENDING',
      })

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Đã gửi Phiếu Yêu Cầu Xóa Nhân Sự tới Giám Đốc (CEO) phê duyệt!' })
    }

    // 3. GIÁM ĐỐC (CEO) DUYỆT XÓA VĨNH VIỄN
    if (action === 'APPROVE_DELETE') {
      if (!requestId || !staffId) {
        return NextResponse.json({ success: false, message: 'Thiếu mã yêu cầu!' }, { status: 400 })
      }

      // Xóa profile và Auth user
      await supabaseAdmin.from('profiles').delete().eq('id', staffId)
      try {
        await supabaseAdmin.auth.admin.deleteUser(staffId)
      } catch (e) {
        console.warn('Không thể xóa auth user qua service key:', e)
      }

      // Cập nhật trạng thái phiếu thành APPROVED
      await supabaseAdmin
        .from('deletion_requests')
        .update({ status: 'APPROVED', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      return NextResponse.json({ success: true, message: 'Giám Đốc (CEO) đã phê duyệt xóa vĩnh viễn tài khoản nhân sự!' })
    }

    // 4. GIÁM ĐỐC (CEO) TỪ CHỐI YÊU CẦU XÓA
    if (action === 'REJECT_DELETE') {
      if (!requestId) {
        return NextResponse.json({ success: false, message: 'Thiếu mã yêu cầu!' }, { status: 400 })
      }

      await supabaseAdmin
        .from('deletion_requests')
        .update({ status: 'REJECTED', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      return NextResponse.json({ success: true, message: 'Đã từ chối yêu cầu xóa nhân sự.' })
    }

    // 5. GIÁM ĐỐC (CEO) XÓA TRỰC TIẾP TÀI KHOẢN
    if (action === 'DIRECT_DELETE') {
      if (!staffId) return NextResponse.json({ success: false, message: 'Thiếu mã nhân viên!' }, { status: 400 })

      await supabaseAdmin.from('profiles').delete().eq('id', staffId)
      try {
        await supabaseAdmin.auth.admin.deleteUser(staffId)
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Đã xóa vĩnh viễn tài khoản nhân viên!' })
    }

    // 6. RESET MẬT KHẨU NHÂN SỰ
    if (action === 'RESET_PASSWORD') {
      if (!staffId || !newPassword?.trim()) {
        return NextResponse.json({ success: false, message: 'Vui lòng nhập mật khẩu mới!' }, { status: 400 })
      }

      try {
        await supabaseAdmin.auth.admin.updateUserById(staffId, { password: newPassword.trim() })
      } catch (err) {
        console.warn('Cập nhật pass auth admin thất bại:', err)
      }

      return NextResponse.json({ success: true, message: 'Đã reset mật khẩu mới cho nhân viên thành công!' })
    }

    // 7. CẬP NHẬT VAI TRÒ (THĂNG CHỨC / HẠ CHỨC)
    if (action === 'UPDATE_ROLE') {
      if (!staffId || !newRole) {
        return NextResponse.json({ success: false, message: 'Thiếu vai trò mới!' }, { status: 400 })
      }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', staffId)

      if (error) throw error

      return NextResponse.json({ success: true, message: `Đã cập nhật chức vụ thành công!` })
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ!' }, { status: 400 })
  } catch (error: any) {
    console.error('Lỗi API Quản lý nhân sự:', error)
    return NextResponse.json({ success: false, message: error.message || 'Lỗi xử lý server' }, { status: 500 })
  }
}
