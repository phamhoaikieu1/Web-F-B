import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Cho phép truy cập tự do vào trang Login của Admin
  if (pathname === '/admin/login') {
    return response
  }

  // 2. Chặn nếu vào bất kỳ trang /admin/* nào mà chưa Đăng Nhập
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // 3. Nếu User đã đăng nhập nhưng truy cập /admin/*: Đọc role từ profiles
  if (pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const allowedRoles = ['OWNER', 'ADMIN', 'STAFF']
    if (!profile || !allowedRoles.includes(profile.role)) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('error', 'unauthorized')
      redirectUrl.searchParams.set('message', 'Tài khoản của bạn không có quyền truy cập trang quản trị!')
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}