import { createClient } from '@supabase/supabase-js'

// ─── Supabase ─────────────────────────────────────────────────────────────────
const sb = createClient(
  'https://rjvukihlwbdjdzguunsv.supabase.co',
  'sb_publishable_TqFpcIrATpjISbazf38XpQ_1wLzwz_t'
)

// ─── Whoop OAuth2 ────────────────────────────────────────────────────────────
var WHOOP_CLIENT_ID = 'cd5c6b15-4076-4727-9679-7832ccedacca'
var WHOOP_REDIRECT = 'https://phase1-tracker.vercel.app/whoop-callback'
var WHOOP_SCOPES = 'read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement'
var WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth'

// ─── Global state (window.* so inline event handlers can reach it) ────────────
const S = window.S = {
  data: { days: {}, zozo: {} },
  cur: new Date(),
  tab: 'today',
  zSub: 'input',
  showJ: false,
  showR: false,
  showCal: false,
  showExpert: false,
  expertLoading: false,
  expertResponse: '',
  whoopSyncing: false,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  colMob: true,
  colCor: true,
  colStr: true,
  colMT: true,
  colPU: true,
  colWalk: true,
  colFood: true,
  colMirror: true,
  colRef: true,
  colNotes: true,
  oLog: null
}

// ─── Constants ────────────────────────────────────────────────────────────────
var DY = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
var AQ_ALI = { t: '\u201CThe fight is won or lost far away from witnesses \u2014 behind the lines, in the gym, and long before I dance under those lights.\u201D', a: '\u2014 MUHAMMAD ALI' }
var AQ_ARI = { t: '\u201CWe are what we repeatedly do. Excellence, then, is not an act, but a habit.\u201D', a: '\u2014 ARISTOTLE' }

var MOB = [
  ['at','ATG Treadmill','3m back+2m fwd','A'],
  ['sc','SL calf raises','x12','A'],
  ['bc','BK calf raises','x12','A'],
  ['tb','Tib raises','x15','A'],
  ['ba','Banded ankle DF','30s/side L2x','A'],
  ['bl','SL balance','60-90s L first','A'],
  ['sz','Seiza+toes','1min','H'],
  ['as','ATG split squat','30s/side','H'],
  ['hm','Hip flexor march','10/side 2s hold','H'],
  ['wg','WGS','2x6/side','D'],
  ['nn','90/90+piriformis','1min x8/side','R'],
  ['co','Horse to Cossacks','x6/side','R'],
  ['sr','SL RDL','x10/side','P'],
  ['wa','Wall angels','x10','T'],
  ['ob','Open books','x8/side','T'],
  ['ct','Chin tucks','2x10 3s','T'],
  ['bh','Beast hold','20-30sx2','I'],
  ['pk','Plank','30s','I'],
  ['ds','Deep squat','2min','I'],
  ['dh','Dead hang','2min','I']
]

var COR = [
  ['xb','XBody KB swing','2x1min/side'],
  ['ch','Kneeling chop','2x10/side'],
  ['pt','Plank pull-thru','3x8/side'],
  ['db','Dead bug','2x10/side'],
  ['ca','Loaded carry','3x45s'],
  ['ho','Hollow+flutter','2x30s'],
  ['aw','ATW kneeling','2x30s/dir'],
  ['cr','Carioca carry','2x30s/dir']
]
var STR = [
  ['sw','KB Swings','3x15-20','44lb','Wk3-4:+1set Wk5-6:53lb'],
  ['rd','Stag RDL','2x10','20lb','35lb when stable'],
  ['gs','Goblet Squat','3x8-12','35lb','Wk3-4:2s pause'],
  ['pr','KB Press','2x10+1x4-6','35/44','Wk5-6:44lb'],
  ['ro','KB Row','3x8-10','44lb','Push top range'],
  ['kc','KB Carries','2x60-75s','44/35','Wk3-4:suitcase']
]
var ZZ = ['Waist','Chest','Hips','L Thigh','R Thigh','L Arm','R Arm','L Calf','R Calf','Shoulders','Neck']
var CI = {A:'\u{1F9B6}',H:'\u{1F9B5}',D:'\u{1F30D}',R:'\u{1F300}',P:'\u{1F519}',T:'\u{1F4AA}',I:'\u2696\uFE0F'}
var CNA = {A:'ANKLES',H:'HIPS',D:'DYNAMIC',R:'ROTATION',P:'POSTERIOR',T:'THORACIC',I:'INTEGRATION'}

var MOOD_E = ['\u{1F624}','\u{1F610}','\u{1F642}','\u{1F60A}','\u{1F525}']
var ENRG_E = ['\u{1FAAB}','\u{1F636}','\u{1F642}','\u26A1','\u{1F525}']

// Batman-style bat paths (wider wingspan, pointed ears, angular)
var _BATP = 'M50 9 L40 0 L36 10 L26 18 L2 42 L16 36 L22 50 L36 44 L50 52 L64 44 L78 50 L84 36 L98 42 L74 18 L64 10 L60 0 Z'
var _BATI = 'M50 15 L42 7 L39 15 L31 22 L10 41 L22 37 L27 48 L38 43 L50 49 L62 43 L73 48 L78 37 L90 41 L69 22 L61 15 L58 7 Z'
var BAT   = '<svg width="22" height="13" viewBox="0 0 100 55" fill="none"><path d="' + _BATP + '" fill="#7B3FA0"/><path d="' + _BATI + '" fill="#5C2D82"/></svg>'
var BAT_G = '<svg width="22" height="13" viewBox="0 0 100 55" fill="none"><path d="' + _BATP + '" fill="#39FF14"/><path d="' + _BATI + '" fill="#1EB00E"/></svg>'
var BATL  = '<svg width="40" height="24" viewBox="0 0 100 55" fill="none"><path d="' + _BATP + '" fill="#7B3FA0"/><path d="' + _BATI + '" fill="#5C2D82"/></svg>'
var BATL_G= '<svg width="40" height="24" viewBox="0 0 100 55" fill="none"><path d="' + _BATP + '" fill="#39FF14"/><path d="' + _BATI + '" fill="#1EB00E"/></svg>'

// ─── Utils ────────────────────────────────────────────────────────────────────
function dk(d) { return d.toISOString().split('T')[0] }
function wn(d) { return Math.floor((d - new Date('2026-04-06')) / (7 * 864e5)) + 1 }
function gt() { return S.data.days[dk(S.cur)] || {} }

window.uf = function(f, v) {
  var k = dk(S.cur)
  if (!S.data.days[k]) S.data.days[k] = {}
  S.data.days[k][f] = v
  sv()
}
window.tg = function(sec, id) {
  var k = dk(S.cur)
  var d = S.data.days[k] || {}
  var s = d[sec] || {}
  s[id] = !s[id]
  if (!S.data.days[k]) S.data.days[k] = {}
  S.data.days[k][sec] = s
  sv()
}

window.setSW = function(id, si, field, val) {
  var k = dk(S.cur)
  if (!S.data.days[k]) S.data.days[k] = {}
  var ss = JSON.parse(JSON.stringify(S.data.days[k].strengthSets || {}))
  if (!ss[id]) ss[id] = []
  while (ss[id].length <= si) ss[id].push({ w: '', r: '' })
  ss[id][si][field] = val
  S.data.days[k].strengthSets = ss
  sv()
}

window.hImg = function(el, tp) {
  var f = el.files[0]
  if (!f) return
  var r = new FileReader()
  r.onload = function(ev) {
    var k = dk(S.cur)
    if (!S.data.days[k]) S.data.days[k] = {}
    if (tp === 'z') {
      if (!S.data.zozo[k]) S.data.zozo[k] = {}
      S.data.zozo[k]._img = ev.target.result
    } else if (tp === 'f') {
      var p = S.data.days[k].foodPics || []
      p.push(ev.target.result)
      S.data.days[k].foodPics = p
    } else if (tp === 'm') {
      var p = S.data.days[k].mirrorPics || []
      p.push(ev.target.result)
      S.data.days[k].mirrorPics = p
    }
    sv(); render()
  }
  r.readAsDataURL(f)
}

