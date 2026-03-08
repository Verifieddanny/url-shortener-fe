import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, Lock, LogIn } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      const { auth_token } = data;
      localStorage.setItem('token', auth_token);

      navigate({ to: "/dashboard" })

    } catch (error) {
      console.error("Failed to shorten", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-[#eee] shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-[#0f172a]">Welcome back</h2>
          <p className="text-[#64748b] font-medium">Log in to your account to manage your links.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#475569] ml-1">Username</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-[#94a3b8]" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="devtessy"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#475569] ml-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-[#94a3b8]" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-[#64748b] font-medium">Remember me</span>
            </label>
            <a href="#" className="text-blue-600 font-bold hover:text-blue-700">Forgot password?</a>
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? 'Logging in...' : 'Sign in'}
            {!loading && <LogIn size={18} />}
          </button>
        </form>

        {/* <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#eee]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-[#94a3b8] font-bold">Or continue with</span>
          </div>
        </div> */}

        {/* <div className="grid grid-cols-1 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 border border-[#e2e8f0] rounded-xl font-bold text-[#475569] hover:bg-slate-50 transition-all">
            <Github size={18} />
            GitHub
          </button>
        </div> */}

        <p className="text-center text-sm text-[#64748b] font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
