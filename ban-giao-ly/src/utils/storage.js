export function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch (err) { console.error('Lỗi lưu:', err) }
}
export function loadData(key, fallback = null) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback }
  catch { return fallback }
}
export function removeData(key) { localStorage.removeItem(key) }
export const KEYS = {
  user:       'bgl_user',
  students:   'bgl_students',
  attendance: 'bgl_attendance',
  scores:     'bgl_scores',
  glvs:       'bgl_glvs',
  theme:      'bgl_theme',
  notifs:     'bgl_notifs',
}