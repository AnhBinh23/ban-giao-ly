// ═══════════════════════════════════════════════════════
// pages/Dashboard.jsx  —  Trang chủ / Tổng quan
// ═══════════════════════════════════════════════════════
import { ALL_CLASSES, PARISHES, getClass } from '../constants'

export default function Dashboard({ user, students, attendance }) {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })

  // Tính tỷ lệ chuyên cần
  const totalAtt = attendance.length
  const coMat    = attendance.filter(a => a.trangThai === 'Có mặt').length
  const rate     = totalAtt ? Math.round(coMat / totalAtt * 100) : 0

  // Lọc lớp theo quyền
  const myClasses = ALL_CLASSES.filter(c =>
    user.role === 'admin' || c.id === user.classId
  ).map(c => ({
    ...c,
    count: students.filter(s => s.lopId === c.id).length
  }))

  // Nhóm lớp theo khối
  const khoiGroups = [...new Set(myClasses.map(c => c.khoi))]

  return (
    <div className="content">

      {/* Thẻ chào mừng */}
      <div className="card card-blue">
        <div style={{ fontSize: 12, opacity: .85, fontWeight: 700, marginBottom: 2 }}>Xin chào 👋</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 2 }}>{user.name}</div>
        <div style={{ fontSize: 11, opacity: .75, fontWeight: 600 }}>{today}</div>
        {user.role === 'gly' && (
          <div style={{ marginTop: 10, background: 'rgba(255,255,255,.2)', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>
            📚 Phụ trách: {getClass(user.classId)?.name}
          </div>
        )}
      </div>

      {/* Thống kê */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{students.length}</div>
          <div className="stat-lbl">Thiếu nhi</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: 'var(--green)' }}>{rate}%</div>
          <div className="stat-lbl">Chuyên cần</div>
        </div>
        {user.role === 'admin' && <>
          <div className="stat-card">
            <div className="stat-num">{PARISHES.length}</div>
            <div className="stat-lbl">Giáo xứ</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{ALL_CLASSES.length}</div>
            <div className="stat-lbl">Tổng lớp</div>
          </div>
        </>}
      </div>

      {/* Danh sách lớp theo khối */}
      <div className="sec-hd">
        <div className="sec-title">📋 Các lớp</div>
      </div>

      {khoiGroups.map(khoi => (
        <div key={khoi} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
            {khoi}
          </div>
          {myClasses.filter(c => c.khoi === khoi).map(c => (
            <div key={c.id} className="list-item" style={{ marginBottom: 6 }}>
              <div className="list-avatar" style={{ fontSize: 11, fontWeight: 900 }}>{c.id}</div>
              <div className="list-info">
                <div className="list-name">{c.name}</div>
                <div className="list-sub">{c.count} thiếu nhi</div>
              </div>
              <span className="badge badge-blue">{c.khoi}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Phân bổ theo giáo xứ (chỉ admin) */}
      {user.role === 'admin' && (
        <>
          <div className="sec-hd" style={{ marginTop: 4 }}>
            <div className="sec-title">⛪ Theo giáo xứ</div>
          </div>
          {PARISHES.map(gx => (
            <div key={gx} className="list-item">
              <div className="list-avatar" style={{ background: '#DBEAFE', color: '#1E40AF' }}>⛪</div>
              <div className="list-info">
                <div className="list-name">GX {gx}</div>
                <div className="list-sub">{students.filter(s => s.giaoXu === gx).length} thiếu nhi</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
