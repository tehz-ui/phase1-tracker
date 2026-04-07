const SB_URL = 'https://rjvukihlwbdjdzguunsv.supabase.co/rest/v1/whoop_tokens'
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || ''

export default async function handler(req, res) {
  try {
    const queryUrl = SB_URL + '?user_id=eq.default&select=user_id,expires_at&limit=1'
    const readResp = await fetch(queryUrl, {
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY
      }
    })
    const readText = await readResp.text()

    // Also fetch all rows unfiltered for debugging
    const allResp = await fetch(SB_URL + '?select=user_id,expires_at', {
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY
      }
    })
    const allText = await allResp.text()

    if (!readResp.ok) {
      return res.status(200).json({
        hasToken: false,
        queryUrl,
        queryStatus: readResp.status,
        queryResponse: readText,
        allRows: allText,
        error: 'Supabase REST error'
      })
    }

    let rows
    try { rows = JSON.parse(readText) } catch (e) {
      return res.status(200).json({ hasToken: false, queryUrl, rawResponse: readText, allRows: allText, error: 'Invalid JSON' })
    }

    let allRows
    try { allRows = JSON.parse(allText) } catch (e) { allRows = allText }

    if (!rows.length) {
      return res.status(200).json({ hasToken: false, queryUrl, filteredRows: rows, allRows, error: null })
    }

    const tok = rows[0]
    return res.status(200).json({
      hasToken: true,
      expires_at: tok.expires_at,
      expired: new Date(tok.expires_at) <= new Date(),
      queryUrl,
      filteredRows: rows,
      allRows,
      error: null
    })
  } catch (e) {
    return res.status(500).json({ hasToken: false, error: e.message })
  }
}
