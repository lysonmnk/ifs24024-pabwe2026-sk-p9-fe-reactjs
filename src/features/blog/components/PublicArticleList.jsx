import React, { useState, useEffect } from 'react'
import {
  IconClock,
  IconUser,
  IconCalendar,
  IconArrowRight,
  IconSparkles,
} from '@tabler/icons-react'
import { getPublicPosts } from '../api/blogApi'
import { formatDate } from '../../../helpers/toolsHelper'

const CATEGORIES = [
  'Semua',
  'Teknologi',
  'Pendidikan',
  'Gaya Hidup',
  'Bisnis',
  'Opini',
  'Umum',
]

export const PublicArticleList = ({ searchTerm = '', onSelectArticle, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPublicPosts({
        search: searchTerm,
        category: selectedCategory,
      })
      const rawPosts = res?.data?.posts || res?.data
      if (Array.isArray(rawPosts)) {
        setPosts(rawPosts)
      } else {
        setPosts([])
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat artikel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [searchTerm, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="public-article-list">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {selectedCategory === 'Semua' ? 'Artikel Terbaru' : `Kategori: ${selectedCategory}`}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Jelajahi wawasan terkini dan analisis mendalam dari para penulis Delcom Blog
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {posts.length} Artikel
        </span>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-800 rounded-xl h-80 border border-slate-200 dark:border-slate-700"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 p-6">
          <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
          <button
            onClick={fetchArticles}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
          <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mb-3">
            <IconSparkles size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Tidak ada artikel ditemukan
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ada artikel yang cocok dengan kata kunci "${searchTerm}".`
              : 'Belum ada artikel yang diterbitkan untuk kategori ini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => {
                if (onSelectArticle) {
                  onSelectArticle(post)
                } else if (onNavigate) {
                  onNavigate(`/posts/${post.slug}`)
                }
              }}
              className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
            >
              {/* Cover Image */}
              <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 bg-linear-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                    <span className="font-bold text-lg opacity-40">{post.category || 'Delcom Blog'}</span>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-blue-600 dark:text-blue-400 backdrop-blur-xs shadow-xs">
                    {post.category || 'Umum'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 flex flex-col p-5">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <IconCalendar size={14} />
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                    <IconClock size={14} />
                    {post.reading_time || 1} menit baca
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 flex-1">
                  {post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : '')}
                </p>

                {/* Footer card */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-auto text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <IconUser size={14} className="text-blue-500" />
                    {post.author ? post.author.username : 'Penulis'}
                  </span>
                  <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                    Baca <IconArrowRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default PublicArticleList