// ─── Persistence ──────────────────────────────────────────────────────────────
window.sv = async function() {
  localStorage.setItem('p1-cache', JSON.stringify(S.data))
  var k = dk(S.cur)
  try {
    if (S.data.days[k] && Object.keys(S.data.days[k]).length)
      await sb.from('daily_logs').upsert({ date: k, data: S.data.days[k] }, { onConflict: 'date' })
    if (S.data.zozo[k] && Object.keys(S.data.zozo[k]).length)
      await sb.from('zozo_scans').upsert({ date: k, data: S.data.zozo[k] }, { onConflict: 'date' })
  } catch(e) { console.warn('sync:', e) }
}

// ─── Whoop OAuth & Sync (via Vercel serverless functions) ────────────────────
async function handleWhoopCallback() {
  var params = new URLSearchParams(window.location.search)
  var code = params.get('code')
  if (!code || !window.location.pathname.includes('whoop-callback')) return false
  console.log('[Whoop] OAuth callback — exchanging code:', code.substring(0, 10) + '...')
  try {
    var tokenResp = await fetch('/api/whoop-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code })
    })
    var tokenData = await tokenResp.json()
    console.log('[Whoop] Token exchange response:', tokenResp.status, tokenData)
    if (tokenResp.ok) {
      console.log('[Whoop] Token saved, now syncing data...')
      window.history.replaceState({}, '', '/')
      // Immediately sync data after successful OAuth
      await window.syncWhoop()
      return true
    }
  } catch(e) { console.warn('[Whoop] Callback error:', e) }
  window.history.replaceState({}, '', '/')
  return true
}

window.syncWhoop = async function() {
  S.whoopSyncing = true; render()
  try {
    // Check if we have tokens stored
    var { data: tok, error: tokErr } = await sb.from('whoop_tokens').select('user_id').eq('user_id', 'default').single()
    console.log('[Whoop] Token check — stored:', !!tok, 'error:', tokErr)
    if (!tok) {
      console.log('[Whoop] No token found, redirecting to OAuth...')
      window.location.href = WHOOP_AUTH_URL + '?client_id=' + WHOOP_CLIENT_ID + '&redirect_uri=' + encodeURIComponent(WHOOP_REDIRECT) + '&response_type=code&scope=' + encodeURIComponent(WHOOP_SCOPES) + '&state=' + dk(S.cur)
      return
    }
    // Fetch data via serverless function (handles token refresh server-side)
    console.log('[Whoop] Calling /api/whoop-sync for date:', dk(S.cur))
    var resp = await fetch('/api/whoop-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dk(S.cur) })
    })
    var respText = await resp.text()
    console.log('[Whoop] Sync response:', resp.status, respText)
    if (resp.status === 401) {
      console.log('[Whoop] 401 — token invalid, redirecting to re-auth...')
      window.location.href = WHOOP_AUTH_URL + '?client_id=' + WHOOP_CLIENT_ID + '&redirect_uri=' + encodeURIComponent(WHOOP_REDIRECT) + '&response_type=code&scope=' + encodeURIComponent(WHOOP_SCOPES)
      return
    }
    if (resp.ok) {
      var result = JSON.parse(respText)
      console.log('[Whoop] Parsed data to write:', result)
      var k = dk(S.cur)
      if (!S.data.days[k]) S.data.days[k] = {}
      if (result.whoopRecovery != null) S.data.days[k].whoopRecovery = result.whoopRecovery
      if (result.hrv != null) S.data.days[k].hrv = result.hrv
      if (result.rhr != null) S.data.days[k].rhr = result.rhr
      if (result.sleepScore != null) S.data.days[k].sleepScore = result.sleepScore
      if (result.sleepHours != null) {
        S.data.days[k].sleepHours = result.sleepHours
        if (result.sleepHours >= 7) S.data.days[k].sleepOk = true
      }
      if (result.whoopStrain != null) S.data.days[k].whoopStrain = result.whoopStrain
      if (result.steps != null) S.data.days[k].steps = result.steps
      console.log('[Whoop] Day data after write:', JSON.stringify(S.data.days[k]))
      sv()
    }
  } catch(e) { console.warn('[Whoop] Sync error:', e) }
  S.whoopSyncing = false; render()
}

async function ld() {
  var cached = localStorage.getItem('p1-cache')
  if (cached) { try { S.data = JSON.parse(cached) } catch(e) {} }
  render()
  try {
    var [lr, sr] = await Promise.all([
      sb.from('daily_logs').select('date, data'),
      sb.from('zozo_scans').select('date, data')
    ])
    if (lr.data) lr.data.forEach(function(r) { S.data.days[r.date] = r.data })
    if (sr.data) sr.data.forEach(function(r) { S.data.zozo[r.date] = r.data })
    localStorage.setItem('p1-cache', JSON.stringify(S.data))
    render()
  } catch(e) { console.warn('load:', e) }
}

// ─── Calculations ─────────────────────────────────────────────────────────────
// Weighted adherence with 5 priorities:
// MWF: Training 35% (MT 20% + Core 10% + Mobility 5%), Sleep 20%, Protein 20%, Deficit 15% (<=2200), Creatine 10%
// TTS: Training 35% (Strength 28% + Mobility 7%), Sleep 20%, Protein 20%, Deficit 15% (<=2100), Creatine 10%
// Sunday: Sleep 30%, Protein 30%, Deficit 25% (<=1800), Creatine 15%
function cpBreakdown(k) {
  var r = { training: 0, trainingMax: 0, sleep: 0, sleepMax: 0, protein: 0, proteinMax: 0, deficit: 0, deficitMax: 0, creatine: 0, creatineMax: 0, total: 0 }
  if (!S.data.days[k]) return r
  var d = S.data.days[k]
  var dt = new Date(k + 'T12:00:00')
  var w = dt.getDay()

  var sleepMet = d.sleepOk || (d.sleepHours && +d.sleepHours >= 7)
  var proteinMet = d.protein && +d.protein >= 130
  var creatineMet = d.creatine

  if (w === 0) {
    r.sleepMax = 30; r.proteinMax = 30; r.deficitMax = 25; r.creatineMax = 15
    if (sleepMet) r.sleep = 30
    if (proteinMet) r.protein = 30
    if (d.calories && +d.calories <= 1800 && +d.calories > 0) r.deficit = 25
    if (creatineMet) r.creatine = 15
  } else if (w === 1 || w === 3 || w === 5) {
    r.trainingMax = 35; r.sleepMax = 20; r.proteinMax = 20; r.deficitMax = 15; r.creatineMax = 10
    if (d.muayThai) r.training += 20
    var c = d.core || {}, cd2 = 0; for (var x in c) if (c[x]) cd2++
    r.training += (cd2 / COR.length) * 10
    var m = d.mobility || {}, md2 = 0; for (var x in m) if (m[x]) md2++
    r.training += (md2 / MOB.length) * 5
    if (sleepMet) r.sleep = 20
    if (proteinMet) r.protein = 20
    if (d.calories && +d.calories <= 2200 && +d.calories > 0) r.deficit = 15
    if (creatineMet) r.creatine = 10
  } else {
    r.trainingMax = 35; r.sleepMax = 20; r.proteinMax = 20; r.deficitMax = 15; r.creatineMax = 10
    var s = d.strength || {}, sd2 = 0; for (var x in s) if (s[x]) sd2++
    r.training += (sd2 / STR.length) * 28
    var m = d.mobility || {}, md2 = 0; for (var x in m) if (m[x]) md2++
    r.training += (md2 / MOB.length) * 7
    if (sleepMet) r.sleep = 20
    if (proteinMet) r.protein = 20
    if (d.calories && +d.calories <= 2100 && +d.calories > 0) r.deficit = 15
    if (creatineMet) r.creatine = 10
  }

  r.training = Math.round(r.training * 10) / 10
  r.total = Math.round(r.training + r.sleep + r.protein + r.deficit + r.creatine)
  return r
}
function cp(k) { return cpBreakdown(k).total }

