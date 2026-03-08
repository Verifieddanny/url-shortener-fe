import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { BarChart3, Link2, MousePointer2, MoreVertical, Search, Plus, ArrowRight, CheckCircle2, Copy, X, AlertCircle, Trash2, Info, Clock, Globe } from 'lucide-react'

// Define the search params type for safety
type DashboardSearch = {
  expired?: boolean
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    return {
      expired: search.expired === 'true' || search.expired === true,
    }
  },
})

function DashboardPage() {
  const { expired } = Route.useSearch()
  const [showExpiredAlert, setShowExpiredAlert] = useState(false)
  const [urls, setUrls] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'clicks'>('newest')
  const [loading, setLoading] = useState(true)
  const [showShortenForm, setShowShortenForm] = useState(false)
  
  // Action Menu & Stats State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [selectedStats, setSelectedStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Shorten Form State
  const [longUrl, setLongUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [shortenLoading, setShortenLoading] = useState(false)
  const [newUrl, setNewUrl] = useState<string | null>(null)
  
  // Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchUrls = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shorten/urls/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setUrls(data.urls)
      }
    } catch (error) {
      console.error("Failed to fetch URLs", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (shortCode: string) => {
    setStatsLoading(true)
    setStatsError(null)
    setShowStatsModal(true)
    setActiveMenuId(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shorten/${shortCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch stats")
      }
      
      setSelectedStats(data.data)
    } catch (err: any) {
      setStatsError(err.message)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchUrls()
    if (expired) {
      setShowExpiredAlert(true)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expired])

  const handleShorten = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setShortenLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shorten/shortner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url: longUrl,
          customCode: customCode || undefined,
          expiresAt: expiresAt || undefined
        })
      })
      const data = await response.json()
      if (response.ok) {
        setNewUrl(data.newUrl || data.url)
        fetchUrls()
      }
    } catch (error) {
      console.error("Shorten failed", error)
    } finally {
      setShortenLoading(false)
    }
  }

  const copyUrl = (shortCode: string, id: string) => {
    const fullUrl = `${import.meta.env.VITE_API_BASE_URL}/${shortCode}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    setActiveMenuId(null)
  }

  const totalClicks = urls.reduce((acc, curr) => acc + (curr.click || 0), 0)

  const filteredUrls = urls
    .filter(u => 
      u.longUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'clicks') return b.click - a.click
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Expired Link Alert */}
      {showExpiredAlert && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">The link you followed has expired and is no longer active.</p>
            </div>
            <button type='button' title='close' onClick={() => setShowExpiredAlert(false)} className="text-amber-500 hover:text-amber-700 cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Detail Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#eee] overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-[#eee] flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-extrabold text-[#0f172a] flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                Link Analytics
              </h2>
              <button type='button' title='close' onClick={() => { setShowStatsModal(false); setSelectedStats(null) }} className="p-2 hover:bg-white rounded-xl transition-all cursor-pointer text-[#94a3b8] hover:text-[#0f172a]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              {statsLoading ? (
                <div className="py-12 text-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#64748b] font-bold">Fetching latest data...</p>
                </div>
              ) : statsError ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-red-600 font-bold">{statsError}</p>
                </div>
              ) : selectedStats && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Total Engagement</p>
                      <p className="text-3xl font-black text-blue-900">{selectedStats.click} <span className="text-sm font-bold text-blue-600/70 ml-1">Clicks</span></p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Created On</p>
                      <p className="text-lg font-extrabold text-slate-800">{new Date(selectedStats.createAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Original Destination</label>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center gap-3">
                        <Globe size={16} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-bold text-slate-700 truncate">{selectedStats.originalUrl}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shortened URL</label>
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <Link2 size={16} className="text-blue-500 shrink-0" />
                          <span className="text-sm font-bold text-blue-700 truncate font-mono">{selectedStats.shortenedUrl}</span>
                        </div>
                        <button 
                         type='button' title='copy' 
                          onClick={() => copyUrl(selectedStats.shortenedUrl.split('/').pop(), 'stats')}
                          className="p-2 bg-white text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <Info size={14} className="text-amber-600 shrink-0" />
                    <p className="text-[11px] font-bold text-amber-700 leading-tight">Stats are calculated atomically and updated in real-time on every successful redirect.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Your Analytics</h1>
          <p className="text-[#64748b] font-medium mt-1">Monitor your links' performance and engagement.</p>
        </div>
        <button
          onClick={() => setShowShortenForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Plus size={20} />
          Create New Link
        </button>
      </div>

      {/* Shorten Modal */}
      {showShortenForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#eee] overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-[#eee] flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#0f172a]">Shorten a new URL</h2>
              <button  type='button' title='close'  onClick={() => { setShowShortenForm(false); setNewUrl(null); setLongUrl('') }} className="text-[#94a3b8] hover:text-[#0f172a] transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {!newUrl ? (
                <form onSubmit={handleShorten} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#475569] ml-1">Long URL</label>
                    <div className="relative flex items-center">
                      <Link2 className="absolute left-3 text-[#94a3b8]" size={18} />
                      <input
                        type="url"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="https://very-long-destination-url.com/path"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#475569] ml-1">Custom Slug (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                        placeholder="my-cool-link"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#475569] ml-1">Expiration (Optional)</label>
                      <input
                        title='expires at'
                        type="date"
                        className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={shortenLoading}
                    className="w-full py-4 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    {shortenLoading ? 'Shortening...' : 'Create Short Link'}
                    {!shortenLoading && <ArrowRight size={18} />}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#0f172a]">Link Created!</h3>
                    <p className="text-[#64748b] font-medium mt-1">Your shortened URL is ready to be shared.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-[#e2e8f0] rounded-2xl flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-600 truncate mr-4">{newUrl}</span>
                    <button
                      onClick={() => copyUrl(newUrl.split('/').pop() || '', 'new')}
                      className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${copiedId === 'new' ? 'bg-green-500 text-white' : 'bg-white border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 shadow-sm'
                        }`}
                    >
                      {copiedId === 'new' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {copiedId === 'new' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <button
                    onClick={() => { setNewUrl(null); setLongUrl(''); setShowShortenForm(false) }}
                    className="text-[#64748b] font-bold hover:text-[#0f172a] transition-colors cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-[#eee] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Link2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider">Total Links</p>
              <p className="text-3xl font-extrabold text-[#0f172a]">{urls.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#eee] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <MousePointer2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider">Total Clicks</p>
              <p className="text-3xl font-extrabold text-[#0f172a]">{totalClicks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#eee] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#94a3b8] uppercase tracking-wider">Avg. Clicks</p>
              <p className="text-3xl font-extrabold text-[#0f172a]">
                {urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#eee] shadow-sm relative z-10">
        <div className="p-6 border-b border-[#eee] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input
              type="text"
              placeholder="Search links..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setSortBy('newest')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${sortBy === 'newest' ? 'bg-white text-blue-600 shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
              >
                Newest
              </button>
              <button 
                onClick={() => setSortBy('clicks')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${sortBy === 'clicks' ? 'bg-white text-blue-600 shadow-sm' : 'text-[#64748b] hover:text-[#0f172a]'}`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-visible">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#64748b] font-medium">Loading your links...</p>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 text-[#94a3b8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a]">No links found</h3>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#eee]">
                    <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Original URL</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Short Link</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-center">Engagement</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee]">
                  {filteredUrls.map((url) => (
                    <tr 
                      key={url._id} 
                      className={`hover:bg-slate-50 transition-colors group ${activeMenuId === url._id ? 'relative z-50 bg-slate-50' : 'relative z-0'}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col max-w-xs md:max-w-md">
                          <span className="text-[#0f172a] font-bold truncate mb-0.5">{url.longUrl}</span>
                          <span className="text-[10px] text-[#94a3b8] font-black uppercase flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(url.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => copyUrl(url.shortCode, url._id)}
                          className={`group relative px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            copiedId === url._id 
                              ? 'bg-green-50 border-green-200 text-green-600 shadow-sm' 
                              : 'bg-blue-50/50 border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {copiedId === url._id ? <CheckCircle2 size={12} /> : <Link2 size={12} />}
                          /{url.shortCode}
                          {copiedId === url._id && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in-95 font-sans">
                              Copied!
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center">
                          <span className="text-[#0f172a] font-black text-lg leading-none">{url.click}</span>
                          <span className="text-[9px] font-black text-[#94a3b8] uppercase tracking-tighter mt-1">Clicks</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right relative overflow-visible">
                        <button 
                          type='button' 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === url._id ? null : url._id);
                          }}
                          className={`p-2 rounded-lg transition-all cursor-pointer ${activeMenuId === url._id ? 'bg-white shadow-sm text-[#0f172a] border-[#eee]' : 'text-[#94a3b8] hover:text-[#0f172a] border-transparent'} border relative z-10`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {activeMenuId === url._id && (
                          <div 
                            ref={menuRef}
                            className="absolute right-6 top-full mt-1 w-52 bg-white rounded-2xl shadow-2xl border border-[#eee] z-[100] overflow-hidden animate-in zoom-in-95 origin-top-right isolate"
                          >
                            <button 
                              onClick={() => copyUrl(url.shortCode, url._id)}
                              className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-[#475569] hover:bg-slate-50 transition-colors text-left cursor-pointer uppercase tracking-widest"
                            >
                              <Copy size={14} className="text-slate-400" />
                              Copy Link
                            </button>
                            <button 
                              onClick={() => fetchStats(url.shortCode)}
                              className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-blue-600 hover:bg-blue-50 transition-colors text-left cursor-pointer uppercase tracking-widest"
                            >
                              <BarChart3 size={14} className="text-blue-500" />
                              View Stats
                            </button>
                            <div className="border-t border-[#eee]"></div>
                            <button 
                              className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer uppercase tracking-widest"
                            >
                              <Trash2 size={14} className="text-red-400" />
                              Delete Link
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
