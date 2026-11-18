import React, { useState, useEffect } from 'react'
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconUser,
  IconTag,
  IconShare,
} from '@tabler/icons-react'
import { getPublicPostBySlug } from '../api/blogApi'
import { MarkdownViewer } from '../../../components/MarkdownViewer'
import { formatDate, showToast } from '../../../helpers/toolsHelper'

export const PublicArticleDetail = ({ slug, post: initialPost, onBack }) => {
  const [post, setPost] = useState(initialPost || null)
  const [loading, setLoading] = useState(!initialPost && !!slug)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost)
      return
    }

    if (!slug) return

    const fetchPost = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getPublicPostBySlug(slug)
        if (res && res.data && res.data.post) {
          setPost(res.data.post)
        } else {
          setError('Artikel tidak ditemukan.')
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat artikel.')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug, initialPost])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Tautan artikel disalin ke clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse" data-testid="public-article-detail">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-8" />
        <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-8" />
        <div className="h-96 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center" data-testid="public-article-detail">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {error || 'Artikel Tidak Ditemukan'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Artikel yang Anda cari mungkin telah dihapus atau URL tidak valid.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            <IconArrowLeft size={16} />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <article className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="public-article-detail">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
        >
          <IconArrowLeft size={18} />
          Kembali ke Galeri
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <IconShare size={14} />
          Bagikan
        </button>
      </div>

      {/* Header Info */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            {post.category || 'Umum'}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <IconClock size={14} />
            {post.reading_time || 1} menit baca
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {(post.author ? post.author.username : 'P').charAt(0).toUpperCase()}
            </div>
            <span>{post.author ? post.author.username : 'Penulis'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <IconCalendar size={16} />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 max-h-[500px]">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Markdown Content */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700 shadow-xs mb-8 prose dark:prose-invert max-w-none">
        <MarkdownViewer content={post.content} />
      </div>

      {/* Tags */}
      {post.tags && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <IconTag size={14} />
            Tags:
          </span>
          {post.tags.split(',').map((tag, idx) => {
            const cleanTag = tag.trim()
            if (!cleanTag) return null
            return (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                #{cleanTag}
              </span>
            )
          })}
        </div>
      )}
    </article>
  )
}

export default PublicArticleDetail
