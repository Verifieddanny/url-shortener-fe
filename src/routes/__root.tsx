import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Link2, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  // LEARNING CURVE: GLOBAL AUTH STATE
  // In a professional app, you'd use a Context Provider or Zustand store.
  // This useEffect syncs the navbar with localStorage for this demo.
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
    }

    checkAuth()
    // Listen for storage changes (e.g., if login happens in another tab)
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fbfbfc] text-[#1a1a1a]">
      <header className="sticky top-0 z-50 w-full border-b border-[#eee] bg-white/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#0f172a]">
            <div className="p-1.5 bg-[#2563eb] rounded-lg text-white">
              <Link2 size={20} />
            </div>
            <span>ShortLink.io</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748b]">
            <Link 
              to="/" 
              activeProps={{ className: 'text-[#2563eb]' }}
              className="hover:text-[#2563eb] transition-colors"
            >
              Shorten
            </Link>
            {isLoggedIn && (
              <Link 
                to="/dashboard" 
                activeProps={{ className: 'text-[#2563eb]' }}
                className="hover:text-[#2563eb] transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  className="px-4 py-2 bg-[#2563eb] text-white text-sm font-semibold rounded-lg hover:bg-[#1d4ed8] transition-all shadow-sm shadow-blue-500/10"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              >
                <LogOut size={16} />
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#eee] py-12 bg-white">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-[#94a3b8]">© 2026 ShortLink.io — Modern, Secure, and Efficient URL Shortening.</p>
        </div>
      </footer>
      
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}
