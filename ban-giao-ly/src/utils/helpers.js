// ═══════════════════════════════════════════════════════
// utils/helpers.js  —  Các hàm tiện ích dùng chung
// ═══════════════════════════════════════════════════════

// Tạo ID ngẫu nhiên
export const uid = () => Math.random().toString(36).slice(2, 9)

// Format ngày sang dd/mm/yyyy
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN') : ''

// Lấy ngày hôm nay dạng YYYY-MM-DD
export const today = () => new Date().toISOString().slice(0, 10)

// Tính điểm trung bình từ object điểm
export const calcAvg = (score) => {
  if (!score) return null
  const vals = [score.giaoLy, score.kinhThanh, score.hanhKiem]
    .map(Number)
    .filter(v => !isNaN(v) && v > 0)
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

// Xếp loại từ điểm trung bình
export const xepLoai = (avg) => {
  if (!avg) return null
  const n = Number(avg)
  if (n >= 9) return { label: 'Xuất sắc', color: 'green' }
  if (n >= 7) return { label: 'Giỏi',     color: 'blue'  }
  if (n >= 5) return { label: 'Khá',      color: 'amber' }
  return         { label: 'Yếu',      color: 'red'   }
}

// Ghép tên đầy đủ: Tên Thánh + Họ Tên
export const fullName = (s) =>
  [s?.tenThanh, s?.hoVaTen].filter(Boolean).join(' ')
