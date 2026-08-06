'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Post } from '@/types/database'
import { Plus, Edit2, Trash2, FileText, ExternalLink, RefreshCw, CheckCircle, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPostsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  // FORM STATE
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'CÔNG THỨC PHA CHẾ',
    thumbnail_url: '',
    excerpt: '',
    content: '',
    is_published: true
  })

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Lỗi tải danh sách bài viết:', error.message)
      setPosts([])
    } else if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // TỰ ĐỘNG TẠO SLUG TỪ TIÊU ĐỀ
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: generateSlug(val)
    }))
  }

  const handleOpenCreateModal = () => {
    setEditingPost(null)
    setFormData({
      title: '',
      slug: '',
      category: 'CÔNG THỨC PHA CHẾ',
      thumbnail_url: '',
      excerpt: '',
      content: '',
      is_published: true
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (post: Post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category || 'CÔNG THỨC PHA CHẾ',
      thumbnail_url: post.thumbnail_url || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      is_published: post.is_published
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.slug) {
      toast.error('Vui lòng nhập tiêu đề bài viết!')
      return
    }

    if (editingPost) {
      // CẬP NHẬT BÀI VIẾT
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          slug: formData.slug,
          category: formData.category,
          thumbnail_url: formData.thumbnail_url || null,
          excerpt: formData.excerpt || null,
          content: formData.content || null,
          is_published: formData.is_published
        })
        .eq('id', editingPost.id)

      if (error) {
        toast.error(`Lỗi cập nhật: ${error.message}`)
      } else {
        toast.success('Đã cập nhật bài viết / công thức!')
        setIsModalOpen(false)
        fetchPosts()
      }
    } else {
      // THÊM BÀI VIẾT MỚI
      const { error } = await supabase
        .from('posts')
        .insert([{
          title: formData.title,
          slug: formData.slug,
          category: formData.category,
          thumbnail_url: formData.thumbnail_url || null,
          excerpt: formData.excerpt || null,
          content: formData.content || null,
          is_published: formData.is_published
        }])

      if (error) {
        toast.error(`Lỗi thêm mới: ${error.message}`)
      } else {
        toast.success('Đã xuất bản công thức / bài viết mới!')
        setIsModalOpen(false)
        fetchPosts()
      }
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không?`)) return

    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      toast.error(`Lỗi xóa: ${error.message}`)
    } else {
      toast.success('Đã xóa bài viết!')
      fetchPosts()
    }
  }

  const handleTogglePublish = async (post: Post) => {
    const nextStatus = !post.is_published
    const { error } = await supabase
      .from('posts')
      .update({ is_published: nextStatus })
      .eq('id', post.id)

    if (error) {
      toast.error(`Lỗi đổi trạng thái: ${error.message}`)
    } else {
      toast.success(`Đã ${nextStatus ? 'xuất bản' : 'tắt'} bài viết`)
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: nextStatus } : p))
    }
  }

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#006838] uppercase bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
            <FileText className="w-3.5 h-3.5" /> CMS RECIPES & BLOG MODULE
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Quản Lý Bài Viết & Công Thức Pha Chế</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tạo bài viết hướng dẫn pha chế, xu hướng F&B & kinh nghiệm vận hành quán</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPosts}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#006838] hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Viết Bài / Công Thức Mới
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm công thức, tên bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-[#006838] rounded-xl text-xs font-medium focus:outline-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">{filteredPosts.length} bài viết</span>
      </div>

      {/* DANH SÁCH POSTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400">Đang tải bài viết...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-bold text-sm">Chưa có bài viết hay công thức pha chế nào!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Đăng công thức pha chế chuẩn vị để thu hút các chủ quán Trà Sữa & Cafe đặt sỉ nguyên liệu.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="bg-[#006838] text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Soạn Bài Viết Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="p-4 w-16">Ảnh</th>
                  <th className="p-4">Tiêu Đề & Đường Dẫn (Slug)</th>
                  <th className="p-4">Chuyên Mục</th>
                  <th className="p-4">Tóm Tắt</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                        {post.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <strong className="font-extrabold text-slate-900 block leading-tight truncate">{post.title}</strong>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">/{post.slug}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-[#006838] border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                        {post.category || 'CÔNG THỨC'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">
                      {post.excerpt || 'Chưa có tóm tắt...'}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-extrabold text-[10px] cursor-pointer transition-colors ${
                          post.is_published
                            ? 'bg-emerald-100 text-[#006838] hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {post.is_published ? (
                          <><CheckCircle className="w-3 h-3" /> Đã Xuất Bản</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Bản Nháp</>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(post)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold transition-colors cursor-pointer"
                        title="Xóa bài viết"
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

      {/* MODAL FORM TẠO / SỬA POST */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3 sticky top-0 bg-white z-10">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingPost ? 'Chỉnh Sửa Bài Viết / Công Thức' : 'Soạn Công Thức Pha Chế Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài viết / Công thức *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Công Thức Trà Sữa Ô Long Nướng Chuẩn Quán..."
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    placeholder="cong-thuc-tra-sua-o-long-nuong"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                  >
                    <option value="CÔNG THỨC PHA CHẾ">CÔNG THỨC PHA CHẾ</option>
                    <option value="KINH NGHIỆM MỞ QUÁN">KINH NGHIỆM MỞ QUÁN</option>
                    <option value="XU HƯỚNG F&B">XU HƯỚNG F&B</option>
                    <option value="TIN TỨC KHUYẾN MÃI">TIN TỨC KHUYẾN MÃI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ảnh Đại Diện (Thumbnail URL)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt ngắn (Excerpt)</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả ngắn gọn hương vị, ứng dụng nguyên liệu cho bài viết..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung bài viết / Nguyên liệu & Cách làm</label>
                <textarea
                  rows={6}
                  placeholder="Nhập nội dung chi tiết công thức, định lượng nguyên liệu và các bước thực hiện..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái xuất bản</label>
                <select
                  value={formData.is_published ? 'published' : 'draft'}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'published' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#006838]"
                >
                  <option value="published">Xuất bản công khai</option>
                  <option value="draft">Lưu bản nháp</option>
                </select>
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
                  {editingPost ? 'Lưu Thay Đổi' : 'Xuất Bản Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
