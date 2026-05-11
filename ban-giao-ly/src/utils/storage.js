export const API_URL = 'https://script.google.com/macros/s/AKfycbzA4jQXxeR6JRyzLLjOUgQ_k9fKR-EJ-BbAXB-vBjz0vn10KNKhKzkbx_Rrsvt_d8L6/exec'

export const KEYS = {
  students:'students', attendance:'attendance', scores:'scores',
  glvs:'glvs', pending:'pending', notifs:'notifs', users:'users',
  user:'bgl_user', theme:'bgl_theme',
}

const cache = {}
function setCache(key, value) {
  cache[key] = value
  try { localStorage.setItem('cache_'+key, JSON.stringify(value)) } catch {}
}
function getCache(key) {
  if (cache[key] !== undefined) return cache[key]
  try {
    const r = localStorage.getItem('cache_'+key)
    if (r) { cache[key]=JSON.parse(r); return cache[key] }
  } catch {}
  return null
}

export function saveLocalData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}
export function loadLocalData(key, fallback=null) {
  try { const r=localStorage.getItem(key); return r?JSON.parse(r):fallback } catch { return fallback }
}

export async function loadSheet(sheetName, fallback=[]) {
  const cached = getCache(sheetName)
  try {
    const res  = await fetch(`${API_URL}?sheet=${sheetName}`, { method:'GET' })
    const json = await res.json()
    if (json.ok && json.data) { setCache(sheetName, json.data); return json.data }
  } catch (err) { console.warn(`Không tải được ${sheetName}:`, err) }
  return cached || fallback
}

export async function saveSheet(sheetName, data) {
  setCache(sheetName, data)
  try {
    await fetch(API_URL, {
      method:'POST', headers:{'Content-Type':'text/plain'},
      body: JSON.stringify({ action:'set', sheet:sheetName, data }),
    })
  } catch (err) { console.warn(`Không lưu được ${sheetName}:`, err) }
}

export async function loadAllData() {
  const [students,attendance,scores,glvs,pending,notifs,users] = await Promise.all([
    loadSheet('students',[]), loadSheet('attendance',[]), loadSheet('scores',[]),
    loadSheet('glvs',[]), loadSheet('pending',[]), loadSheet('notifs',[]), loadSheet('users',[]),
  ])
  return { students, attendance, scores, glvs, pending, notifs, users }
}

export async function initSheets() {
  try {
    const res  = await fetch(API_URL, {
      method:"POST", headers:{"Content-Type":"text/plain"},
      body: JSON.stringify({ action:"init" }),
    })
    const json = await res.json()
    return json.ok
  } catch { return false }
}