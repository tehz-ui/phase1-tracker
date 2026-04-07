import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://rjvukihlwbdjdzguunsv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_TqFpcIrATpjISbazf38XpQ_1wLzwz_t'
)

export default async function handler(req, res) {
  try {
    const { data, error } = await sb.from('whoop_tokens').select('user_id, expires_at').eq('user_id', 'default').single()
    return res.status(200).json({
      hasToken: !!data,
      expires_at: data ? data.expires_at : null,
      expired: data ? new Date(data.expires_at) <= new Date() : null,
      error: error ? error.message : null
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
