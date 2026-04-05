import { createClient } from '@supabase/supabase-js'

// ─── Supabase ─────────────────────────────────────────────────────────────────
const sb = createClient(
  'https://rjvukihlwbdjdzguunsv.supabase.co',
  'sb_publishable_TqFpcIrATpjISbazf38XpQ_1wLzwz_t'
)

// ─── Global state (window.* so inline event handlers can reach it) ────────────
const S = window.S = {
  data: { days: {}, zozo: {} },
  cur: new Date(),
  tab: 'today',
  zSub: 'input',
  showJ: false,
  showF: false,
  showR: false,
  showM: false,
  showCal: false,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  colMob: true,
  colCor: true,
  colStr: true,
  oLog: null
}

// ─── Constants ────────────────────────────────────────────────────────────────
var DY = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
var AQ = '\u201CThe fight is won or lost far away from witnesses \u2014 behind the lines, in the gym, and long before I dance under those lights.\u201D'

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

var BAT = '<svg width="22" height="13" viewBox="0 0 100 60" fill="none"><path d="M50 0C45 12 35 20 20 22C14 22 8 19 0 12C3 24 10 36 22 42C30 46 38 46 44 42C47 40 49 35 50 30C51 35 53 40 56 42C62 46 70 46 78 42C90 36 97 24 100 12C92 19 86 22 80 22C65 20 55 12 50 0Z" fill="#7B3FA0"/><path d="M50 5C46 14 38 20 26 22C22 22 16 20 10 16C12 24 18 32 28 37C34 40 40 40 45 37C48 35 49 31 50 27C51 31 52 35 55 37C60 40 66 40 72 37C82 32 88 24 90 16C84 20 78 22 74 22C62 20 54 14 50 5Z" fill="#5C2D82"/></svg>'
var BATL = '<svg width="40" height="24" viewBox="0 0 100 60" fill="none"><path d="M50 0C45 12 35 20 20 22C14 22 8 19 0 12C3 24 10 36 22 42C30 46 38 46 44 42C47 40 49 35 50 30C51 35 53 40 56 42C62 46 70 46 78 42C90 36 97 24 100 12C92 19 86 22 80 22C65 20 55 12 50 0Z" fill="#7B3FA0"/><path d="M50 5C46 14 38 20 26 22C22 22 16 20 10 16C12 24 18 32 28 37C34 40 40 40 45 37C48 35 49 31 50 27C51 31 52 35 55 37C60 40 66 40 72 37C82 32 88 24 90 16C84 20 78 22 74 22C62 20 54 14 50 5Z" fill="#5C2D82"/></svg>'

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
// Weighted scoring:
// MWF: Muay Thai 35% (binary), Core 30% (8 ex), Mobility 20% (20 ex), Walk 15% (binary)
// TTS: Strength 65% (6 ex), Mobility 20% (20 ex), Walk 15% (binary)
// Sunday: restDay logged = 100%
function cp(k) {
  if (!S.data.days[k]) return 0
  var d = S.data.days[k]
  var dt = new Date(k + 'T12:00:00')
  var w = dt.getDay()
  if (w === 0) return d.restDay ? 100 : 0

  var score = 0

  // Mobility: 20% split across 20 exercises
  var m = d.mobility || {}
  var mobDone = 0
  for (var x in m) if (m[x]) mobDone++
  score += (mobDone / MOB.length) * 20

  // Walk: 15% binary
  var walkDone = (d.walk && d.walk.done) ? 1 : 0
  score += walkDone * 15

  if (w === 1 || w === 3 || w === 5) {
    // Muay Thai: 35% binary
    if (d.muayThai) score += 35
    // Core: 30% split across 8 exercises
    var c = d.core || {}
    var coreDone = 0
    for (var x in c) if (c[x]) coreDone++
    score += (coreDone / COR.length) * 30
  }
  if (w === 2 || w === 4 || w === 6) {
    // Strength: 65% split across 6 exercises
    var s = d.strength || {}
    var strDone = 0
    for (var x in s) if (s[x]) strDone++
    score += (strDone / STR.length) * 65
  }

  return Math.round(score)
}

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
function inp(f, la, p, u) {
  return '<div><label class="lb">' + la + '</label><div class="iw"><input type="number" step="0.1" value="' + (gt()[f] || '') + '" placeholder="' + p + '" onchange="uf(\'' + f + '\',this.value)">' + (u ? '<span class="iu">' + u + '</span>' : '') + '</div></div>'
}
function chk(sec, id, nm, dt, extra) {
  var dn = (gt()[sec] || {})[id]
  return '<div class="chk' + (dn ? ' dn' : '') + '" onclick="tg(\'' + sec + '\',\'' + id + '\');render()"><div class="cb' + (dn ? ' dn' : '') + '">' + (dn ? '<span style="color:#17171c;font-size:10px;font-weight:700">\u2713</span>' : '') + '</div><div style="flex:1"><span style="font-size:13px;color:' + (dn ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.8)') + ';text-decoration:' + (dn ? 'line-through' : 'none') + '">' + nm + '</span><span style="display:block;font-size:10px;color:rgba(255,255,255,0.15)">' + dt + '</span></div>' + (extra || '') + '</div>'
}
function parseSets(str) {
  return str.split('+').reduce(function(s, p) {
    var m = p.match(/^(\d+)x/)
    return s + (m ? parseInt(m[1]) : 1)
  }, 0)
}

