'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Banner } from '@/types/database'
import { Plus, Edit2, Trash2, Image as ImageIcon, ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminBannersPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  // FORM STATE
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    display_order: 0,
    is_active: true
  })

  const fetchBanners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Lỗi tải danh sách banners:', error.message)
      // Standard fallback empty array if table not created in database yet
      setBanners([])
    } else if (data) {
      setBanners(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      image_url: '',
      link_url: '/products',
      display_order: banners.length + 1,
      is_active: true
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      display_order: banner.display_order,
      is_active: banner.is_active
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.image_url) {
      toast.error('Vui lòng điền tiêu đề và đường dẫn hình ảnh!')
      return
    }

    if (editingBanner) {
      // CẬP NHẬT BANNER
      const { error } = await supabase
        .from('banners')
        .update({
          title: formData.title,
          image_url: formData.image_url,
          link_url: formData.link_url || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        })
        .eq('id', editingBanner.id)

      if (error) {
        toast.error(`Lỗi cập nhật: ${error.message}`)
      } else {
        toast.success('Đã cập nhật banner truyền thông!')
        setIsModalOpen(false)
        fetchBanners()
      }
    } else {
      // THÊM BANNER MỚI
      const { error } = await supabase
        .from('banners')
        .insert([{
          title: formData.title,
          image_url: formData.image_url,
          link_url: formData.link_url || null,
          display_order: formData.display_order,
          is_active: formData.is_active
        }])

      if (error) {
        toast.error(`Lỗi thêm mới: ${error.message}`)
      } else {
        toast.success('Đã thêm banner quảng cáo mới!')
        setIsModalOpen(false)
        fetchBanners()
      }
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa banner "${title}" không?`)) return

    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) {
      toast.error(`Lỗi xóa: ${error.message}`)
    } else {
      toast.success('Đã xóa banner!')
      fetchBanners()
    }
  }

  const handleToggleStatus = async (banner: Banner) => {
    const nextStatus = !banner.is_active
    const { error } = await supabase
      .from('banners')
      .update({ is_active: nextStatus })
      .eq('id', banner.id)

    if (error) {
      toast.error(`Lỗi đổi trạng thái: ${error.message}`)
    } else {
      toast.success(`Đã ${nextStatus ? 'bật' : 'tắt'} hiển thị banner`)
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: nextStatus } : b))
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#006838] uppercase bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
            <ImageIcon className="w-3.5 h-3.5" /> CMS BANNER MODULE
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Quản Lý Banner Truyền Thông B2B</h1>
          <p className="text-xs text-slate-500 mt-0.5">Thêm mới, sắp xếp thứ tự hiển thị banner quảng cáo Hero & khuyến mãi sỉ</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#006838] hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Thêm Banner Mới
          </button>
        </div>
      </div>

      {/* DANH SÁCH BANNERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">Đang tải danh sách banner...</div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-bold text-sm">Chưa có banner truyền thông nào!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy nhấn nút "Thêm Banner Mới" ở góc phải để đăng tải banner khuyến mãi sỉ hoặc đối tác F&B.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#006838] text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tạo Banner Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Thứ tự</th>
                  <th className="p-4">Hình Ảnh Banner</th>
                  <th className="p-4">Tiêu Đề Banner</th>
                  <th className="p-4">Liên Kết (URL)</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center font-bold text-slate-800">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        #{banner.display_order}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="w-32 h-16 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                      {banner.title}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">
                      {banner.link_url ? (
                        <a href={banner.link_url} target="_blank" rel="noreferrer" className="text-[#006838] hover:underline inline-flex items-center gap-1">
                          <span>{banner.link_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-normal">Không có link</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-extrabold text-[10px] cursor-pointer transition-colors ${
                          banner.is_active
                            ? 'bg-emerald-100 text-[#006838] hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {banner.is_active ? (
                          <><CheckCircle className="w-3 h-3" /> Đang Hiện</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Tắt Hiển Thị</>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id, banner.title)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-colors cursor-pointer"
                        title="Xóa banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FORM TẠO / SỬA BANNER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingBanner ? 'Chỉnh Sửa Banner Truyền Thông' : 'Thêm Banner Quảng Cáo Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề Banner *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tổng kho nguyên liệu F&B giá sỉ..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Hình Ảnh (Image URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Liên kết Đích (Link URL)</label>
                <input
                  type="text"
                  placeholder="VD: /products hoặc https://zalo.me/..."
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái ban đầu</label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                  >
                    <option value="active">Bật hiển thị</option>
                    <option value="inactive">Tắt ẩn</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#006838] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  {editingBanner ? 'Lưu Thay Đổi' : 'Tạo Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
