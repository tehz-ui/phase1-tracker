export default function handler(req, res) {
  return res.status(200).json({
    ok: true,
    hasSecret: !!process.env.WHOOP_SECRET,
    secretLength: (process.env.WHOOP_SECRET || '').length,
    hasClientId: true,
    clientId: 'cd5c6b15-4076-4727-9679-7832ccedacca',
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY
  })
}