// Walk checkbox helper
function walkChk(td) {
  var wd = td.walk && td.walk.done
  var h = '<div class="chk" style="padding:11px 12px;background:' + (wd?'rgba(120,201,142,0.06)':'rgba(120,201,142,0.02)') + ';border:1px solid ' + (wd?'rgba(120,201,142,0.25)':'rgba(120,201,142,0.07)') + ';border-radius:6px;margin-top:10px" onclick="tg(\'walk\',\'done\');render()">'
  h += '<div class="cb' + (wd?' dn':'') + '" style="width:17px;height:17px;border-radius:4px;border-color:' + (wd?'#78C98E':'rgba(120,201,142,0.2)') + ';background:' + (wd?'#78C98E':'transparent') + '">' + (wd?'<span style="color:#17171c;font-size:11px;font-weight:700">\u2713</span>':'') + '</div>'
  h += '<div><span style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:600;color:' + (wd?'#78C98E':'rgba(120,201,142,0.45)') + ';letter-spacing:1px">\u{1F6B6} 8K STEPS</span><span style="display:block;font-size:9px;color:rgba(255,255,255,0.15);margin-top:1px">target: 8,000 steps</span></div>'
  h += '</div>'
  return h
}

// Pull-ups section helper
function pullupsSec(td) {
  var h = '<div class="card" style="margin-bottom:8px"><div class="sh">PULL-UPS (GREASING THE GROOVE)</div>'
  h += '<div class="iw"><input type="number" step="1" min="0" value="' + (td.pullups||'') + '" placeholder="0" onchange="uf(\'pullups\',this.value)" style="font-size:15px;padding:8px 10px"><span class="iu">total reps</span></div>'
  h += '</div>'
  return h
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
  var h = '<div style="padding:12px 16px 0;position:sticky;top:0;background:#17171c;z-index:10;border-bottom:1px solid rgba(255,255,255,0.03)">'

  // Logo + completion badge
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
  h += '<div style="display:flex;align-items:center;gap:8px">' + BAT + '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:14px;font-weight:700;letter-spacing:2.5px;color:#BE9B50">PHASE 1</span>' + BAT + '</div>'
  h += '<div style="background:' + (tp===100?'rgba(190,155,80,0.12)':'rgba(255,255,255,0.04)') + ';border:1px solid ' + (tp===100?'rgba(190,155,80,0.25)':'rgba(255,255,255,0.06)') + ';border-radius:14px;padding:3px 10px"><span style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:600;color:' + (tp===100?'#BE9B50':'rgba(255,255,255,0.45)') + '">' + tp + '%</span></div>'
  h += '</div>'

  // Quote
  h += '<div style="padding:8px 12px;background:rgba(190,155,80,0.03);border:1px solid rgba(190,155,80,0.06);border-radius:6px;margin-bottom:10px">'
  h += '<p style="font-size:10px;color:rgba(190,155,80,0.55);font-style:italic;line-height:1.5">' + AQ + '</p>'
  h += '<p style="font-family:\'Space Grotesk\',sans-serif;font-size:8px;color:rgba(190,155,80,0.3);margin-top:3px;letter-spacing:1px">\u2014 MUHAMMAD ALI</p>'
  h += '</div>'

  // Date navigation — clicking the date text opens calendar popup
  h += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
  h += '<button onclick="S.cur.setDate(S.cur.getDate()-1);render()" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:20px;cursor:pointer;padding:2px 12px">\u2039</button>'
  h += '<div onclick="S.showCal=!S.showCal;if(S.showCal){S.calYear=S.cur.getFullYear();S.calMonth=S.cur.getMonth();}render()" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.02)">'
  h += '<span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.8)">' + DY[dw] + '</span><span style="font-size:10px;color:rgba(255,255,255,0.2)">' + ky + '</span>'
  if (wk >= 1 && wk <= 14) h += '<span style="font-size:8px;font-weight:600;color:#BE9B50;background:rgba(190,155,80,0.1);padding:2px 5px;border-radius:3px;font-family:\'Space Grotesk\',sans-serif">W' + wk + '</span>'
  h += '</div>'
  h += '<button onclick="S.cur.setDate(S.cur.getDate()+1);render()" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:20px;cursor:pointer;padding:2px 12px">\u203A</button>'
  h += '</div>'

  // Day type banner
  var bannerText, bannerColor
  if (sn)      { bannerText = 'Rest Day';                          bannerColor = 'rgba(255,255,255,0.2)' }
  else if (mw) { bannerText = 'Mobility \u2192 Muay Thai \u2192 Core'; bannerColor = '#A97BDB' }
  else         { bannerText = 'Mobility \u2192 Strength';          bannerColor = '#60A5FA' }
  h += '<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:5px;padding:5px 10px;text-align:center;margin-bottom:8px">'
  h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:14px;font-weight:500;letter-spacing:1.2px;color:' + bannerColor + '">' + bannerText + '</span>'
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

    h += '<div style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center" onclick="S.showCal=false;render()">'
    h += '<div style="background:#1e1e27;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;width:88%;max-width:320px" onclick="event.stopPropagation()">'
    // Cal header
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    h += '<button onclick="if(S.calMonth===0){S.calMonth=11;S.calYear--}else{S.calMonth--};render()" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:6px;color:rgba(255,255,255,0.5);font-size:16px;cursor:pointer;padding:4px 10px">\u2039</button>'
    h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:14px;font-weight:600;color:rgba(255,255,255,0.85)">' + MONTHS[cM] + ' ' + cY + '</span>'
    h += '<button onclick="if(S.calMonth===11){S.calMonth=0;S.calYear++}else{S.calMonth++};render()" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:6px;color:rgba(255,255,255,0.5);font-size:16px;cursor:pointer;padding:4px 10px">\u203A</button>'
    h += '</div>'
    // Day headers
    h += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:6px">'
    WDAYS.forEach(function(d) { h += '<div style="text-align:center;font-size:9px;color:rgba(255,255,255,0.2);padding:3px 0;font-family:\'Space Grotesk\',sans-serif;letter-spacing:0.5px">' + d + '</div>' })
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

  h += '<div style="padding:8px 16px 120px">'

  // ══════════════════════════════════════════════════════════════════════════
  // TODAY TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (S.tab === 'today') {

    // DAILY LOG
    h += '<div class="card"><div class="sh">DAILY LOG</div>'
    h += '<div class="g2">' + inp('weight','WEIGHT','170','lbs') + inp('calories','CAL',mw?'2200':tt?'2100':'1800','cal') + '</div>'
    h += '<div class="g3" style="margin-top:6px">' + inp('protein','PROTEIN','140','g') + inp('steps','STEPS','8000','') + inp('whoopStrain','STRAIN','0-21','/21') + '</div>'
    h += '<div class="g2" style="margin-top:6px">' + inp('whoopRecovery','RECOVERY','0-100','/100') + inp('sleepScore','SLEEP','0-100','/100') + '</div>'
    h += '<div class="g2" style="margin-top:6px">' + inp('rhr','RHR','60','bpm') + inp('hrv','HRV','50','ms') + '</div>'
    // Mood selector — tapping selected emoji deselects it
    h += '<div style="margin-top:10px"><label class="lb">MOOD</label><div style="display:flex;gap:14px;padding:4px 2px">'
    MOOD_E.forEach(function(e, i) {
      var sel = td.mood === i
      var unset = td.mood === undefined || td.mood === null
      h += '<span onclick="uf(\'mood\',' + (sel ? 'null' : i) + ');render()" style="font-size:24px;cursor:pointer;opacity:' + (unset ? '0.35' : sel ? '1' : '0.2') + ';transition:opacity 0.15s;filter:' + (sel ? 'none' : 'grayscale(0.3)') + '">' + e + '</span>'
    })
    h += '</div></div>'
    // Energy selector — tapping selected emoji deselects it
    h += '<div style="margin-top:6px;margin-bottom:2px"><label class="lb">ENERGY</label><div style="display:flex;gap:14px;padding:4px 2px">'
    ENRG_E.forEach(function(e, i) {
      var sel = td.energy === i
      var unset = td.energy === undefined || td.energy === null
      h += '<span onclick="uf(\'energy\',' + (sel ? 'null' : i) + ');render()" style="font-size:24px;cursor:pointer;opacity:' + (unset ? '0.35' : sel ? '1' : '0.2') + ';transition:opacity 0.15s;filter:' + (sel ? 'none' : 'grayscale(0.3)') + '">' + e + '</span>'
    })
    h += '</div></div>'
    h += '</div>'

    // MOBILITY (collapsible)
    if (!sn) {
      h += '<div class="card">'
      h += '<div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="S.colMob=!S.colMob;render()">'
      h += '<div class="sh" style="margin-bottom:0">MOBILITY</div>'
      h += '<div style="display:flex;align-items:center;gap:8px">'
      h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:9px;font-weight:600;color:' + (mc===MOB.length?'#BE9B50':'rgba(255,255,255,0.15)') + '">' + mc + '/' + MOB.length + '</span>'
      h += '<span style="font-size:11px;color:rgba(255,255,255,0.25)">' + (S.colMob ? '\u25B8' : '\u25BE') + '</span>'
      h += '</div></div>'
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

    // MUAY THAI + CORE (MWF)
    if (mw) {
      h += '<div class="card">'
      var mt = td.muayThai
      h += '<div class="chk" style="padding:11px 12px;background:' + (mt?'rgba(190,155,80,0.06)':'rgba(190,155,80,0.02)') + ';border:1px solid ' + (mt?'rgba(190,155,80,0.2)':'rgba(190,155,80,0.06)') + ';border-radius:6px;margin-bottom:12px" onclick="uf(\'muayThai\',' + (!mt) + ');render()">'
      h += '<div class="cb' + (mt?' dn':'') + '" style="width:17px;height:17px;border-radius:4px">' + (mt?'<span style="color:#17171c;font-size:11px;font-weight:700">\u2713</span>':'') + '</div>'
      h += '<div><span style="font-family:\'Space Grotesk\',sans-serif;font-size:11px;font-weight:600;color:' + (mt?'#BE9B50':'rgba(190,155,80,0.5)') + ';letter-spacing:1px">\u{1F94A} MUAY THAI</span><span style="display:block;font-size:9px;color:rgba(255,255,255,0.15);margin-top:1px">12\u20131 PM</span></div>'
      h += '</div>'
      // Core — collapsible
      h += '<div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="S.colCor=!S.colCor;render()">'
      h += '<div class="sh" style="margin-bottom:0">CORE</div>'
      h += '<div style="display:flex;align-items:center;gap:8px">'
      h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:9px;font-weight:600;color:' + (cc===COR.length?'#BE9B50':'rgba(255,255,255,0.15)') + '">' + cc + '/' + COR.length + '</span>'
      h += '<span style="font-size:11px;color:rgba(255,255,255,0.25)">' + (S.colCor ? '\u25B8' : '\u25BE') + '</span>'
      h += '</div></div>'
      if (!S.colCor) {
        h += '<div style="margin-top:6px">'
        COR.forEach(function(e) { h += chk('core', e[0], e[1], e[2]) })
        h += '</div>'
      }
      h += '</div>'
      // Pull-ups + walk after core card
      h += pullupsSec(td)
      h += '<div class="card">' + walkChk(td) + '</div>'
    }

    // STRENGTH (TTS) — collapsible
    if (tt) {
      h += '<div class="card">'
      h += '<div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="S.colStr=!S.colStr;render()">'
      h += '<div class="sh" style="margin-bottom:0">STRENGTH</div>'
      h += '<div style="display:flex;align-items:center;gap:8px">'
      h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:9px;font-weight:600;color:' + (sc===STR.length?'#BE9B50':'rgba(255,255,255,0.15)') + '">' + sc + '/' + STR.length + '</span>'
      h += '<span style="font-size:11px;color:rgba(255,255,255,0.25)">' + (S.colStr ? '\u25B8' : '\u25BE') + '</span>'
      h += '</div></div>'
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
              h += '<span style="font-family:\'Space Grotesk\',sans-serif;font-size:8px;color:rgba(255,255,255,0.2);width:32px;flex-shrink:0">SET ' + (si+1) + '</span>'
              h += '<div style="flex:1"><input type="text" value="' + (sets[si].w||'') + '" placeholder="' + e[3] + '" onchange="setSW(\'' + e[0] + '\',' + si + ',\'w\',this.value)"></div>'
              h += '<div style="flex:1"><input type="text" value="' + (sets[si].r||'') + '" placeholder="reps" onchange="setSW(\'' + e[0] + '\',' + si + ',\'r\',this.value)"></div>'
              h += '</div>'
            }
            h += '<p style="font-size:9px;color:rgba(255,255,255,0.12);margin-top:3px;font-style:italic">' + e[4] + '</p>'
            h += '</div>'
          }
        })
        h += '</div>'
      }
      h += '</div>'
      // Pull-ups + walk after strength card
      h += pullupsSec(td)
      h += '<div class="card">' + walkChk(td) + '</div>'
    }

    // REST DAY (Sunday)
    if (sn) {
      h += '<div class="card" style="text-align:center;padding:40px 20px;background:linear-gradient(135deg,rgba(123,63,160,0.1),rgba(0,200,100,0.06));border:1px solid rgba(123,63,160,0.15)">'
      h += BATL
      h += '<p style="font-size:22px;font-weight:700;color:#A97BDB;margin-top:12px">Rest Day</p>'
      h += '<p style="font-size:13px;color:rgba(0,220,120,0.6);margin-bottom:6px;font-weight:500">The city sleeps. You recover.</p>'
      h += '<p style="font-size:11px;color:rgba(255,255,255,0.25);margin-bottom:22px">1,800 cal</p>'
      h += '<button onclick="uf(\'restDay\',true);render()" style="padding:10px 28px;background:' + (td.restDay?'linear-gradient(135deg,#7B3FA0,#00C864)':'rgba(123,63,160,0.1)') + ';color:' + (td.restDay?'#fff':'#A97BDB') + ';border:1px solid rgba(123,63,160,0.25);border-radius:6px;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-size:10px;font-weight:600;letter-spacing:1.5px">' + (td.restDay?'\u2713 LOGGED':'LOG REST') + '</button>'
      h += '</div>'
    }

    // FOOD (toggleable)
    h += '<div class="card"><div style="display:flex;justify-content:space-between;cursor:pointer" onclick="S.showF=!S.showF;render()"><div class="sh">FOOD</div><span style="font-size:8px;color:rgba(255,255,255,0.15);font-family:\'Space Grotesk\',sans-serif">' + (S.showF?'HIDE':'SHOW') + '</span></div>'
    if (S.showF) {
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">'
      ;(td.foodPics || []).forEach(function(img) { h += '<img src="' + img + '" style="width:65px;height:65px;object-fit:cover;border-radius:6px">' })
      h += '<div onclick="document.getElementById(\'fup\').click()" style="width:65px;height:65px;border-radius:6px;border:1px dashed rgba(190,155,80,0.2);display:flex;align-items:center;justify-content:center;cursor:pointer"><span style="font-size:20px;color:rgba(190,155,80,0.4)">+</span></div>'
      h += '<input id="fup" type="file" accept="image/*" style="display:none" onchange="hImg(this,\'f\')"></div>'
      h += '<textarea placeholder="Meal notes..." onchange="uf(\'foodNotes\',this.value)">' + (td.foodNotes||'') + '</textarea>'
    }
    h += '</div>'

    // MIRROR PIC (toggleable — hidden by default)
    h += '<div class="card"><div style="display:flex;justify-content:space-between;cursor:pointer" onclick="S.showM=!S.showM;render()"><div class="sh">MIRROR PIC</div><span style="font-size:8px;color:rgba(255,255,255,0.15);font-family:\'Space Grotesk\',sans-serif">' + (S.showM?'HIDE':'SHOW') + '</span></div>'
    if (S.showM) {
      h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">'
      ;(td.mirrorPics || []).forEach(function(img) {
        h += '<div style="position:relative;width:100%"><img src="' + img + '" style="width:100%;max-height:320px;object-fit:contain;border-radius:6px;display:block"></div>'
      })
      h += '<div onclick="document.getElementById(\'mup\').click()" style="width:65px;height:65px;border-radius:6px;border:1px dashed rgba(123,63,160,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer"><span style="font-size:20px;color:rgba(123,63,160,0.5)">+</span></div>'
      h += '<input id="mup" type="file" accept="image/*" style="display:none" onchange="hImg(this,\'m\')">'
      h += '</div>'
    }
    h += '</div>'

    // REFLECTION
    h += '<div class="card"><div style="display:flex;justify-content:space-between"><div class="sh">REFLECTION</div><button onclick="S.showR=!S.showR;render()" style="background:rgba(190,155,80,0.06);border:1px solid rgba(190,155,80,0.1);border-radius:3px;color:rgba(190,155,80,0.5);font-size:7px;padding:3px 7px;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-weight:600">' + (S.showR?'HIDE':'ALL') + '</button></div>'
    h += '<label class="lb">GRATITUDE</label><input type="text" value="' + (td.gratitude||'') + '" placeholder="One thing..." onchange="uf(\'gratitude\',this.value)" style="margin-bottom:8px">'
    h += '<label class="lb">TIME</label><textarea placeholder="Outside training?" onchange="uf(\'timeSpent\',this.value)">' + (td.timeSpent||'') + '</textarea></div>'
    if (S.showR) {
      h += '<div class="card"><div class="sh">ALL REFLECTIONS</div>'
      Object.entries(S.data.days).filter(function(e) { return e[1].gratitude || e[1].timeSpent }).sort(function(a,b) { return b[0].localeCompare(a[0]) }).forEach(function(e) {
        var dt = new Date(e[0]+'T12:00:00')
        h += '<div style="padding:8px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.03);border-radius:6px;margin-bottom:5px"><span style="font-family:\'Space Grotesk\',sans-serif;font-size:10px;color:#BE9B50">' + DY[dt.getDay()] + '</span><span style="font-size:9px;color:rgba(255,255,255,0.15);margin-left:5px">' + e[0] + '</span>'
        if (e[1].gratitude) h += '<p style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px">' + e[1].gratitude + '</p>'
        if (e[1].timeSpent) h += '<p style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px">' + e[1].timeSpent + '</p>'
        h += '</div>'
      })
      h += '</div>'
    }

    // NOTES / JOURNAL
    h += '<div class="card"><div style="display:flex;justify-content:space-between"><div class="sh">NOTES</div><button onclick="S.showJ=!S.showJ;render()" style="background:rgba(190,155,80,0.06);border:1px solid rgba(190,155,80,0.1);border-radius:3px;color:rgba(190,155,80,0.5);font-size:7px;padding:3px 7px;cursor:pointer;font-family:\'Space Grotesk\',sans-serif;font-weight:600">' + (S.showJ?'HIDE':'JOURNAL') + '</button></div>'
    h += '<textarea placeholder="How did today feel?" rows="3" style="min-height:50px" onchange="uf(\'notes\',this.value)">' + (td.notes||'') + '</textarea></div>'
    if (S.showJ) {
      h += '<div class="card"><div class="sh">JOURNAL</div>'
      Object.entries(S.data.days).filter(function(e) { return e[1].notes && e[1].notes.trim() }).sort(function(a,b) { return b[0].localeCompare(a[0]) }).forEach(function(e) {
        var dt = new Date(e[0]+'T12:00:00'), p = cp(e[0])
        h += '<div style="padding:8px;background:rgba(255,255,255,0.015);border:1px solid rgba(255,255,255,0.03);border-radius:6px;margin-bottom:5px"><div style="display:flex;justify-content:space-between"><span style="font-family:\'Space Grotesk\',sans-serif;font-size:10px;color:#BE9B50">' + DY[dt.getDay()] + ' <span style="color:rgba(255,255,255,0.15)">' + e[0] + '</span></span><span style="font-family:\'Space Grotesk\',sans-serif;font-size:8px;color:' + (p>=80?'#78C98E':'rgba(255,255,255,0.15)') + '">' + p + '%</span></div><p style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;white-space:pre-wrap;margin-top:4px">' + e[1].notes + '</p></div>'
      })
      h += '</div>'
    }

    // Footer
    h += '<div style="text-align:center;padding:24px 16px 8px"><svg width="28" height="17" viewBox="0 0 100 60" fill="none"><path d="M50 0C45 12 35 20 20 22C14 22 8 19 0 12C3 24 10 36 22 42C30 46 38 46 44 42C47 40 49 35 50 30C51 35 53 40 56 42C62 46 70 46 78 42C90 36 97 24 100 12C92 19 86 22 80 22C65 20 55 12 50 0Z" fill="rgba(123,63,160,0.4)"/></svg><p style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;color:rgba(190,155,80,0.5);margin-top:8px">DO YOU WANT TO FIGHT?</p><p style="font-size:10px;color:rgba(255,255,255,0.12);margin-top:4px">Amateur Muay Thai \u00B7 Late 2026</p></div>'
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
        h += '<div style="display:flex;align-items:center;gap:5px;margin-bottom:4px"><span style="font-size:11px;color:rgba(255,255,255,0.4);width:80px;flex-shrink:0">' + m + '</span><input type="number" step="0.1" value="' + vl + '" placeholder="\u2014" style="flex:1;padding:4px 6px;font-size:12px" onchange="if(!S.data.zozo[\'' + ky + '\'])S.data.zozo[\'' + ky + '\']={}; S.data.zozo[\'' + ky + '\'][\'' + k_ + '\']=this.value;sv()"></div>'
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
          if (v) h += '<span style="font-size:8px;color:rgba(255,255,255,0.25);background:rgba(255,255,255,0.025);padding:2px 4px;border-radius:2px">' + m + ':' + v + '"</span>'
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

    h += '<div style="display:flex;gap:8px;margin-bottom:10px">'
    h += '<div style="flex:1;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:8px;padding:16px 12px;text-align:center"><p style="font-family:\'Space Grotesk\',sans-serif;font-size:28px;font-weight:700;color:#BE9B50;line-height:1">' + stk + '</p><p style="font-family:\'Space Grotesk\',sans-serif;font-size:7px;color:rgba(255,255,255,0.2);letter-spacing:2px;margin-top:6px">STREAK</p></div>'
    h += '<div style="flex:1;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:8px;padding:16px 12px;text-align:center"><p style="font-family:\'Space Grotesk\',sans-serif;font-size:28px;font-weight:700;color:' + (ad>=85?'#78C98E':'#D46461') + ';line-height:1">' + ad + '%</p><p style="font-family:\'Space Grotesk\',sans-serif;font-size:7px;color:rgba(255,255,255,0.2);letter-spacing:2px;margin-top:6px">ADHERENCE</p></div>'
    h += '</div>'

    h += '<div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><div class="sh">TIMELINE</div><span style="font-size:9px;color:#BE9B50">' + dl + 'd</span></div>'
    h += '<div style="height:4px;background:rgba(255,255,255,0.03);border-radius:2px;overflow:hidden"><div style="height:100%;border-radius:2px;background:linear-gradient(90deg,#BE9B50,#78C98E);width:' + Math.min(wk/14*100,100) + '%"></div></div>'
    h += '<div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:8px;color:rgba(255,255,255,0.12)">Apr 6</span><span style="font-size:8px;color:#BE9B50">Jul 14 \u{1F382}</span></div></div>'

    h += '<div class="card"><div class="sh">METRICS</div>'
    ;[
      ['7d Weight', wt.length > 0 ? (wt.slice(-7).reduce(function(a,e){return a+e.w},0)/Math.min(wt.length,7)).toFixed(1) : '\u2014', 'lbs'],
      ['RHR', gl('rhr'), 'bpm'],
      ['HRV', gl('hrv'), 'ms'],
      ['Recovery', gl('whoopRecovery'), '/100'],
      ['Sleep', gl('sleepScore'), '/100'],
      ['Strain', gl('whoopStrain'), '/21']
    ].forEach(function(x) {
      h += '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.02)"><span style="font-size:11px;color:rgba(255,255,255,0.25)">' + x[0] + '</span><span style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.65);font-family:\'Space Grotesk\',sans-serif">' + x[1] + (x[1]!=='\u2014'?' '+x[2]:'') + '</span></div>'
    })
    h += '</div>'

    if (wt.length > 1) {
      var ws = wt.map(function(e){return e.w})
      var mn = Math.min.apply(null,ws)-1, mx = Math.max.apply(null,ws)+1, rn = mx-mn||1
      h += '<div class="card"><div class="sh">WEIGHT</div><div style="height:65px;display:flex;align-items:flex-end;gap:2px;margin-top:6px">'
      wt.forEach(function(e,i) { h += '<div style="flex:1;height:100%;display:flex;align-items:flex-end"><div style="width:100%;border-radius:2px 2px 0 0;background:' + (i===wt.length-1?'#BE9B50':'rgba(190,155,80,0.15)') + ';height:' + ((e.w-mn)/rn*100) + '%;min-height:2px"></div></div>' })
      h += '</div><div style="display:flex;justify-content:space-between;margin-top:4px"><span style="font-size:9px;color:rgba(255,255,255,0.15)">Start:' + wt[0].w + '</span><span style="font-size:9px;color:' + (wt[wt.length-1].w<wt[0].w?'#78C98E':'#D46461') + '">Now:' + wt[wt.length-1].w + ' (' + (wt[wt.length-1].w-wt[0].w>0?'+':'') + (wt[wt.length-1].w-wt[0].w).toFixed(1) + ')</span></div></div>'
    }

    h += '<div style="text-align:center;padding:20px 16px"><svg width="28" height="17" viewBox="0 0 100 60" fill="none"><path d="M50 0C45 12 35 20 20 22C14 22 8 19 0 12C3 24 10 36 22 42C30 46 38 46 44 42C47 40 49 35 50 30C51 35 53 40 56 42C62 46 70 46 78 42C90 36 97 24 100 12C92 19 86 22 80 22C65 20 55 12 50 0Z" fill="rgba(123,63,160,0.4)"/></svg><p style="font-family:\'Space Grotesk\',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;color:rgba(190,155,80,0.5);margin-top:8px">DO YOU WANT TO FIGHT?</p><p style="font-size:9px;color:rgba(255,255,255,0.1);margin-top:3px">Amateur Muay Thai \u00B7 Late 2026</p></div>'
  }

  h += '</div>'
  document.getElementById('app').innerHTML = h
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
ld()
