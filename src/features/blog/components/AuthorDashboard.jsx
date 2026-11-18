import React, { useState, useEffect } from 'react'
import {
  IconPlus,
  IconSparkles,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconRefresh,
} from '@tabler/icons-react'
import {
  getAuthorPosts,
  getPostStats,
  createPost,
  updatePost,
  deletePost,
  togglePublishPost,
} from '../api/blogApi'
import { PostStats } from './PostStats'
import { PostModal } from '../modals/PostModal'
import { AiPostGeneratorModal } from '../modals/AiPostGeneratorModal'
import { formatDate, showConfirm, showToast, showAlert } from '../../../helpers/toolsHelper'

export const AuthorDashboard = ({ user, isDark, onNavigate }) => {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [activeKebabId, setActiveKebabId] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [postsRes, statsRes] = await Promise.all([
        getAuthorPosts(),
        getPostStats(),
      ])
      const rawPosts = postsRes?.data?.posts || postsRes?.data
      if (Array.isArray(rawPosts)) {
        setPosts(rawPosts)
      } else {
        setPosts([])
      }
      if (statsRes && statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data workspace.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTogglePublish = async (post) => {
    try {
      await togglePublishPost(post.id)
      showToast(
        post.is_published
          ? 'Artikel diubah menjadi draf.'
          : 'Artikel berhasil diterbitkan!'
      )
      loadData()
    } catch (err) {
      showAlert('Gagal', err.message || 'Tidak dapat mengubah status artikel.', 'error')
    }
  }

  const handleDelete = async (post) => {
    setActiveKebabId(null)
    const confirmed = await showConfirm(
      'Hapus Artikel?',
      `Anda yakin ingin menghapus "${post.title}"? Tindakan ini permanen.`,
      'warning'
    )
    if (!confirmed) return

    try {
      await deletePost(post.id)
      showToast('Artikel berhasil dihapus.')
      loadData()
    } catch (err) {
      showAlert('Gagal', err.message || 'Tidak dapat menghapus artikel.', 'error')
    }
  }

  const handleOpenEdit = (post) => {
    setActiveKebabId(null)
    setSelectedPost(post)
    setIsPostModalOpen(true)
  }

  const handleSavePost = async (payload) => {
    if (selectedPost) {
      await updatePost(selectedPost.id, payload)
      showToast('Artikel berhasil diperbarui!')
    } else {
      await createPost(payload)
      showToast('Artikel berhasil dibuat!')
    }
    loadData()
  }

  const handleApplyAiDraft = (draft) => {
    setSelectedPost({
      title: draft.title || '',
      category: draft.category || 'Teknologi',
      tags: draft.tags || '',
      content: draft.content || '',
      is_published: false,
    })
    setIsPostModalOpen(true)
  }

  return (
    <div className="w-full max-w-[98vw] mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="author-dashboard">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Workspace Penulis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola draf, publikasikan artikel, dan gunakan asisten AI untuk produktivitas maksimal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Muat Ulang"
          >
            <IconRefresh size={18} />
          </button>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <IconSparkles size={18} />
            <span>AI Generator</span>
          </button>
          <button
            onClick={() => {
              setSelectedPost(null)
              setIsPostModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <IconPlus size={18} />
            <span>Tambah Artikel</span>
          </button>
        </div>
      </div>

      {/* 3 Statistik Cards */}
      <PostStats stats={stats} />

      {/* Content Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Daftar Artikel Saya
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {posts.length} Total
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">
            Memuat daftar artikel Anda...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Anda belum memiliki artikel. Mulai tulis artikel pertama Anda!
            </p>
            <button
              onClick={() => {
                setSelectedPost(null)
                setIsPostModalOpen(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Tulis Artikel Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5">Judul Artikel</th>
                  <th className="px-6 py-3.5">Kategori</th>
                  <th className="px-6 py-3.5">Waktu Baca</th>
                  <th className="px-6 py-3.5">Status Terbit</th>
                  <th className="px-6 py-3.5">Tanggal Dibuat</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white max-w-md">
                      <div className="line-clamp-2">{post.title}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        /posts/{post.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {post.category || 'Umum'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {post.reading_time || 1} menit
                    </td>
                    <td className="px-6 py-4">
                      {/* Switch toggle publish */}
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                          post.is_published
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200'
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            post.is_published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {post.is_published ? 'Terbit' : 'Draf'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      {/* Kebab Menu Button */}
                      <button
                        onClick={() =>
                          setActiveKebabId(activeKebabId === post.id ? null : post.id)
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        aria-label="Tindakan"
                      >
                        <IconDotsVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeKebabId === post.id && (
                        <div className="absolute right-6 top-12 z-20 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-left text-xs">
                          {post.is_published && (
                            <button
                              onClick={() => {
                                setActiveKebabId(null)
                                if (onNavigate) onNavigate(`/posts/${post.slug}`)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <IconEye size={15} />
                              <span>Lihat Artikel</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(post)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <IconEdit size={15} />
                            <span>Edit Artikel</span>
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                          >
                            <IconTrash size={15} />
                            <span>Hapus Artikel</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false)
          setSelectedPost(null)
        }}
        onSubmit={handleSavePost}
        initialData={selectedPost}
        isDark={isDark}
      />

      <AiPostGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyDraft={handleApplyAiDraft}
      />
    </div>
  )
}

export default AuthorDashboard
