import React, { useState, useEffect } from 'react'
import {
  IconUsers,
  IconArticle,
  IconShieldCheck,
  IconRefresh,
  IconEye,
  IconCalendar,
} from '@tabler/icons-react'
import { getAllUsers, getAllPosts, getUserPosts } from '../api/adminApi'
import { formatDate } from '../../../helpers/toolsHelper'

export const AdminDashboard = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'posts'
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selectedUserPosts, setSelectedUserPosts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, postsRes] = await Promise.all([
        getAllUsers(),
        getAllPosts(),
      ])
      if (usersRes && usersRes.data && Array.isArray(usersRes.data.users)) {
        setUsers(usersRes.data.users)
      } else {
        setUsers([])
      }
      if (postsRes && postsRes.data && Array.isArray(postsRes.data.posts)) {
        setPosts(postsRes.data.posts)
      } else {
        setPosts([])
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data panel admin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleInspectUserPosts = async (targetUser) => {
    try {
      const res = await getUserPosts(targetUser.id)
      if (res && res.data) {
        setSelectedUserPosts(res.data)
      }
    } catch (err) {
      alert(err.message || 'Gagal memuat artikel pengguna.')
    }
  }

  return (
    <div className="w-full max-w-[98vw] mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
            <IconShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Panel
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitoring seluruh pengguna dan arsip postingan artikel sistem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-sm font-semibold"
          >
            <IconRefresh size={18} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => setActiveTab('users')}
          className={`p-6 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            activeTab === 'users'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Total Pengguna Terdaftar
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {users.length}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
            <IconUsers size={28} />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('posts')}
          className={`p-6 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            activeTab === 'posts'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-md'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Total Seluruh Postingan Sistem
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {posts.length}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
            <IconArticle size={28} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Direktori Pengguna ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'posts'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Arsip Seluruh Artikel ({posts.length})
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">
            Memuat data administrasi...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : activeTab === 'users' ? (
          /* Users Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Username</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Total Artikel</th>
                  <th className="px-6 py-3.5">Total Terbit</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{u.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {u.total_posts !== undefined ? u.total_posts : '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {u.published_posts !== undefined ? u.published_posts : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleInspectUserPosts(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                        title="Lihat Artikel Pengguna Ini"
                      >
                        <IconEye size={14} />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Posts Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5">Judul Artikel</th>
                  <th className="px-6 py-3.5">Penulis</th>
                  <th className="px-6 py-3.5">Kategori</th>
                  <th className="px-6 py-3.5">Status</th>
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
                      <div className="line-clamp-1">{post.title}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        /posts/{post.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {post.author ? post.author.username : 'ID: ' + post.author_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {post.category || 'Umum'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          post.is_published
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.is_published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {post.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {post.is_published ? (
                        <button
                          onClick={() => onNavigate && onNavigate(`/posts/${post.slug}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-100 transition cursor-pointer"
                        >
                          <IconEye size={14} />
                          <span>Baca</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Draf</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Posts Modal */}
      {selectedUserPosts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-purple-700 text-white">
              <div>
                <h3 className="font-bold text-lg">
                  Artikel Penulis: {selectedUserPosts.user ? selectedUserPosts.user.username : 'User'}
                </h3>
                <p className="text-xs text-purple-200">
                  Total {selectedUserPosts.posts ? selectedUserPosts.posts.length : 0} artikel
                </p>
              </div>
              <button
                onClick={() => setSelectedUserPosts(null)}
                className="p-1.5 text-purple-200 hover:text-white rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {selectedUserPosts.posts && selectedUserPosts.posts.length > 0 ? (
                selectedUserPosts.posts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {p.title}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {p.category} • {formatDate(p.created_at)}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        p.is_published
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.is_published ? 'Terbit' : 'Draf'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-500">
                  Belum ada artikel yang dibuat oleh pengguna ini.
                </p>
              )}
            </div>
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-right">
              <button
                onClick={() => setSelectedUserPosts(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-300 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
