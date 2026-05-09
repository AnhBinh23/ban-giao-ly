// ═══════════════════════════════════════════════════════
// pages/Dashboard.jsx  —  Trang chủ / Tổng quan
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { ALL_CLASSES, PARISHES, KY_THI, getClass } from '../constants'
import { calcAvg, fullName } from '../utils/helpers'

export default function Dashboard({ user, students, attendance, scores }) {
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })

  // Tỷ lệ chuyên cần tổng
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

  // Thống kê điểm kỳ mới nhất (Học kỳ II hoặc kỳ cuối cùng)
  const latestKy = KY_THI[KY_THI.length - 1]
  const avgsForKy = scores
    .filter(sc => sc.ky === latestKy && myClasses.find(c => c.id === sc.classId))
    .map(sc => parseFloat(calcAvg(sc)))
    .filter(v => !isNaN(v))
  const overallAvg = avgsForKy.length
    ? (avgsForKy.reduce((a,b)=>a+b,0)/avgsForKy.length).toFixed(1)
    : null

  // Số buổi điểm danh gần nhất
  const recentDates = [...new Set(attendance.map(a => a.date))].sort().slice(-5)

  const khoiGroups = [...new Set(myClasses.map(c => c.khoi))]
  const [expandClass, setExpandClass] = useState(null)

  return (
    <div className="content">

      {/* Thẻ chào mừng */}
      <div className="card card-blue">
        <div style={{ fontSize:12, opacity:.85, fontWeight:700, marginBottom:2 }}>Xin chào 👋</div>
        <div style={{ fontSize:18, fontWeight:900, marginBottom:2 }}>{user.name}</div>
        <div style={{ fontSize:11, opacity:.75, fontWeight:600 }}>{today}</div>
        {user.role === 'gly' && (
          <div style={{ marginTop:10, background:'rgba(255,255,255,.2)', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:700 }}>
            📚 Phụ trách: {getClass(user.classId)?.name}
          </div>
        )}
      </div>

      {/* Thống kê nhanh */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{students.length}</div>
          <div className="stat-lbl">Thiếu nhi</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: rate >= 80 ? 'var(--green)' : rate >= 60 ? 'var(--amber)' : 'var(--red)' }}>
            {rate}%
          </div>
          <div className="stat-lbl">Chuyên cần</div>
        </div>
        {user.role === 'admin' && (
          <>
            <div className="stat-card">
              <div className="stat-num">{PARISHES.length}</div>
              <div className="stat-lbl">Giáo xứ</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{ALL_CLASSES.length}</div>
              <div className="stat-lbl">Tổng lớp</div>
            </div>
          </>
        )}
        {overallAvg && (
          <div className="stat-card">
            <div className="stat-num" style={{ color:'var(--sky-dd)' }}>{overallAvg}</div>
            <div className="stat-lbl">ĐTB {latestKy}</div>
          </div>
        )}
      </div>

      {/* Điểm danh gần đây */}
      {recentDates.length > 0 && (
        <>
          <div className="sec-hd">
            <div className="sec-title">📅 Buổi điểm danh gần đây</div>
          </div>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {recentDates.reverse().map(d => {
              const dayAtt   = attendance.filter(a => a.date === d)
              const dayRate  = dayAtt.length
                ? Math.round(dayAtt.filter(a=>a.trangThai==='Có mặt').length / dayAtt.length * 100) : 0
              return (
                <div key={d} style={{ background:'var(--sky-bg)', borderRadius:10, padding:'8px 12px', minWidth:90, textAlign:'center' }}>
                  <div style={{ fontSize:12, fontWeight:900, color:'var(--sky-dd)' }}>
                    {new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' })}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color: dayRate >= 80 ? 'var(--green)' : 'var(--amber)' }}>
                    {dayRate}%
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Danh sách lớp theo khối */}
      <div className="sec-hd">
        <div className="sec-title">📋 Các lớp</div>
      </div>

      {khoiGroups.map(khoi => (
        <div key={khoi} style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>
            {khoi}
          </div>
          {myClasses.filter(c => c.khoi === khoi).map(c => {
            const cAtt      = attendance.filter(a => a.classId === c.id)
            const cRate     = cAtt.length ? Math.round(cAtt.filter(a=>a.trangThai==='Có mặt').length / cAtt.length * 100) : null
            const isOpen    = expandClass === c.id
            const classKids = students.filter(s => s.lopId === c.id)
            return (
              <div key={c.id} style={{ marginBottom:8, background:'var(--white)', borderRadius:14, boxShadow:'0 1px 6px rgba(0,0,0,.05)', overflow:'hidden' }}>
                {/* Header lớp — bấm để mở/đóng */}
                <div
                  onClick={() => setExpandClass(isOpen ? null : c.id)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', cursor:'pointer' }}
                >
                  <div className="list-avatar" style={{ fontSize:11, fontWeight:900, flexShrink:0 }}>{c.id}</div>
                  <div className="list-info">
                    <div className="list-name">{c.name}</div>
                    <div className="list-sub">{c.count} thiếu nhi</div>
                  </div>
                  {cRate !== null ? (
                    <div style={{ textAlign:'right', marginRight:4 }}>
                      <div style={{ fontSize:13, fontWeight:900, color: cRate >= 80 ? 'var(--green)' : 'var(--amber)' }}>{cRate}%</div>
                      <div style={{ fontSize:9, color:'var(--gray)', fontWeight:700 }}>Chuyên cần</div>
                    </div>
                  ) : (
                    <span className="badge badge-blue" style={{ marginRight:4 }}>{c.khoi}</span>
                  )}
                  <div style={{ fontSize:16, color:'var(--gray)', transition:'.2s', transform: isOpen ? 'rotate(180deg)' : 'none', flexShrink:0 }}>▾</div>
                </div>

                {/* Danh sách thiếu nhi — hiện khi mở */}
                {isOpen && (
                  <div style={{ borderTop:'1.5px solid var(--lgray)', padding:'8px 12px 12px' }}>
                    {classKids.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'14px 0', color:'var(--gray)', fontSize:13, fontWeight:700 }}>
                        Chưa có thiếu nhi trong lớp
                      </div>
                    ) : classKids.map((s, idx) => (
                      <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 4px', borderBottom: idx < classKids.length-1 ? '1px solid var(--lgray)' : 'none' }}>
                        <div style={{ width:30, height:30, borderRadius:8, background:'var(--sky-ll)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'var(--sky-dd)', flexShrink:0 }}>
                          {s.tenThanh?.charAt(0) || s.hoVaTen?.charAt(0)}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:13, color:'#1e3a5f', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {fullName(s)}
                          </div>
                          <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600 }}>GX {s.giaoXu}</div>
                        </div>
                        <div style={{ fontSize:11, color:'var(--gray)', fontWeight:700, flexShrink:0 }}>
                          {s.ngaySinh ? new Date(s.ngaySinh).getFullYear() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}



      {/* Padding cuối */}
      <div style={{ height:8 }} />
    </div>
  )
}