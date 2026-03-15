'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Shield, Plus, CheckCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const router = useRouter()
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setScans(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Shield className="text-green-400" />
            <span className="font-bold text-lg">Secure<span className="text-green-400">AI</span></span>
          </div>
          <Button
            onClick={() => router.push('/scan')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" /> New Scan
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Your Scan History</h1>
        <p className="text-white/40 mb-10">All your previous security scans</p>

        {loading ? (
          <p className="text-white/40">Loading...</p>
        ) : scans.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl border-dashed">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No scans yet</h2>
            <p className="text-white/40 mb-6">Run your first security scan</p>
            <Button
              onClick={() => router.push('/scan')}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 flex justify-between items-center hover:border-green-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                      {scan.language}
                    </span>
                    <span className="text-white/40 text-xs">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {scan.vulnerabilities?.length || 0} vulnerabilities found
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-black ${
                    scan.security_score >= 80 ? 'text-green-400' :
                    scan.security_score >= 50 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {scan.security_score}
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}