function gs() {
  var s = 0, d = new Date(S.cur)
  d.setDate(d.getDate() - 1)
  for (var i = 0; i < 365; i++) {
    if (d.getDay() === 0) { s++; d.setDate(d.getDate() - 1); continue }
    if (cp(dk(d)) >= 80) { s++; d.setDate(d.getDate() - 1) } else break
  }
  return s
}
function ga() {
  var t = 0, c = 0, d = new Date('2026-04-06'), n = new Date()
  while (d <= n) {
    if (d.getDay() !== 0) { t++; if (cp(dk(d)) >= 80) c++ }
    d.setDate(d.getDate() + 1)
  }
  return t > 0 ? Math.round(c / t * 100) : 0
}
function gl(f) {
  var e = Object.entries(S.data.days).filter(function(x) { return x[1][f] }).sort(function(a,b) { return b[0].localeCompare(a[0]) })
  return e.length > 0 ? e[0][1][f] : '\u2014'
}
function gw() {
  return Object.entries(S.data.days).filter(function(e) { return e[1].weight }).sort(function(a,b) { return a[0].localeCompare(b[0]) }).slice(-14).map(function(e) { return { d: e[0], w: +e[1].weight } })
}

// ─── Render helpers ───────────────────────────────────────────────────────────
function inp(f, la, p, u, clr) {
  var v = gt()[f] || ''
  var cs = clr ? 'color:' + clr : ''
  return '<div><label class="lb">' + la + '</label><div class="iw"><input type="number" step="0.1" value="' + v + '" placeholder="" style="' + cs + '" onchange="uf(\'' + f + '\',this.value);render()">' + (u ? '<span class="iu">' + u + '</span>' : '') + '</div></div>'
}
// Color helpers for Whoop-style ranges
function whoopClr(v, gLo, yLo) { if (!v || v === '') return ''; v = +v; return v >= gLo ? '#4ADE80' : v >= yLo ? '#FBBF24' : '#EF4444' }
function rhrClr(v) { if (!v || v === '') return ''; v = +v; return v < 60 ? '#4ADE80' : v <= 75 ? '#FBBF24' : '#EF4444' }
function nutClr(v, gTh, yTh) { if (!v || v === '') return ''; v = +v; return v >= gTh ? '#4ADE80' : v >= yTh ? '#FBBF24' : '#EF4444' }
function calClr(v, target) { if (!v || v === '') return ''; v = +v; return v <= target ? '#4ADE80' : v <= target + 200 ? '#FBBF24' : '#EF4444' }
function chk(sec, id, nm, dt, extra) {
  var dn = (gt()[sec] || {})[id]
  return '<div class="chk' + (dn ? ' dn' : '') + '" onclick="tg(\'' + sec + '\',\'' + id + '\');render()"><div class="cb' + (dn ? ' dn' : '') + '">' + (dn ? '<span style="color:#fff;font-size:10px;font-weight:700">\u2713</span>' : '') + '</div><div style="flex:1"><span style="font-size:13px;color:' + (dn ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)') + ';text-decoration:' + (dn ? 'line-through' : 'none') + '">' + nm + '</span><span style="display:block;font-size:10px;color:rgba(255,255,255,0.2)">' + dt + '</span></div>' + (extra || '') + '</div>'
}
function parseSets(str) {
  return str.split('+').reduce(function(s, p) {
    var m = p.match(/^(\d+)x/)
    return s + (m ? parseInt(m[1]) : 1)
  }, 0)
}

// Collapsible section header helper
function colHdr(label, stateKey, badge) {
  var collapsed = S[stateKey]
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="S.' + stateKey + '=!S.' + stateKey + ';render()">'
  h += '<div class="sh" style="margin-bottom:0">' + label + '</div>'
  h += '<div style="display:flex;align-items:center;gap:8px">'
  if (badge) h += badge
  h += '<span style="font-size:11px;color:rgba(255,255,255,0.3)">' + (collapsed ? '\u25B8' : '\u25BE') + '</span>'
  h += '</div></div>'
  return h
}

// Walk checkbox section (collapsible card)
function walkChk(td) {
  var wd = td.walk && td.walk.done
  var badge = wd ? '<span style="font-size:9px;font-weight:600;color:#78C98E;font-family:\'Space Grotesk\',sans-serif">\u2713</span>' : ''
  var h = '<div class="card">' + colHdr('8K STEPS', 'colWalk', badge)
  if (!S.colWalk) {
    h += '<div style="margin-top:10px">'
    h += '<div class="chk" style="padding:11px 12px;background:' + (wd?'rgba(120,201,142,0.06)':'rgba(120,201,142,0.02)') + ';border:1px solid ' + (wd?'rgba(120,201,142,0.25)':'rgba(120,201,142,0.07)') + ';border-radius:6px" onclick="event.stopPropagation();tg(\'walk\',\'done\');render()">'
    h += '<div class="cb' + (wd?' dn':'') + '" style="width:17px;height:17px;border-radius:4px;border-color:' + (wd?'#78C98E':'rgba(120,201,142,0.2)') + ';background:' + (wd?'#78C98E':'transparent') + '">' + (wd?'<span style="color:#fff;font-size:11px;font-weight:700">\u2713</span>':'') + '</div>'
    h += '<div><span style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:600;color:' + (wd?'#78C98E':'rgba(120,201,142,0.5)') + ';letter-spacing:1px">\u{1F6B6} 8K STEPS</span><span style="display:block;font-size:9px;color:rgba(255,255,255,0.3);margin-top:1px">target: 8,000 steps</span></div>'
    h += '</div></div>'
  }
  h += '</div>'
  return h
}

// Pull-ups section (collapsible card)
function pullupsSec(td) {
  var badge = td.pullups ? '<span style="font-size:9px;font-weight:600;color:#BE9B50;font-family:\'Space Grotesk\',sans-serif">' + td.pullups + ' reps</span>' : ''
  var h = '<div class="card">' + colHdr('PULL-UPS (GREASING THE GROOVE)', 'colPU', badge)
  if (!S.colPU) {
    h += '<div style="margin-top:8px"><div class="iw"><input type="number" step="1" min="0" value="' + (td.pullups||'') + '" placeholder="0" onchange="uf(\'pullups\',this.value)"><span class="iu">total reps</span></div></div>'
  }
  h += '</div>'
  return h
}

// ─── Expert consultation ──────────────────────────────────────────────────────
var EXPERT_SYSTEM = "You are a combined sports physical therapist, sports scientist, and elite-level strength and conditioning coach. You are reviewing weekly training data for your client with the following profile:\nStarting point: 170lbs, 5'8-5'9, 27% body fat, largely sedentary, returning to training after time off. Current VO2 max: 46 (up from 37-38 last year via Whoop). Has chronic left ankle instability from repeated sprains with restricted dorsiflexion. Suspected hip rotational asymmetry. Lower body significantly weaker than upper body — RDLs shake at 20lbs while pressing 44lbs for reps. Has prior Muay Thai training from Thailand.\nGoals: Recomp to 15-17% body fat. Compete in amateur Muay Thai fight at 150lbs by late 2026. Reach 90th percentile in strength, mobility, and conditioning. Touch a basketball rim. Run a 25 minute 5K.\nCurrent program: Phase 1 sprint — 6 days per week. MWF: 35min daily mobility (20 exercises targeting ankles, hips, thoracic rotation), Muay Thai class 12-1pm, 8 core exercises post-class. TTS: same mobility, 6 KB strength exercises (swings 44lb, goblet squat 35lb, press 35/44lb, rows 44lb, staggered RDL 20lb, carries 44/35lb). Daily: 8K step target, pull-ups greasing the groove.\nCalorie targets: MWF 2200cal, TTS 2100cal, Sunday 1800cal. Protein 140g+ daily. Eating at roughly 500 calorie deficit for recomp.\nWhen analyzing the data, provide: 1) Adherence assessment — are they hitting the targets that matter most. 2) Weight and body composition trajectory — is the recomp working based on weight trend. 3) Recovery analysis — what do the Whoop scores (recovery, HRV, RHR, strain) tell you about adaptation vs overreaching. 4) Strength progression recommendations — specific weight and rep targets for the coming week for each exercise. 5) Mobility progress assessment if any hold times or notes indicate change. 6) One specific thing to improve this week. 7) One thing they're doing well. Be direct, specific, and concise. No generic advice — use the actual numbers in front of you."

