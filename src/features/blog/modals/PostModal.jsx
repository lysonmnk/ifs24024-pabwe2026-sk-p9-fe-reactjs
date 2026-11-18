import React, { useState, useEffect } from 'react'
import { IconX, IconDeviceFloppy } from '@tabler/icons-react'
import { MarkdownEditor } from '../../../components/MarkdownEditor'
import { showAlert } from '../../../helpers/toolsHelper'

const CATEGORIES = [
  'Teknologi',
  'Pendidikan',
  'Gaya Hidup',
  'Bisnis',
  'Opini',
  'Umum',
]

export const PostModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isDark = false,
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setCategory(initialData.category || 'Teknologi')
      setTags(initialData.tags || '')
      setCoverImage(initialData.cover_image || '')
      setContent(initialData.content || '')
      setIsPublished(!!initialData.is_published)
    } else {
      setTitle('')
      setCategory('Teknologi')
      setTags('')
      setCoverImage('')
      setContent('')
      setIsPublished(false)
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!title || title.trim().length < 3) {
      showAlert('Peringatan', 'Judul artikel wajib diisi minimal 3 karakter.', 'warning')
      return
    }
    if (!content || !content.trim()) {
      showAlert('Peringatan', 'Konten artikel tidak boleh kosong.', 'warning')
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        category,
        tags: tags.trim(),
        cover_image: coverImage.trim(),
        content,
        is_published: isPublished,
      }
      await onSubmit(payload)
      if (onClose) onClose()
    } catch (err) {
      showAlert('Gagal', err.message || 'Terjadi kesalahan saat menyimpan artikel.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4"
      data-testid="post-modal"
    >
      <div className="w-full max-w-[96vw] max-h-[96vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Distinct Colored Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-700 text-white shadow-sm shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {initialData ? 'Perbarui Artikel' : 'Tulis Artikel Baru'}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">
              Gunakan Toast UI Markdown Editor untuk menyusun konten artikel berkualitas tinggi
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-blue-600 transition cursor-pointer"
            aria-label="Tutup"
          >
            <IconX size={22} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Judul Artikel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Menguasai Golang Gin dan React SPA Modern"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Tags (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="golang, gin, react, web"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Cover Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                URL Gambar Sampul (Opsional)
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Markdown Content Editor */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Isi Konten Artikel (Markdown) <span className="text-red-500">*</span>
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              height="400px"
              isDark={isDark}
            />
          </div>

          {/* Publish Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_published_checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 border-slate-300 dark:border-slate-700"
            />
            <label
              htmlFor="is_published_checkbox"
              className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Langsung publikasikan artikel (Status: {isPublished ? 'Terbit' : 'Draf'})
            </label>
          </div>
        </div>

        {/* Distinct Colored Footer with Batal and Simpan on the right */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pastikan artikel Anda orisinal dan mematuhi etika kepenulisan.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <IconDeviceFloppy size={18} />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostModal
