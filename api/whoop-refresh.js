const SB_URL = 'https://rjvukihlwbdjdzguunsv.supabase.co/rest/v1/whoop_tokens'
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const WHOOP_CLIENT_ID = 'cd5c6b15-4076-4727-9679-7832ccedacca'
const WHOOP_SECRET = process.env.WHOOP_SECRET || ''
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Read stored tokens
    const readResp = await fetch(SB_URL + '?user_id=eq.default&select=*&limit=1', {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
    })
    if (!readResp.ok) return res.status(500).json({ refreshed: false, error: 'db_read_failed' })
    const rows = await readResp.json()
    if (!rows.length) return res.status(200).json({ refreshed: false, error: 'no_token' })

    const tok = rows[0]
    if (!tok.refresh_token) return res.status(200).json({ refreshed: false, error: 'no_refresh_token' })

    // Exchange refresh token for new access token
    const resp = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(tok.refresh_token) +
        '&client_id=' + WHOOP_CLIENT_ID +
        '&client_secret=' + encodeURIComponent(WHOOP_SECRET)
    })

    if (!resp.ok) {
      const errText = await resp.text()
      return res.status(200).json({ refreshed: false, error: 'whoop_rejected', status: resp.status, detail: errText })
    }

    const data = await resp.json()
    const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString()

    // Save new tokens
    await fetch(SB_URL + '?on_conflict=user_id', {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: 'default',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at
      })
    })

    return res.status(200).json({ refreshed: true, expires_at })
  } catch (e) {
    return res.status(500).json({ refreshed: false, error: e.message })
  }
}
