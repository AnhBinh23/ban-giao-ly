export const uid = () => Math.random().toString(36).slice(2, 9)
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : ''
export const today = () => new Date().toISOString().slice(0, 10)

// calcAvg: hỗ trợ cả format mới (diem) lẫn cũ (giaoLy/kinhThanh/hanhKiem)
export const calcAvg = (score) => {
  if (!score) return null
  // Format mới — chỉ có 1 điểm thi
  if (score.diem !== undefined && score.diem !== '') {
    const v = parseFloat(score.diem)
    return isNaN(v) ? null : v.toFixed(1)
  }
  // Format cũ — 3 môn
  const vals = [score.giaoLy, score.kinhThanh, score.hanhKiem]
    .map(Number).filter(v => !isNaN(v) && v > 0)
  if (!vals.length) return null
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

export const xepLoai = (avg) => {
  if (!avg) return null
  const n = Number(avg)
  if (n >= 9) return { label:'Giỏi', color:'green' }
  if (n >= 7) return { label:'Khá',  color:'blue'  }
  if (n >= 5) return { label:'TB',   color:'amber' }
  return         { label:'Yếu',  color:'red'   }
}

export const fullName = (s) =>
  [s?.tenThanh, s?.hoVaTen].filter(Boolean).join(' ')