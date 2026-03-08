import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Link2, Copy, CheckCircle2, ArrowRight, AlertCircle, X } from 'lucide-react'

// Define the search params type for safety
type IndexSearch = {
  expired?: boolean
}

// createFileRoute helps TanStack Router generate type-safe routes automatically
export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    return {
      expired: search.expired === 'true' || search.expired === true,
    }
  },
})

function Index() {
  const { expired } = Route.useSearch()
  const [showExpiredAlert, setShowExpiredAlert] = useState(false)
  const [url, setUrl] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  interface FetchedDemoUrl {
    message: string
    url: string
    expiresAt?: string
  }

  useEffect(() => {
    if (expired) {
      setShowExpiredAlert(true)
    }
  }, [expired])

  const handleShorten = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!url) {
      return;
    }

    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/demo/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      const successData = data as FetchedDemoUrl;

      setShortenedUrl(successData.url)


    } catch (error) {
      console.error("Failed to shorten", error)
    } finally {
      setLoading(false)
    }

  }

  const copyToClipboard = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Expired Link Alert */}
      {showExpiredAlert && (
        <div className="w-full bg-amber-50 border-b border-amber-100 p-4 animate-in fade-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">The demo link you followed has expired and is no longer available.</p>
            </div>
            <button type='button' title='close' onClick={() => setShowExpiredAlert(false)} className="text-amber-500 hover:text-amber-700 cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full pt-20 pb-32 px-4 bg-linear-to-b from-white to-[#f8fafc]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-2">
            <span>Powering 1M+ redirects daily</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#0f172a] tracking-tight leading-[1.1]">
            Shorten your links, <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
              Expand your reach.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#64748b] max-w-2xl mx-auto font-medium">
            A minimalist, high-performance URL shortener built for developers and businesses.
            Track analytics, set expiration dates, and customize slugs.
          </p>

          {/* Shorten Box */}
          <div className="mt-12 max-w-2xl mx-auto p-2 bg-white rounded-2xl shadow-xl shadow-blue-500/5 border border-[#eee] relative">
            <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative flex items-center">
                <Link2 className="absolute left-4 text-[#94a3b8]" size={18} />
                <input
                  type="url"
                  placeholder="Paste your long URL here..."
                  className="w-full pl-11 pr-4 py-4 bg-transparent border-none focus:ring-0 outline-none text-[#0f172a] text-lg font-medium"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); console.log(e.target.value) }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? 'Shortening...' : 'Shorten Now'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Result Display */}
            {shortenedUrl && (
              <div className="absolute -bottom-24 left-0 right-0 p-4 bg-white rounded-xl shadow-lg border border-blue-100 flex items-center justify-between animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">Your demo shortened link is ready</p>
                    <p className="text-[#0f172a] font-mono font-semibold">{shortenedUrl}</p>
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                    }`}
                >
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-4 w-full bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-600 text-white font-bold text-2xl rounded-xl flex items-center justify-center mx-auto md:mx-0">
              <p>{"<>"}</p>
            </div>
            <h3 className="text-xl font-bold text-[#0f172a]">Smart Analytics</h3>
            <p className="text-[#64748b] leading-relaxed">
              Track clicks, referrers, and locations for every link you share in real-time.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold text-2xl rounded-xl flex items-center justify-center mx-auto md:mx-0">
              <p>{"::"}</p>

            </div>
            <h3 className="text-xl font-bold text-[#0f172a]">Custom Slugs</h3>
            <p className="text-[#64748b] leading-relaxed">
              Create memorable branded links that increase CTR by up to 34%.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-600 text-white font-bold text-2xl rounded-xl flex items-center justify-center mx-auto md:mx-0">
              <p>{"O"}</p>

            </div>
            <h3 className="text-xl font-bold text-[#0f172a]">Link Expiration</h3>
            <p className="text-[#64748b] leading-relaxed">
              Set your links to expire automatically after a certain date or click count.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
