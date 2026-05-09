// ═══════════════════════════════════════════════════════
// utils/storage.js  —  Lưu và đọc dữ liệu localStorage
// Sau này thay bằng Google Sheets API hoặc Supabase
// ═══════════════════════════════════════════════════════

// Lưu dữ liệu vào localStorage
export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Lỗi lưu dữ liệu:', err)
  }
}

// Đọc dữ liệu từ localStorage
export function loadData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    console.error('Lỗi đọc dữ liệu:', err)
    return fallback
  }
}

// Xóa dữ liệu theo key
export function removeData(key) {
  localStorage.removeItem(key)
}

// Keys dùng trong app
export const KEYS = {
  user:       'bgl_user',
  students:   'bgl_students',
  attendance: 'bgl_attendance',
  scores:     'bgl_scores',
  glvs:       'bgl_glvs',
}