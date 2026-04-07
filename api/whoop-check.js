const SB_URL = 'https://rjvukihlwbdjdzguunsv.supabase.co/rest/v1/whoop_tokens'
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || ''

export default async function handler(req, res) {
  try {
    const readResp = await fetch(SB_URL + '?user_id=eq.default&select=user_id,expires_at&limit=1', {
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY
      }
    })
    const readText = await readResp.text()

    if (!readResp.ok) {
      return res.status(200).json({
        hasToken: false,
        error: 'Supabase REST error: ' + readResp.status + ' ' + readText
      })
    }

    let rows
    try { rows = JSON.parse(readText) } catch (e) {
      return res.status(200).json({ hasToken: false, error: 'Invalid JSON: ' + readText })
    }

    if (!rows.length) {
      return res.status(200).json({ hasToken: false, error: null })
    }

    const tok = rows[0]
    return res.status(200).json({
      hasToken: true,
      expires_at: tok.expires_at,
      expired: new Date(tok.expires_at) <= new Date(),
      error: null
    })
  } catch (e) {
    return res.status(500).json({ hasToken: false, error: e.message })
  }
}
