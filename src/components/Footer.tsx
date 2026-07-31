'use client'

import FooterDesktop from './Footer/FooterDesktop'
import FooterMobile from './Footer/FooterMobile'

export default function Footer() {
  return (
    <>
      {/* Footer dành riêng cho Desktop */}
      <FooterDesktop />

      {/* Footer dành riêng cho Mobile (Chuẩn thoáng mắt XXXLutz, Logo click chuyển về Trang chủ) */}
      <FooterMobile />
    </>
  )
}