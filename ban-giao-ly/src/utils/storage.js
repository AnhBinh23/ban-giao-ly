// ═══════════════════════════════════════════════════════
// utils/storage.js — Kết nối Google Sheets qua Apps Script
// ═══════════════════════════════════════════════════════

// ⚠️ THAY URL NÀY SAU KHI DEPLOY APPS SCRIPT
export const API_URL = 'https://script.google.com/macros/s/AKfycbxj0TSGsL1V6DIEgJczfHLbPgmKR93bjzORW0saTk3YxrUSmv_Z9yaRtMapt-yuW_5A/exec'

export const KEYS = {
  students:   'students',
  attendance: 'attendance',
  scores:     'scores',
  glvs:       'glvs',
  pending:    'pending',
  notifs:     'notifs',
  users:      'users',
  // Cache local
  user:       'bgl_user',
  theme:      'bgl_theme',
}

// ── Cache localStorage để app chạy nhanh hơn ─────────
const cache = {}

function setCache(key, value) {
  cache[key] = value
  try { localStorage.setItem('cache_' + key, JSON.stringify(value)) } catch {}
}
function getCache(key) {
  if (cache[key] !== undefined) return cache[key]
  try {
    const r = localStorage.getItem('cache_' + key)
    if (r) { cache[key] = JSON.parse(r); return cache[key] }
  } catch {}
  return null
}

// ── Lưu user đang đăng nhập (chỉ localStorage) ───────
export function saveLocalData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
export function loadLocalData(key, fallback = null) {
  try {
    const r = localStorage.getItem(key)
    return r ? JSON.parse(r) : fallback
  } catch { return fallback }
}

// ── Đọc 1 sheet từ Sheets ────────────────────────────
export async function loadSheet(sheetName, fallback = []) {
  // Trả về cache ngay, load mới ở background
  const cached = getCache(sheetName)

  try {
    const res  = await fetch(`${API_URL}?sheet=${sheetName}`, { method:'GET' })
    const json = await res.json()
    if (json.ok && json.data) {
      setCache(sheetName, json.data)
      return json.data
    }
  } catch (err) {
    console.warn(`Không tải được ${sheetName}:`, err)
  }

  return cached || fallback
}

// ── Ghi 1 sheet lên Sheets ────────────────────────────
export async function saveSheet(sheetName, data) {
  setCache(sheetName, data) // lưu cache ngay

  try {
    await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify({ action:'set', sheet:sheetName, data }),
    })
  } catch (err) {
    console.warn(`Không lưu được ${sheetName}:`, err)
  }
}

// ── Load toàn bộ data khi khởi động app ──────────────
export async function loadAllData() {
  // Thử load từng sheet song song
  const [students, attendance, scores, glvs, pending, notifs, users] = await Promise.all([
    loadSheet('students',   []),
    loadSheet('attendance', []),
    loadSheet('scores',     []),
    loadSheet('glvs',       []),
    loadSheet('pending',    []),
    loadSheet('notifs',     []),
    loadSheet('users',      []),
  ])
  return { students, attendance, scores, glvs, pending, notifs, users }
}

// ── Khởi tạo Sheet lần đầu ───────────────────────────
export async function initSheets() {
  try {
    const res  = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' },
      body:    JSON.stringify({ action:'init' }),
    })
    const json = await res.json()
    return json.ok
  } catch { return false }
}