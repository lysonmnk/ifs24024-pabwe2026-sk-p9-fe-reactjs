import React, { useState, useEffect } from 'react'
import { StickyNavbar } from './features/blog/components/StickyNavbar'
import { PublicArticleList } from './features/blog/components/PublicArticleList'
import { AuthPage } from './features/auth/components/AuthPage'
import { AuthModal } from './features/auth/modals/AuthModal'

const PublicArticleDetail = React.lazy(() =>
  import('./features/blog/components/PublicArticleDetail').then((m) => ({
    default: m.PublicArticleDetail,
  }))
)
const AuthorDashboard = React.lazy(() =>
  import('./features/blog/components/AuthorDashboard').then((m) => ({
    default: m.AuthorDashboard,
  }))
)
const AdminDashboard = React.lazy(() =>
  import('./features/admin/components/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
)
import { useTheme } from './hooks/useTheme'
import { getUser, removeToken, removeUser } from './helpers/apiHelper'
import { showToast } from './helpers/toolsHelper'

export const App = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  const [currentUser, setCurrentUser] = useState(() => getUser())
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (path) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path)
    }
    setCurrentPath(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = () => {
    removeToken()
    removeUser()
    setCurrentUser(null)
    showToast('Berhasil keluar dari akun.')
    navigate('/')
  }

  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
    if (user.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/author')
    }
  }

  // Parse route parameters e.g. /posts/:slug
  const renderRoute = () => {
    if (currentPath.startsWith('/posts/')) {
      const slug = currentPath.replace('/posts/', '')
      return (
        <PublicArticleDetail
          slug={slug}
          post={selectedArticle && selectedArticle.slug === slug ? selectedArticle : null}
          onBack={() => navigate('/')}
        />
      )
    }

    if (currentPath === '/author') {
      if (!currentUser) {
        return (
          <AuthPage
            mode="login"
            onAuthSuccess={handleAuthSuccess}
            onNavigate={navigate}
          />
        )
      }
      return (
        <AuthorDashboard
          user={currentUser}
          isDark={isDark}
          onNavigate={navigate}
        />
      )
    }

    if (currentPath === '/admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        return (
          <AuthPage
            mode="login"
            onAuthSuccess={handleAuthSuccess}
            onNavigate={navigate}
          />
        )
      }
      return <AdminDashboard user={currentUser} onNavigate={navigate} />
    }

    if (currentPath === '/login') {
      return (
        <AuthPage
          mode="login"
          onAuthSuccess={handleAuthSuccess}
          onNavigate={navigate}
        />
      )
    }

    if (currentPath === '/register') {
      return (
        <AuthPage
          mode="register"
          onAuthSuccess={handleAuthSuccess}
          onNavigate={navigate}
        />
      )
    }

    // Default: Public article list (/, /public)
    return (
      <PublicArticleList
        searchTerm={searchTerm}
        onSelectArticle={(post) => {
          setSelectedArticle(post)
          navigate(`/posts/${post.slug}`)
        }}
        onNavigate={navigate}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      <StickyNavbar
        user={currentUser}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full pb-16">
        <React.Suspense fallback={null}>{renderRoute()}</React.Suspense>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Delcom Blog Multi-Tier. Praktikum PABWE 2026.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App
