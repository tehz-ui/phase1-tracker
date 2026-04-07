const SB_URL = 'https://rjvukihlwbdjdzguunsv.supabase.co/rest/v1/whoop_tokens'
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || ''

export default async function handler(req, res) {
  try {
    const resp = await fetch(SB_URL + '?select=*', {
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY
      }
    })
    const text = await resp.text()
    return res.status(200).json({
      status: resp.status,
      keyLength: SB_KEY.length,
      keyPrefix: SB_KEY.substring(0, 10) + '...',
      body: text
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
