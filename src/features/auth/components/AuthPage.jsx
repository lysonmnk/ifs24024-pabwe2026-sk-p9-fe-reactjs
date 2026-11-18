import React, { useState } from 'react'
import { loginUser, registerUser } from '../api/authApi'
import { setToken, setUser } from '../../../helpers/apiHelper'
import { showAlert, showToast } from '../../../helpers/toolsHelper'

export const AuthPage = ({ mode = 'login', onAuthSuccess, onNavigate }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password || (!isLogin && !email)) {
      showAlert('Peringatan', 'Harap isi semua bidang formulir.', 'warning')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const res = await loginUser({ username, password })
        if (res && res.data) {
          setToken(res.data.token)
          setUser(res.data.user)
          showToast('Berhasil masuk!')
          if (onAuthSuccess) {
            onAuthSuccess(res.data.user)
          } else if (onNavigate) {
            onNavigate(res.data.user.role === 'admin' ? '/admin' : '/author')
          }
        }
      } else {
        await registerUser({ username, email, password })
        showAlert('Sukses', 'Registrasi berhasil! Silakan masuk dengan akun baru Anda.', 'success')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err) {
      showAlert('Gagal', err.message || 'Terjadi kesalahan saat memproses permintaan.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLogin ? 'Masuk ke Delcom Blog' : 'Daftar Akun Penulis'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isLogin
              ? 'Kelola artikel dan jelajahi konten multi-tier'
              : 'Mulai menulis artikel dan manfaatkan asisten AI'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isLogin && (
            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@delcom.org"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? (
            <p>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Daftar di sini
              </button>
            </p>
          ) : (
            <p>
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
