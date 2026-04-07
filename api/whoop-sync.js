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
  const readResp = await fetch(SB_URL + '?user_id=eq.default&select=*&limit=1', {
    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
  })
  if (!readResp.ok) return null
  const rows = await readResp.json()
  if (!rows.length) return null
  const tok = rows[0]

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
    const BASE = 'https://api.prod.whoop.com/developer'

    // Try v1 first, fall back to v2 for recovery and sleep
    const recUrls = [
      BASE + '/v1/recovery?limit=1',
      BASE + '/v1/cycle/recovery?limit=1',
      BASE + '/v2/recovery?limit=1'
    ]
    const slpUrls = [
      BASE + '/v1/activity/sleep?limit=1',
      BASE + '/v1/sleep?limit=1',
      BASE + '/v2/activity/sleep?limit=1'
    ]
    const cycUrl = BASE + '/v1/cycle?limit=1'

    // Helper: try URLs in order, return first non-404
    async function tryUrls(urls) {
      const attempts = []
      for (const url of urls) {
        const r = await fetch(url, { headers: hd })
        const text = await r.text()
        attempts.push({ url, status: r.status, body: text })
        if (r.status !== 404) return { resp: r, text, attempts }
      }
      return { resp: null, text: '', attempts }
    }

    const [recResult, slpResult, cycR] = await Promise.all([
      tryUrls(recUrls),
      tryUrls(slpUrls),
      fetch(cycUrl, { headers: hd })
    ])

    const cycText = await cycR.text()

    const debug = {
      recovery: { attempts: recResult.attempts },
      sleep: { attempts: slpResult.attempts },
      cycle: { url: cycUrl, status: cycR.status, raw: cycText }
    }

    const recText = recResult.text
    const slpText = slpResult.text

    const result = {}

    // Parse recovery
    try {
      const recD = JSON.parse(recText)
      const rec = (recD.records && recD.records[0]) || recD[0] || null
      if (rec) {
        const score = rec.score || rec
        if (score.recovery_score != null) result.whoopRecovery = Math.round(score.recovery_score)
        if (score.hrv_rmssd_milli != null) result.hrv = Math.round(score.hrv_rmssd_milli)
        if (score.resting_heart_rate != null) result.rhr = Math.round(score.resting_heart_rate)
      }
    } catch (e) { debug.recovery.parseError = e.message }

    // Parse sleep
    try {
      const slpD = JSON.parse(slpText)
      const slp = (slpD.records && slpD.records[0]) || slpD[0] || null
      if (slp) {
        const score = slp.score || slp
        if (score.sleep_performance_percentage != null) result.sleepScore = Math.round(score.sleep_performance_percentage)
        if (slp.end && slp.start) {
          result.sleepHours = +((new Date(slp.end) - new Date(slp.start)) / 3600000).toFixed(1)
        }
      }
    } catch (e) { debug.sleep.parseError = e.message }

    // Parse cycle (strain)
    try {
      const cycD = JSON.parse(cycText)
      const cyc = (cycD.records && cycD.records[0]) || cycD[0] || null
      if (cyc) {
        const score = cyc.score || cyc
        if (score.strain != null) result.whoopStrain = +(+score.strain).toFixed(1)
      }
    } catch (e) { debug.cycle.parseError = e.message }

    return res.status(200).json({ data: result, debug })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
