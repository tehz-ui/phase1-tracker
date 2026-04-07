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
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'
const WHOOP_API = 'https://api.prod.whoop.com/developer/v1'

async function getValidToken() {
  // Read token via direct REST
  const readResp = await fetch(SB_URL + '?user_id=eq.default&select=*&limit=1', {
    headers: {
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY
    }
  })
  if (!readResp.ok) return null
  const rows = await readResp.json()
  if (!rows.length) return null
  const tok = rows[0]

  // Refresh if expired
  if (new Date(tok.expires_at) <= new Date()) {
    const rr = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(tok.refresh_token) +
        '&client_id=' + WHOOP_CLIENT_ID +
        '&client_secret=' + encodeURIComponent(WHOOP_SECRET)
    })
    if (!rr.ok) return null
    const rd = await rr.json()
    tok.access_token = rd.access_token
    tok.refresh_token = rd.refresh_token
    tok.expires_at = new Date(Date.now() + rd.expires_in * 1000).toISOString()

    // Save refreshed token via direct REST
    await fetch(SB_URL + '?on_conflict=user_id', {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify({
        user_id: 'default',
        access_token: tok.access_token,
        refresh_token: tok.refresh_token,
        expires_at: tok.expires_at
      })
    })
  }

  return tok.access_token
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { date } = req.body || {}
  if (!date) return res.status(400).json({ error: 'Missing date' })

  try {
    const token = await getValidToken()
    if (!token) return res.status(401).json({ error: 'no_token' })

    const hd = { 'Authorization': 'Bearer ' + token }
    const startISO = date + 'T00:00:00.000Z'
    const endISO = date + 'T23:59:59.999Z'

    const [recR, slpR, cycR] = await Promise.all([
      fetch(WHOOP_API + '/recovery?start=' + startISO + '&end=' + endISO, { headers: hd }),
      fetch(WHOOP_API + '/activity/sleep?start=' + startISO + '&end=' + endISO, { headers: hd }),
      fetch(WHOOP_API + '/cycle?start=' + startISO + '&end=' + endISO, { headers: hd })
    ])

    const result = {}

    if (recR.ok) {
      const recD = await recR.json()
      const rec = recD.records && recD.records[0]
      if (rec && rec.score) {
        result.whoopRecovery = Math.round(rec.score.recovery_score)
        result.hrv = Math.round(rec.score.hrv_rmssd_milli)
        result.rhr = Math.round(rec.score.resting_heart_rate)
      }
    }

    if (slpR.ok) {
      const slpD = await slpR.json()
      const slp = slpD.records && slpD.records[0]
      if (slp) {
        if (slp.score) result.sleepScore = Math.round(slp.score.sleep_performance_percentage)
        if (slp.end && slp.start) {
          result.sleepHours = +((new Date(slp.end) - new Date(slp.start)) / 3600000).toFixed(1)
        }
      }
    }

    if (cycR.ok) {
      const cycD = await cycR.json()
      const cyc = cycD.records && cycD.records[0]
      if (cyc && cyc.score) {
        result.whoopStrain = +cyc.score.strain.toFixed(1)
        if (cyc.score.step_count != null) result.steps = cyc.score.step_count
      }
    }

    return res.status(200).json(result)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