function formatExpertData() {
  var lines = []
  var today = new Date()
  var moodLabels = ['Irritable','Neutral','OK','Happy','On fire']
  var energyLabels = ['Drained','Low','OK','High','Explosive']

  lines.push('=== TRAINING LOG — LAST 14 DAYS ===\n')
  for (var i = 13; i >= 0; i--) {
    var d = new Date(today); d.setDate(d.getDate() - i)
    var k = dk(d)
    var day = S.data.days[k]
    if (!day || Object.keys(day).length === 0) continue
    var dw = d.getDay()
    var dtype = dw===0 ? 'Sunday/Rest' : (dw===1||dw===3||dw===5) ? 'MWF' : 'TTS'
    lines.push('--- ' + k + ' (' + DY[dw] + ', ' + dtype + ') ---')
    if (day.weight)  lines.push('Weight: ' + day.weight + ' lbs')
    if (day.calories || day.protein || day.steps) {
      var nut = []
      if (day.calories) nut.push('Calories: ' + day.calories)
      if (day.protein)  nut.push('Protein: ' + day.protein + 'g')
      if (day.steps)    nut.push('Steps: ' + day.steps)
      lines.push(nut.join(' | '))
    }
    var whoop = []
    if (day.whoopRecovery) whoop.push('Recovery ' + day.whoopRecovery + '%')
    if (day.hrv)           whoop.push('HRV ' + day.hrv + 'ms')
    if (day.rhr)           whoop.push('RHR ' + day.rhr + 'bpm')
    if (day.whoopStrain)   whoop.push('Strain ' + day.whoopStrain + '/21')
    if (day.sleepScore)    whoop.push('Sleep ' + day.sleepScore + '/100')
    if (whoop.length) lines.push('WHOOP: ' + whoop.join(', '))
    if (day.mobility) {
      var mc = Object.values(day.mobility).filter(Boolean).length
      lines.push('Mobility: ' + mc + '/' + MOB.length + ' completed')
    }
    if (dw===1||dw===3||dw===5) {
      lines.push('Muay Thai: ' + (day.muayThai ? 'YES' : 'NO'))
      if (day.core) {
        var cc = Object.values(day.core).filter(Boolean).length
        lines.push('Core: ' + cc + '/' + COR.length + ' completed')
      }
    }
    if (dw===2||dw===4||dw===6) {
      if (day.strength) {
        var sc2 = Object.values(day.strength).filter(Boolean).length
        lines.push('Strength: ' + sc2 + '/' + STR.length + ' completed')
      }
      if (day.strengthSets) {
        STR.forEach(function(e) {
          var sets = day.strengthSets[e[0]]
          if (sets && sets.length) {
            var setStr = sets.filter(function(s){return s.w||s.r}).map(function(s,i){
              return 'Set'+(i+1)+': '+(s.w||'?')+'lb x '+(s.r||'?')+'reps'
            }).join(', ')
            if (setStr) lines.push('  ' + e[1] + ': ' + setStr)
          }
        })
      }
    }
    if (day.walk && day.walk.done) lines.push('8K Steps: YES')
    if (day.creatine) lines.push('Creatine: YES')
    if (day.sleepOk) lines.push('7+ Hours Sleep: YES')
    if (day.sleepHours) lines.push('Sleep Duration: ' + day.sleepHours + 'h')
    if (day.pullups) lines.push('Pull-ups total reps: ' + day.pullups)
    if (day.mood !== null && day.mood !== undefined) lines.push('Mood: ' + moodLabels[day.mood])
    if (day.energy !== null && day.energy !== undefined) lines.push('Energy: ' + energyLabels[day.energy])
    if (day.notes) lines.push('Notes: "' + day.notes + '"')
    if (day.restDay) lines.push('Rest day logged.')
    lines.push('')
  }

  var zKeys = Object.keys(S.data.zozo).sort()
  if (zKeys.length) {
    lines.push('=== BODY MEASUREMENTS (ZOZO SCANS) ===')
    zKeys.forEach(function(kz) {
      var scan = S.data.zozo[kz]
      var meas = ZZ.map(function(m) {
        var v = scan[m.toLowerCase().replace(/ /g,'_')]
        return v ? m+': '+v+'"' : null
      }).filter(Boolean)
      if (meas.length) lines.push(kz + ': ' + meas.join(', '))
    })
  }

  return lines.join('\n')
}

window.consultExpert = async function() {
  S.expertLoading = true
  S.showExpert = true
  S.expertResponse = ''
  render()
  try {
    var resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: EXPERT_SYSTEM,
        messages: [{ role: 'user', content: 'Here is my training data for the last 14 days. Please analyze it and provide your expert assessment:\n\n' + formatExpertData() }]
      })
    })
    if (!resp.ok) {
      var errText = await resp.text()
      S.expertResponse = 'API error ' + resp.status + ':\n' + errText
    } else {
      var data = await resp.json()
      S.expertResponse = data.content[0].text
    }
  } catch(e) {
    S.expertResponse = 'Error: ' + e.message
  }
  S.expertLoading = false
  render()
}

