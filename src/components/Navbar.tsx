'use client'

import { useState, useEffect, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Profile, Category } from '@/types/database'
import NavbarDesktop from './navbar/NavbarDesktop'
import NavbarMobile from './navbar/NavbarMobile'

function NavbarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategoryParam = searchParams.get('category')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [categories, setCategories] = useState<Category[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('display_order')
      if (data) setCategories(data)
    }
    fetchCategories()

    const updateCounts = () => {
      const savedCart = localStorage.getItem('b2b_cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          setCartCount(parsed.reduce((sum: number, i: any) => sum + i.quantity, 0))
        } catch (e) {}
      } else { setCartCount(0) }

      const savedWishlist = localStorage.getItem('b2b_wishlist')
      if (savedWishlist) {
        try { setWishlistCount(JSON.parse(savedWishlist).length) } catch (e) {}
      } else { setWishlistCount(0) }
    }

    updateCounts()
    window.addEventListener('storage', updateCounts)
    const interval = setInterval(updateCounts, 1000)

    return () => {
      window.removeEventListener('storage', updateCounts)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
    }
    fetchUserProfile()
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Component Desktop: Chỉ hiện từ màn hình md trở lên */}
      <NavbarDesktop
        pathname={pathname}
        profile={profile}
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        currentCategoryParam={currentCategoryParam}
        onSignOut={handleSignOut}
      />

      {/* Component Mobile: Chỉ hiện trên màn hình điện thoại (< md) */}
      <NavbarMobile
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="bg-slate-900 h-16 w-full" />}>
      <NavbarContent />
    </Suspense>
  )
}