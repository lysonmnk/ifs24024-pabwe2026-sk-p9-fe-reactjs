import React from 'react'
import {
  IconNews,
  IconSun,
  IconMoon,
  IconLogin,
  IconUser,
  IconLogout,
  IconDashboard,
  IconShield,
  IconSearch,
} from '@tabler/icons-react'

export const StickyNavbar = ({
  user,
  searchTerm = '',
  onSearchChange,
  theme = 'light',
  onToggleTheme,
  onNavigate,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => onNavigate && onNavigate('/')}
          >
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <IconNews size={22} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Delcom<span className="text-blue-600 dark:text-blue-400">Blog</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Multi-Tier
              </span>
            </div>
          </div>

          {/* Search Input (Desktop & Tablet) */}
          {onSearchChange !== undefined && (
            <div className="flex-1 max-w-md relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari artikel berdasarkan judul atau konten..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition"
              />
            </div>
          )}

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Ubah Tema"
              title="Ubah Tema"
            >
              {theme === 'dark' ? <IconSun size={20} className="text-amber-400" /> : <IconMoon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate && onNavigate('/author')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Workspace Penulis"
                >
                  <IconDashboard size={18} />
                  <span className="hidden sm:inline">Workspace</span>
                </button>

                {user.role === 'admin' && (
                  <button
                    onClick={() => onNavigate && onNavigate('/admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                    title="Admin Panel"
                  >
                    <IconShield size={18} />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    title="Keluar"
                    aria-label="Keluar"
                  >
                    <IconLogout size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => (onOpenAuth ? onOpenAuth() : onNavigate && onNavigate('/login'))}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <IconLogin size={18} />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => onNavigate && onNavigate('/register')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition cursor-pointer"
                >
                  <IconUser size={18} />
                  <span>Daftar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search input */}
        {onSearchChange !== undefined && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default StickyNavbar
