import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { User, Mail, Lock, UserPlus } from 'lucide-react'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.errors ? data.errors[0].msg : data.message
        throw new Error(errorMsg || 'Signup failed')
      }

      navigate({ to: '/login' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-2xl space-y-8 bg-white p-10 rounded-2xl border border-[#eee] shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-[#0f172a]">Create your account</h2>
          <p className="text-[#64748b] font-medium">Join thousands of users shortening links professionally.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
             <span>Error: {error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#475569] ml-1">First Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 text-[#94a3b8]" size={18} />
                <input
                  type="text"
                  name="firstName"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#475569] ml-1">Last Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 text-[#94a3b8]" size={18} />
                <input
                  type="text"
                  name="lastName"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#475569] ml-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-[#94a3b8]" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#475569] ml-1">Username</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 text-[#94a3b8]" size={18} />
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#475569] ml-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 text-[#94a3b8]" size={18} />
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy. 
              We'll never share your data with third parties.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <UserPlus size={18} />}
          </button>
        </form>

        <p className="text-center text-sm text-[#64748b] font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
