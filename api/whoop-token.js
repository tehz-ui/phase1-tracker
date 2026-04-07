const SB_URL = 'https://rjvukihlwbdjdzguunsv.supabase.co/rest/v1/whoop_tokens'
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const SB_HEADERS = {
  'apikey': SB_KEY,
  'Authorization': 'Bearer ' + SB_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates'
}

const WHOOP_CLIENT_ID = 'cd5c6b15-4076-4727-9679-7832ccedacca'
const WHOOP_SECRET = process.env.WHOOP_SECRET || ''
const WHOOP_REDIRECT = 'https://phase1-tracker.vercel.app/whoop-callback'
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { code, refresh_token } = req.body || {}

  try {
    let body
    if (code) {
      body = 'grant_type=authorization_code&code=' + encodeURIComponent(code) +
        '&redirect_uri=' + encodeURIComponent(WHOOP_REDIRECT) +
        '&client_id=' + WHOOP_CLIENT_ID +
        '&client_secret=' + encodeURIComponent(WHOOP_SECRET)
    } else if (refresh_token) {
      body = 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refresh_token) +
        '&client_id=' + WHOOP_CLIENT_ID +
        '&client_secret=' + encodeURIComponent(WHOOP_SECRET)
    } else {
      return res.status(400).json({ error: 'Missing code or refresh_token' })
    }

    const resp = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })

    if (!resp.ok) {
      const errText = await resp.text()
      return res.status(resp.status).json({ error: errText })
    }

    const data = await resp.json()
    const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString()

    // Upsert via direct REST API (bypasses schema cache)
    const saveResp = await fetch(SB_URL + '?on_conflict=user_id', {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify({
        user_id: 'default',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at
      })
    })
    const saveText = await saveResp.text()

    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at,
      saved: saveResp.ok,
      saveStatus: saveResp.status,
      saveResponse: saveText || null
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
