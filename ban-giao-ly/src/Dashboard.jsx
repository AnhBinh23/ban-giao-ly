import { useState } from 'react'
import { ALL_CLASSES, PARISHES, KY_THI, getClass } from '../constants'
import { calcAvg, fullName } from '../utils/helpers'

export default function Dashboard({ user, students, attendance, scores }) {
  const [expandClass, setExpandClass] = useState(null)

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const totalAtt = attendance.length
  const coMat    = attendance.filter(a => a.trangThai === 'Có mặt').length
  const rate     = totalAtt ? Math.round(coMat / totalAtt * 100) : 0

  const myClasses = ALL_CLASSES.filter(c =>
    user.role === 'admin' || c.id === user.classId
  )

  const latestKy  = KY_THI[KY_THI.length - 1]
  const avgsForKy = scores
    .filter(sc => sc.ky === latestKy && myClasses.find(c => c.id === sc.classId))
    .map(sc => parseFloat(calcAvg(sc)))
    .filter(v => !isNaN(v))
  const overallAvg = avgsForKy.length
    ? (avgsForKy.reduce((a, b) => a + b, 0) / avgsForKy.length).toFixed(1)
    : null

  const recentDates = [...new Set(attendance.map(a => a.date))].sort().slice(-5)
  const khoiGroups  = [...new Set(myClasses.map(c => c.khoi))]

  // Lớp đang mở (nếu có)
  const openedClass   = expandClass ? myClasses.find(c => c.id === expandClass) : null
  const openedStudents = openedClass ? students.filter(s => s.lopId === openedClass.id) : []

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

      {/* Thống kê nhanh — ẩn khi đang mở 1 lớp */}
      {!expandClass && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-num">{students.length}</div>
            <div className="stat-lbl">Thiếu nhi</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: rate>=80?'var(--green)':rate>=60?'var(--amber)':'var(--red)' }}>
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
      )}

      {/* Buổi điểm danh gần đây — ẩn khi đang mở lớp */}
      {!expandClass && recentDates.length > 0 && (
        <>
          <div className="sec-hd">
            <div className="sec-title">📅 Điểm danh gần đây</div>
          </div>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {[...recentDates].reverse().map(d => {
              const dayAtt  = attendance.filter(a => a.date === d)
              const dayRate = dayAtt.length
                ? Math.round(dayAtt.filter(a=>a.trangThai==='Có mặt').length / dayAtt.length * 100)
                : 0
              return (
                <div key={d} style={{ background:'var(--sky-bg)', borderRadius:10, padding:'8px 12px', minWidth:80, textAlign:'center' }}>
                  <div style={{ fontSize:12, fontWeight:900, color:'var(--sky-dd)' }}>
                    {new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' })}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color: dayRate>=80?'var(--green)':'var(--amber)' }}>
                    {dayRate}%
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ══ Danh sách lớp ══ */}
      <div className="sec-hd">
        <div className="sec-title">📋 Các lớp</div>
        {/* Nút thu gọn khi đang mở 1 lớp */}
        {expandClass && (
          <button
            onClick={() => setExpandClass(null)}
            style={{ background:'var(--sky-ll)', border:'none', borderRadius:20, padding:'5px 12px',
              fontSize:12, fontWeight:800, color:'var(--sky-dd)', cursor:'pointer' }}>
            ← Tất cả lớp
          </button>
        )}
      </div>

      {/* Khi KHÔNG mở lớp nào: hiện toàn bộ theo khối */}
      {!expandClass && khoiGroups.map(khoi => (
        <div key={khoi} style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>
            {khoi}
          </div>
          {myClasses.filter(c => c.khoi === khoi).map(c => {
            const cAtt  = attendance.filter(a => a.classId === c.id)
            const cRate = cAtt.length
              ? Math.round(cAtt.filter(a=>a.trangThai==='Có mặt').length / cAtt.length * 100)
              : null
            const count = students.filter(s => s.lopId === c.id).length
            return (
              <div key={c.id} className="list-item" style={{ marginBottom:8 }}
                onClick={() => setExpandClass(c.id)}>
                <div className="list-avatar" style={{ fontSize:11, fontWeight:900 }}>{c.id}</div>
                <div className="list-info">
                  <div className="list-name">{c.name}</div>
                  <div className="list-sub">{count} thiếu nhi</div>
                </div>
                {cRate !== null ? (
                  <div style={{ textAlign:'right', marginRight:6 }}>
                    <div style={{ fontSize:13, fontWeight:900, color: cRate>=80?'var(--green)':'var(--amber)' }}>{cRate}%</div>
                    <div style={{ fontSize:9, color:'var(--gray)', fontWeight:700 }}>Chuyên cần</div>
                  </div>
                ) : (
                  <span className="badge badge-blue" style={{ marginRight:6 }}>{c.khoi}</span>
                )}
                <div style={{ color:'var(--gray)', fontSize:18, flexShrink:0 }}>›</div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Khi đang mở 1 lớp: chỉ hiện lớp đó + danh sách thiếu nhi */}
      {expandClass && openedClass && (
        <div style={{ background:'var(--white)', borderRadius:16, boxShadow:'0 2px 12px rgba(14,165,233,.08)', overflow:'hidden' }}>
          {/* Header lớp */}
          <div style={{ background:'linear-gradient(135deg,var(--sky-dd),var(--sky))', padding:'14px 16px',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, color:'var(--sky-l)', fontWeight:700, marginBottom:2 }}>{openedClass.khoi}</div>
              <div style={{ fontSize:18, fontWeight:900, color:'#fff' }}>{openedClass.name}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:22, fontWeight:900, color:'#fff' }}>{openedStudents.length}</div>
              <div style={{ fontSize:11, color:'var(--sky-l)', fontWeight:700 }}>Thiếu nhi</div>
            </div>
          </div>

          {/* Danh sách thiếu nhi */}
          {openedStudents.length === 0 ? (
            <div className="empty" style={{ padding:'30px 20px' }}>
              <div className="empty-icon">👶</div>
              <div className="empty-text">Chưa có thiếu nhi trong lớp</div>
            </div>
          ) : (
            <div style={{ padding:'8px 12px 16px' }}>
              {openedStudents.map((s, idx) => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12,
                  padding:'10px 4px', borderBottom: idx < openedStudents.length-1 ? '1px solid var(--lgray)' : 'none' }}>
                  {/* Số thứ tự */}
                  <div style={{ width:28, height:28, borderRadius:8, background:'var(--sky-ll)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:900, color:'var(--sky-dd)', flexShrink:0 }}>
                    {idx + 1}
                  </div>
                  {/* Tên */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:14, color:'#1e3a5f',
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {fullName(s)}
                    </div>
                    <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600, marginTop:1 }}>
                      GX {s.giaoXu}{s.ngaySinh ? ` · ${new Date(s.ngaySinh).getFullYear()}` : ''}
                    </div>
                  </div>
                  {/* SĐT phụ huynh */}
                  {s.sdt && (
                    <a href={`tel:${s.sdt}`}
                      onClick={e => e.stopPropagation()}
                      style={{ background:'var(--sky-ll)', borderRadius:8, padding:'5px 9px',
                        fontSize:11, fontWeight:800, color:'var(--sky-dd)', textDecoration:'none', flexShrink:0 }}>
                      📞
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ height:8 }} />
    </div>
  )
}