// ─── Main render ──────────────────────────────────────────────────────────────
window.render = function render() {
  var ky = dk(S.cur), dw = S.cur.getDay()
  var mw = dw === 1 || dw === 3 || dw === 5
  var tt = dw === 2 || dw === 4 || dw === 6
  var sn = dw === 0
  var wk = wn(S.cur)
  var dl = Math.max(0, Math.ceil((new Date('2026-07-14') - S.cur) / 864e5))
  var td = gt()
  var tp = cp(ky)

  var mc = 0; var md = td.mobility || {}; for (var x in md) if (md[x]) mc++
  var cc = 0; var cd = td.core || {}; for (var x in cd) if (cd[x]) cc++
  var sc = 0; var sd = td.strength || {}; for (var x in sd) if (sd[x]) sc++

  // ── Header (sticky) ─────────────────────────────────────────────────────────
  var h = '<div style="padding:12px 16px 0;position:sticky;top:0;background:#1a1a24;z-index:10;border-bottom:1px solid rgba(255,255,255,0.04)">'

  // Logo + completion badge
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
  h += '<div style="display:flex;align-items:center;gap:6px">' + BAT + BAT_G + BAT + '</div>'
  var _tpGreen = tp >= 80
  var _goldStar = td.steps && +td.steps >= 8000
  h += '<div style="background:' + (_tpGreen?'rgba(120,201,142,0.12)':'rgba(255,255,255,0.04)') + ';border:1px solid ' + (_tpGreen?'rgba(120,201,142,0.25)':'rgba(255,255,255,0.06)') + ';border-radius:14px;padding:3px 10px"><span style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:600;color:' + (_tpGreen?'#78C98E':'rgba(255,255,255,0.45)') + '">' + tp + '%</span>' + (_goldStar ? '<span style="margin-left:4px;font-size:12px">\u2B50</span>' : '') + '</div>'
  h += '</div>'

  // Quote — alternates by day of month (even = Ali, odd = Aristotle)
  var aq = S.cur.getDate() % 2 === 0 ? AQ_ALI : AQ_ARI
  h += '<div style="padding:8px 12px;background:rgba(96,165,250,0.12);border:1px solid rgba(96,165,250,0.2);border-radius:6px;margin-bottom:10px">'
  h += '<p style="font-size:12px;color:rgba(255,255,255,0.6);font-style:italic;line-height:1.5;text-align:center">' + aq.t + '</p>'
  h += '<p style="font-family:\'Space Grotesk\',sans-serif;font-size:8px;color:rgba(255,255,255,0.4);margin-top:3px;letter-spacing:1px;text-align:center">' + aq.a + '</p>'
  h += '</div>'

  // Date navigation — clicking the date text opens calendar popup
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
  h += '<button onclick="S.cur.setDate(S.cur.getDate()-1);render()" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:20px;cursor:pointer;padding:2px 12px">\u2039</button>'
  h += '<div onclick="S.showCal=!S.showCal;if(S.showCal){S.calYear=S.cur.getFullYear();S.calMonth=S.cur.getMonth();}render()" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.02)">'
  h += '<span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.9)">' + DY[dw] + '</span><span style="font-size:10px;color:rgba(255,255,255,0.3)">' + ky + '</span>'
  if (wk >= 1 && wk <= 14) h += '<span style="font-size:8px;font-weight:600;color:#BE9B50;background:rgba(190,155,80,0.1);padding:2px 5px;border-radius:3px;font-family:\'Space Grotesk\',sans-serif">W' + wk + '</span>'
  h += '</div>'
  h += '<button onclick="S.cur.setDate(S.cur.getDate()+1);render()" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:20px;cursor:pointer;padding:2px 12px">\u203A</button>'
  h += '</div>'

  // Day type banner
  var bannerText, bannerColor
  if (sn)      { bannerText = 'Rest Day';                          bannerColor = 'rgba(255,255,255,0.5)' }
  else if (mw) { bannerText = 'Mobility \u2192 Muay Thai \u2192 Core'; bannerColor = '#4D8EFF' }
  else         { bannerText = 'Mobility \u2192 Strength';          bannerColor = '#4D8EFF' }
  h += '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:5px;padding:5px 10px;text-align:center;margin-bottom:8px">'
  h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:17.5px;font-weight:500;letter-spacing:1.2px;color:' + bannerColor + '">' + bannerText + '</span>'
  h += '</div>'

  // Tab bar
  h += '<div style="display:flex;gap:2px;padding-bottom:10px">'
  ;['today','zozo','progress'].forEach(function(t) {
    var l = t === 'today' ? 'Today' : t === 'zozo' ? 'ZOZO' : 'Progress'
    h += '<button class="tb' + (S.tab === t ? ' on' : '') + '" onclick="S.tab=\'' + t + '\';render()">' + l + '</button>'
  })
  h += '</div></div>'

  // ── Calendar popup (fixed overlay) ──────────────────────────────────────────
  if (S.showCal) {
    var cY = S.calYear, cM = S.calMonth
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
    var WDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
    var firstDay = new Date(cY, cM, 1).getDay()
    var daysInMonth = new Date(cY, cM + 1, 0).getDate()
    var todayKey = dk(new Date())
    var curKey = dk(S.cur)

    h += '<div style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center" onclick="S.showCal=false;render()">'
    h += '<div style="background:#252535;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:18px;width:88%;max-width:320px;box-shadow:0 8px 30px rgba(0,0,0,0.4)" onclick="event.stopPropagation()">'
    // Cal header
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    h += '<button onclick="if(S.calMonth===0){S.calMonth=11;S.calYear--}else{S.calMonth--};render()" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:6px;color:rgba(255,255,255,0.5);font-size:16px;cursor:pointer;padding:4px 10px">\u2039</button>'
    h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:14px;font-weight:600;color:rgba(255,255,255,0.85)">' + MONTHS[cM] + ' ' + cY + '</span>'
    h += '<button onclick="if(S.calMonth===11){S.calMonth=0;S.calYear++}else{S.calMonth++};render()" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:6px;color:rgba(255,255,255,0.5);font-size:16px;cursor:pointer;padding:4px 10px">\u203A</button>'
    h += '</div>'
    // Day headers
    h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:6px">'
    WDAYS.forEach(function(d) { h += '<div style="text-align:center;font-size:9px;color:rgba(255,255,255,0.35);padding:3px 0;font-family:\'Space Grotesk\',sans-serif;letter-spacing:0.5px">' + d + '</div>' })
    h += '</div>'
    // Day cells
    h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px">'
    for (var i = 0; i < firstDay; i++) h += '<div></div>'
    for (var d = 1; d <= daysInMonth; d++) {
      var dDate = new Date(cY, cM, d)
      var dKey = dk(dDate)
      var isCur = dKey === curKey
      var isToday = dKey === todayKey
      var hasDot = S.data.days[dKey] && Object.keys(S.data.days[dKey]).length > 0
      h += '<div onclick="S.cur=new Date(' + cY + ',' + cM + ',' + d + ');S.showCal=false;render()" style="text-align:center;padding:7px 2px;border-radius:7px;cursor:pointer;background:' + (isCur?'rgba(190,155,80,0.18)':'transparent') + ';border:1px solid ' + (isCur?'rgba(190,155,80,0.4)':isToday?'rgba(255,255,255,0.12)':'transparent') + '">'
      h += '<span style="font-size:13px;font-weight:' + (isCur?'700':'400') + ';color:' + (isCur?'#BE9B50':isToday?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.4)') + '">' + d + '</span>'
      if (hasDot) h += '<div style="width:3px;height:3px;background:rgba(190,155,80,0.6);border-radius:50%;margin:2px auto 0"></div>'
      h += '</div>'
    }
    h += '</div></div></div>'
  }

  // ── Expert modal (fixed overlay) ────────────────────────────────────────────
  if (S.showExpert) {
    h += '<div style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:300;background:rgba(0,0,0,0.7);display:flex;flex-direction:column;padding:16px" onclick="S.showExpert=false;render()">'
    h += '<div style="flex:1;overflow-y:auto;background:#252535;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;display:flex;flex-direction:column;box-shadow:0 8px 30px rgba(0,0,0,0.4)" onclick="event.stopPropagation()">'
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-shrink:0">'
    h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:700;color:#BE9B50;letter-spacing:2px">EXPERT ASSESSMENT</span>'
    h += '<button onclick="S.showExpert=false;render()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:rgba(255,255,255,0.5);font-size:11px;font-family:\'Space Grotesk\',sans-serif;font-weight:600;padding:5px 12px;cursor:pointer;letter-spacing:0.5px">\u2715 CLOSE</button>'
    h += '</div>'
    if (S.expertLoading) {
      h += '<div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px">'
      h += '<div style="width:32px;height:32px;border:2px solid rgba(190,155,80,0.2);border-top-color:#BE9B50;border-radius:50%;animation:spin 0.8s linear infinite"></div>'
      h += '<p style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:1px">CONSULTING EXPERT...</p>'
      h += '</div>'
    } else {
      h += '<div style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.75;white-space:pre-wrap;overflow-y:auto">' + (S.expertResponse || '') + '</div>'
    }
    h += '</div></div>'
  }

  h += '<div style="padding:8px 16px 120px">'

  // ══════════════════════════════════════════════════════════════════════════
  // TODAY TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (S.tab === 'today') {

    // DAILY LOG
    h += '<div class="card"><div class="sh">DAILY LOG</div>'
    var _calTarget = mw ? 2200 : tt ? 2100 : 1800
    h += '<div class="g2">' + inp('weight','WEIGHT','170','lbs') + inp('calories','CAL',_calTarget,'cal',calClr(td.calories,_calTarget)) + '</div>'
    h += '<div class="g3" style="margin-top:6px">' + inp('protein','PROTEIN','140','g',nutClr(td.protein,130,80)) + inp('steps','STEPS','8000','',nutClr(td.steps,8000,5000)) + inp('whoopStrain','STRAIN','0-21','/21') + '</div>'
    h += '<div class="g2" style="margin-top:6px">' + inp('whoopRecovery','RECOVERY','0-100','/100',whoopClr(td.whoopRecovery,67,34)) + inp('sleepScore','SLEEP','0-100','/100',whoopClr(td.sleepScore,67,34)) + '</div>'
    h += '<div class="g2" style="margin-top:6px">' + inp('rhr','RHR','60','bpm',rhrClr(td.rhr)) + inp('hrv','HRV','50','ms',whoopClr(td.hrv,67,34)) + '</div>'
    // Creatine + 7+ Hours Sleep checkboxes (blue text, subtle)
    var _cr = td.creatine
    var _sl = td.sleepOk
    h += '<div style="display:flex;gap:8px;margin-top:8px">'
    h += '<div class="chk" style="flex:1;padding:9px 10px;border:1px solid rgba(255,255,255,0.06);border-radius:6px" onclick="uf(\'creatine\',' + (!_cr) + ');render()">'
    h += '<div style="width:15px;height:15px;border-radius:3px;border:1.5px solid ' + (_cr?'#60A5FA':'rgba(255,255,255,0.12)') + ';background:' + (_cr?'#60A5FA':'transparent') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' + (_cr?'<span style="color:#1a1a24;font-size:9px;font-weight:700">\u2713</span>':'') + '</div>'
    h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:10px;font-weight:600;color:#60A5FA;letter-spacing:0.8px">CREATINE</span></div>'
    h += '<div class="chk" style="flex:1;padding:9px 10px;border:1px solid rgba(255,255,255,0.06);border-radius:6px" onclick="uf(\'sleepOk\',' + (!_sl) + ');render()">'
    h += '<div style="width:15px;height:15px;border-radius:3px;border:1.5px solid ' + (_sl?'#60A5FA':'rgba(255,255,255,0.12)') + ';background:' + (_sl?'#60A5FA':'transparent') + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' + (_sl?'<span style="color:#1a1a24;font-size:9px;font-weight:700">\u2713</span>':'') + '</div>'
    h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:10px;font-weight:600;color:#60A5FA;letter-spacing:0.8px">7+ HRS SLEEP</span>'
    if (td.sleepHours) h += '<span style="font-size:8px;color:rgba(255,255,255,0.3);margin-left:4px">' + td.sleepHours + 'h</span>'
    h += '</div></div>'
    // Mood + Energy rows with Sync Whoop button centered in remaining space
    h += '<div style="display:flex;margin-top:10px;align-items:stretch">'
    h += '<div style="flex:0 0 auto">'
    // Mood row
    h += '<div><label class="lb">MOOD</label><div style="display:flex;gap:10px;padding:4px 0">'
    MOOD_E.forEach(function(e, i) {
      var sel = td.mood === i
      var unset = td.mood === undefined || td.mood === null
      h += '<span onclick="uf(\'mood\',' + (sel ? 'null' : i) + ');render()" style="font-size:24px;cursor:pointer;opacity:' + (unset ? '0.35' : sel ? '1' : '0.2') + ';transition:opacity 0.15s;filter:' + (sel ? 'none' : 'grayscale(0.3)') + '">' + e + '</span>'
    })
    h += '</div></div>'
    // Energy row
    h += '<div style="margin-top:6px"><label class="lb">ENERGY</label><div style="display:flex;gap:10px;padding:4px 0">'
    ENRG_E.forEach(function(e, i) {
      var sel = td.energy === i
      var unset = td.energy === undefined || td.energy === null
      h += '<span onclick="uf(\'energy\',' + (sel ? 'null' : i) + ');render()" style="font-size:24px;cursor:pointer;opacity:' + (unset ? '0.35' : sel ? '1' : '0.2') + ';transition:opacity 0.15s;filter:' + (sel ? 'none' : 'grayscale(0.3)') + '">' + e + '</span>'
    })
    h += '</div></div>'
    h += '</div>'
    // Sync Whoop button — square, centered horizontally and vertically
    h += '<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:6px">'
    h += '<button onclick="syncWhoop()" style="width:72px;height:72px;background:rgba(74,222,128,0.1);border:1px solid #4ADE80;border-radius:8px;color:#4ADE80;font-family:\'Space Grotesk\',sans-serif;font-size:9px;font-weight:700;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.4">' + (S.whoopSyncing ? '<span style="display:inline-block;width:16px;height:16px;border:1.5px solid rgba(74,222,128,0.2);border-top-color:#4ADE80;border-radius:50%;animation:spin 0.8s linear infinite"></span>' : 'SYNC<br>WHOOP') + '</button>'
    h += '</div>'
    h += '</div>'
    h += '</div>'

    // MOBILITY — collapsible (default collapsed)
    if (!sn) {
      var mobBadge = '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:9px;font-weight:600;color:' + (mc===MOB.length?'#BE9B50':'rgba(255,255,255,0.3)') + '">' + mc + '/' + MOB.length + '</span>'
      h += '<div class="card">' + colHdr('MOBILITY', 'colMob', mobBadge)
      if (!S.colMob) {
        h += '<div style="margin-top:10px">'
        var lc = ''
        MOB.forEach(function(e) {
          if (e[3] !== lc) {
            lc = e[3]
            h += '<div style="display:flex;align-items:center;gap:5px;padding:6px 0 2px"><span style="font-size:12px">' + CI[lc] + '</span><span class="cn">' + CNA[lc] + '</span></div>'
          }
          h += chk('mobility', e[0], e[1], e[2])
        })
        h += '</div>'
      }
      h += '</div>'
    }

    // MUAY THAI (MWF) — collapsible card
    if (mw) {
      var mt = td.muayThai
      var mtBadge = mt ? '<span style="font-size:9px;font-weight:600;color:#BE9B50;font-family:\'Space Grotesk\',sans-serif">\u2713</span>' : ''
      h += '<div class="card">' + colHdr('\u{1F94A} MUAY THAI', 'colMT', mtBadge)
      if (!S.colMT) {
        h += '<div style="margin-top:10px">'
        h += '<div class="chk" style="padding:11px 12px;background:' + (mt?'rgba(190,155,80,0.06)':'rgba(190,155,80,0.02)') + ';border:1px solid ' + (mt?'rgba(190,155,80,0.2)':'rgba(190,155,80,0.06)') + ';border-radius:6px" onclick="event.stopPropagation();uf(\'muayThai\',' + (!mt) + ');render()">'
        h += '<div class="cb' + (mt?' dn':'') + '" style="width:17px;height:17px;border-radius:4px">' + (mt?'<span style="color:#fff;font-size:11px;font-weight:700">\u2713</span>':'') + '</div>'
        h += '<div><span style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:600;color:' + (mt?'#BE9B50':'rgba(190,155,80,0.5)') + ';letter-spacing:1px">\u{1F94A} MUAY THAI</span><span style="display:block;font-size:9px;color:rgba(255,255,255,0.3);margin-top:1px">12\u20131 PM</span></div>'
        h += '</div></div>'
      }
      h += '</div>'

      // CORE (MWF) — collapsible card
      var coreBadge = '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:9px;font-weight:600;color:' + (cc===COR.length?'#BE9B50':'rgba(255,255,255,0.3)') + '">' + cc + '/' + COR.length + '</span>'
      h += '<div class="card">' + colHdr('CORE', 'colCor', coreBadge)
      if (!S.colCor) {
        h += '<div style="margin-top:6px">'
        COR.forEach(function(e) { h += chk('core', e[0], e[1], e[2]) })
        h += '</div>'
      }
      h += '</div>'

      // Walk + pull-ups after core
      h += walkChk(td)
      h += pullupsSec(td)
    }

    // STRENGTH (TTS) — collapsible
    if (tt) {
      var strBadge = '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:9px;font-weight:600;color:' + (sc===STR.length?'#BE9B50':'rgba(255,255,255,0.3)') + '">' + sc + '/' + STR.length + '</span>'
      h += '<div class="card">' + colHdr('STRENGTH', 'colStr', strBadge)
      if (!S.colStr) {
        h += '<div style="margin-top:6px">'
        STR.forEach(function(e) {
          var numSets = parseSets(e[2])
          var sets = JSON.parse(JSON.stringify((td.strengthSets || {})[e[0]] || []))
          while (sets.length < numSets) sets.push({ w: '', r: '' })
          h += chk('strength', e[0], e[1], e[2] + ' \u00B7 ' + e[3],
            '<button onclick="event.stopPropagation();S.oLog=S.oLog===\'' + e[0] + '\'?null:\'' + e[0] + '\';render()" style="background:rgba(190,155,80,0.06);border:1px solid rgba(190,155,80,0.12);border-radius:3px;color:rgba(190,155,80,0.5);font-size:7px;padding:3px 6px;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-weight:600">LOG</button>')
          if (S.oLog === e[0]) {
            h += '<div style="padding:8px 10px;background:rgba(255,255,255,0.01);border-top:1px solid rgba(255,255,255,0.03);margin-bottom:3px">'
            for (var si = 0; si < numSets; si++) {
              h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">'
              h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:8px;color:rgba(255,255,255,0.35);width:32px;flex-shrink:0">SET ' + (si+1) + '</span>'
              h += '<div style="flex:1"><input type="text" value="' + (sets[si].w||'') + '" placeholder="' + e[3] + '" onchange="setSW(\'' + e[0] + '\',' + si + ',\'w\',this.value)"></div>'
              h += '<div style="flex:1"><input type="text" value="' + (sets[si].r||'') + '" placeholder="reps" onchange="setSW(\'' + e[0] + '\',' + si + ',\'r\',this.value)"></div>'
              h += '</div>'
            }
            h += '<p style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:3px;font-style:italic">' + e[4] + '</p>'
            h += '</div>'
          }
        })
        h += '</div>'
      }
      h += '</div>'
      // Walk + pull-ups after strength
      h += walkChk(td)
      h += pullupsSec(td)
    }

    // REST DAY (Sunday)
    if (sn) {
      h += '<div class="card" style="text-align:center;padding:40px 20px;background:linear-gradient(135deg,rgba(123,63,160,0.1),rgba(0,200,100,0.06));border:1px solid rgba(123,63,160,0.15)">'
      h += BATL
      h += '<p style="font-size:22px;font-weight:700;color:#A97BDB;margin-top:12px">Rest Day</p>'
      h += '<p style="font-size:13px;color:rgba(0,220,120,0.6);margin-bottom:6px;font-weight:500">The city sleeps. You recover.</p>'
      h += '<p style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:22px">1,800 cal</p>'
      h += '<button onclick="uf(\'restDay\',true);render()" style="padding:10px 28px;background:' + (td.restDay?'linear-gradient(135deg,#7B3FA0,#00C864)':'rgba(123,63,160,0.1)') + ';color:' + (td.restDay?'#fff':'#A97BDB') + ';border:1px solid rgba(123,63,160,0.25);border-radius:6px;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px">' + (td.restDay?'\u2713 LOGGED':'LOG REST') + '</button>'
      h += '</div>'
    }

    // FOOD — collapsible (default collapsed)
    h += '<div class="card">' + colHdr('FOOD', 'colFood', '')
    if (!S.colFood) {
      h += '<div style="margin-top:8px">'
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">'
      ;(td.foodPics || []).forEach(function(img) { h += '<img src="' + img + '" style="width:65px;height:65px;object-fit:cover;border-radius:6px">' })
      h += '<div onclick="document.getElementById(\'fup\').click()" style="width:65px;height:65px;border-radius:6px;border:1px dashed rgba(190,155,80,0.2);display:flex;align-items:center;justify-content:center;cursor:pointer"><span style="font-size:20px;color:rgba(190,155,80,0.4)">+</span></div>'
      h += '<input id="fup" type="file" accept="image/*" style="display:none" onchange="hImg(this,\'f\')"></div>'
      h += '<textarea placeholder="Meal notes..." onchange="uf(\'foodNotes\',this.value)">' + (td.foodNotes||'') + '</textarea>'
      h += '</div>'
    }
    h += '</div>'

    // MIRROR PIC — collapsible (default collapsed)
    h += '<div class="card">' + colHdr('MIRROR PIC', 'colMirror', '')
    if (!S.colMirror) {
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">'
      ;(td.mirrorPics || []).forEach(function(img) {
        h += '<div style="position:relative;width:100%"><img src="' + img + '" style="width:100%;max-height:320px;object-fit:contain;border-radius:6px;display:block"></div>'
      })
      h += '<div onclick="document.getElementById(\'mup\').click()" style="width:65px;height:65px;border-radius:6px;border:1px dashed rgba(123,63,160,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer"><span style="font-size:20px;color:rgba(123,63,160,0.5)">+</span></div>'
      h += '<input id="mup" type="file" accept="image/*" style="display:none" onchange="hImg(this,\'m\')">'
      h += '</div>'
    }
    h += '</div>'

    // REFLECTION — collapsible (default expanded)
    var refAllBtn = '<button onclick="event.stopPropagation();S.showR=!S.showR;render()" style="background:rgba(190,155,80,0.06);border:1px solid rgba(190,155,80,0.1);border-radius:3px;color:rgba(190,155,80,0.5);font-size:7px;padding:3px 7px;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-weight:600">' + (S.showR?'HIDE':'ALL') + '</button>'
    h += '<div class="card">' + colHdr('REFLECTION', 'colRef', refAllBtn)
    if (!S.colRef) {
      h += '<div style="margin-top:8px">'
      h += '<label class="lb">GRATITUDE</label><input type="text" value="' + (td.gratitude||'') + '" placeholder="One thing..." onchange="uf(\'gratitude\',this.value)" style="margin-bottom:8px">'
      h += '<label class="lb">TIME</label><textarea placeholder="Outside training?" onchange="uf(\'timeSpent\',this.value)">' + (td.timeSpent||'') + '</textarea>'
      h += '</div>'
    }
    h += '</div>'
    if (S.showR) {
      h += '<div class="card"><div class="sh">ALL REFLECTIONS</div>'
      Object.entries(S.data.days).filter(function(e) { return e[1].gratitude || e[1].timeSpent }).sort(function(a,b) { return b[0].localeCompare(a[0]) }).forEach(function(e) {
        var dt = new Date(e[0]+'T12:00:00')
        h += '<div style="padding:8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:6px;margin-bottom:5px"><span style="font-family:\'Space Grotesk\',sans-serif;font-size:10px;color:#BE9B50">' + DY[dt.getDay()] + '</span><span style="font-size:9px;color:rgba(255,255,255,0.3);margin-left:5px">' + e[0] + '</span>'
        if (e[1].gratitude) h += '<p style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px">' + e[1].gratitude + '</p>'
        if (e[1].timeSpent) h += '<p style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px">' + e[1].timeSpent + '</p>'
        h += '</div>'
      })
      h += '</div>'
    }

    // NOTES — collapsible (default expanded)
    var notesJrnBtn = '<button onclick="event.stopPropagation();S.showJ=!S.showJ;render()" style="background:rgba(190,155,80,0.06);border:1px solid rgba(190,155,80,0.1);border-radius:3px;color:rgba(190,155,80,0.5);font-size:7px;padding:3px 7px;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-weight:600">' + (S.showJ?'HIDE':'JOURNAL') + '</button>'
    h += '<div class="card">' + colHdr('NOTES', 'colNotes', notesJrnBtn)
    if (!S.colNotes) {
      h += '<div style="margin-top:8px"><textarea placeholder="How did today feel?" rows="3" style="min-height:50px" onchange="uf(\'notes\',this.value)">' + (td.notes||'') + '</textarea></div>'
    }
    h += '</div>'
    if (S.showJ) {
      h += '<div class="card"><div class="sh">JOURNAL</div>'
      Object.entries(S.data.days).filter(function(e) { return e[1].notes && e[1].notes.trim() }).sort(function(a,b) { return b[0].localeCompare(a[0]) }).forEach(function(e) {
        var dt = new Date(e[0]+'T12:00:00'), p = cp(e[0])
        h += '<div style="padding:8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:6px;margin-bottom:5px"><div style="display:flex;justify-content:space-between"><span style="font-family:\'Space Grotesk\',sans-serif;font-size:10px;color:#BE9B50">' + DY[dt.getDay()] + ' <span style="color:rgba(255,255,255,0.25)">' + e[0] + '</span></span><span style="font-family:\'Space Grotesk\',sans-serif;font-size:8px;color:' + (p>=80?'#78C98E':'rgba(255,255,255,0.25)') + '">' + p + '%</span></div><p style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5;white-space:pre-wrap;margin-top:4px">' + e[1].notes + '</p></div>'
      })
      h += '</div>'
    }

    // Footer
    h += '<div style="text-align:center;padding:24px 16px 8px"><div style="display:inline-flex;align-items:center;gap:6px">' + BATL_G + BATL + BATL_G + '</div><p style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;color:rgba(190,155,80,0.6);margin-top:8px">DO YOU WANT TO FIGHT?</p><p style="font-size:10px;color:rgba(255,255,255,0.25);margin-top:4px">Amateur Muay Thai \u00B7 Late 2026</p></div>'
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ZOZO TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (S.tab === 'zozo') {
    h += '<div style="display:flex;gap:2px;margin-bottom:10px">'
    h += '<button class="tb' + (S.zSub==='input'?' on':'') + '" onclick="S.zSub=\'input\';render()">Scan</button>'
    h += '<button class="tb' + (S.zSub==='history'?' on':'') + '" onclick="S.zSub=\'history\';render()">History</button>'
    h += '</div>'

    if (S.zSub === 'input') {
      h += '<div class="card"><div class="sh">SCAN \u2014 ' + ky + '</div>'
      var zd = S.data.zozo[ky]
      h += '<div onclick="document.getElementById(\'zup\').click()" style="border:1px dashed rgba(190,155,80,0.12);border-radius:6px;padding:' + (zd&&zd._img?'5px':'24px') + ';text-align:center;cursor:pointer;margin-bottom:12px">'
      if (zd && zd._img) h += '<img src="' + zd._img + '" style="width:100%;max-height:240px;object-fit:contain;border-radius:5px">'
      else h += '<p style="font-size:22px">\u{1F4F8}</p><p style="font-size:10px;color:rgba(190,155,80,0.35)">Upload scan</p>'
      h += '<input id="zup" type="file" accept="image/*" style="display:none" onchange="hImg(this,\'z\')"></div>'
      ZZ.forEach(function(m) {
        var k_ = m.toLowerCase().replace(/ /g,'_')
        var vl = (S.data.zozo[ky]||{})[k_]||''
        h += '<div style="display:flex;align-items:center;gap:5px;margin-bottom:4px"><span style="font-size:11px;color:rgba(255,255,255,0.5);width:80px;flex-shrink:0">' + m + '</span><input type="number" step="0.1" value="' + vl + '" placeholder="\u2014" style="flex:1;padding:4px 6px;font-size:12px" onchange="if(!S.data.zozo[\'' + ky + '\'])S.data.zozo[\'' + ky + '\']={}; S.data.zozo[\'' + ky + '\'][\'' + k_ + '\']=this.value;sv()"></div>'
      })
      h += '</div>'
    }

    if (S.zSub === 'history') {
      Object.keys(S.data.zozo).sort().reverse().forEach(function(ds) {
        var sc = S.data.zozo[ds]
        if (!ZZ.some(function(m) { return sc[m.toLowerCase().replace(/ /g,'_')] }) && !sc._img) return
        h += '<div class="card" style="margin-bottom:6px"><div class="sh">' + ds + '</div>'
        if (sc._img) h += '<img src="' + sc._img + '" style="width:100%;max-height:150px;object-fit:contain;border-radius:5px;margin-bottom:6px">'
        h += '<div style="display:flex;flex-wrap:wrap;gap:3px">'
        ZZ.forEach(function(m) {
          var v = sc[m.toLowerCase().replace(/ /g,'_')]
          if (v) h += '<span style="font-size:8px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.04);padding:2px 4px;border-radius:2px">' + m + ':' + v + '"</span>'
        })
        h += '</div></div>'
      })
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRESS TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (S.tab === 'progress') {
    var stk = gs(), ad = ga(), wt = gw()

    // Consult Expert button
    h += '<button onclick="consultExpert()" style="width:100%;padding:13px;background:linear-gradient(135deg,rgba(190,155,80,0.1),rgba(190,155,80,0.06));border:1px solid rgba(190,155,80,0.25);border-radius:8px;color:#BE9B50;font-family:\'Space Grotesk\',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;cursor:pointer;margin-bottom:12px">\u{1F9E0} CONSULT EXPERT</button>'

    h += '<div style="display:flex;gap:8px;margin-bottom:10px">'
    h += '<div style="flex:1;background:#252535;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:16px 12px;text-align:center;box-shadow:none"><p style="font-family:\'Space Grotesk\',sans-serif;font-size:28px;font-weight:700;color:#BE9B50;line-height:1">' + stk + '</p><p style="font-family:\'Space Grotesk\',sans-serif;font-size:7px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:6px">STREAK</p></div>'
    h += '<div style="flex:1;background:#252535;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:16px 12px;text-align:center;box-shadow:none"><p style="font-family:\'Space Grotesk\',sans-serif;font-size:28px;font-weight:700;color:' + (ad>=85?'#78C98E':'#D46461') + ';line-height:1">' + ad + '%</p><p style="font-family:\'Space Grotesk\',sans-serif;font-size:7px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:6px">ADHERENCE</p></div>'
    h += '</div>'

    h += '<div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="sh">TIMELINE</div><span style="font-size:9px;color:#BE9B50">' + dl + 'd</span></div>'
    h += '<div style="height:4px;background:rgba(255,255,255,0.03);border-radius:2px;overflow:hidden"><div style="height:100%;border-radius:2px;background:linear-gradient(90deg,#BE9B50,#78C98E);width:' + Math.min(wk/14*100,100) + '%"></div></div>'
    h += '<div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:8px;color:rgba(255,255,255,0.3)">Apr 6</span><span style="font-size:8px;color:#BE9B50">Jul 14 \u{1F382}</span></div></div>'

    h += '<div class="card"><div class="sh">METRICS</div>'
    ;[
      ['7d Weight', wt.length > 0 ? (wt.slice(-7).reduce(function(a,e){return a+e.w},0)/Math.min(wt.length,7)).toFixed(1) : '\u2014', 'lbs'],
      ['RHR', gl('rhr'), 'bpm'],
      ['HRV', gl('hrv'), 'ms'],
      ['Recovery', gl('whoopRecovery'), '/100'],
      ['Sleep', gl('sleepScore'), '/100'],
      ['Strain', gl('whoopStrain'), '/21']
    ].forEach(function(x) {
      h += '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.03)"><span style="font-size:11px;color:rgba(255,255,255,0.35)">' + x[0] + '</span><span style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.75);font-family:\'Space Grotesk\',sans-serif">' + x[1] + (x[1]!=='\u2014'?' '+x[2]:'') + '</span></div>'
    })
    h += '</div>'

    if (wt.length > 1) {
      var ws = wt.map(function(e){return e.w})
      var mn = Math.min.apply(null,ws)-1, mx = Math.max.apply(null,ws)+1, rn = mx-mn||1
      h += '<div class="card"><div class="sh">WEIGHT</div><div style="height:65px;display:flex;align-items:flex-end;gap:2px;margin-top:6px">'
      wt.forEach(function(e,i) { h += '<div style="flex:1;height:100%;display:flex;align-items:flex-end"><div style="width:100%;border-radius:2px 2px 0 0;background:' + (i===wt.length-1?'#BE9B50':'rgba(190,155,80,0.15)') + ';height:' + ((e.w-mn)/rn*100) + '%;min-height:2px"></div></div>' })
      h += '</div><div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:9px;color:rgba(255,255,255,0.35)">Start:' + wt[0].w + '</span><span style="font-size:9px;color:' + (wt[wt.length-1].w<wt[0].w?'#78C98E':'#D46461') + '">Now:' + wt[wt.length-1].w + ' (' + (wt[wt.length-1].w-wt[0].w>0?'+':'') + (wt[wt.length-1].w-wt[0].w).toFixed(1) + ')</span></div></div>'
    }

    h += '<div style="text-align:center;padding:20px 16px"><div style="display:inline-flex;align-items:center;gap:6px">' + BATL_G + BATL + BATL_G + '</div><p style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;color:rgba(190,155,80,0.6);margin-top:8px">DO YOU WANT TO FIGHT?</p><p style="font-size:9px;color:rgba(255,255,255,0.25);margin-top:3px">Amateur Muay Thai \u00B7 Late 2026</p></div>'
  }

  h += '</div>'
  document.getElementById('app').innerHTML = h
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
handleWhoopCallback().then(function() { ld() })
