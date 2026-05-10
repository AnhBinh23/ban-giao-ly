// ═══════════════════════════════════════════════════════
// pages/ClassDetail.jsx  —  Trang chi tiết 1 lớp
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { KY_THI } from '../constants'
import { calcAvg, xepLoai, fullName } from '../utils/helpers'

export default function ClassDetail({ cls, students, attendance, scores, onBack }) {
  const [tab, setTab] = useState('ds')   // 'ds' | 'diemdanh' | 'diem'
  const [kyFilter, setKyFilter] = useState(KY_THI[0])

  // ── Dữ liệu lớp ──────────────────────────────────────
  const classStudents = students.filter(s => s.lopId === cls.id)

  // ── Chuyên cần ────────────────────────────────────────
  const cAtt   = attendance.filter(a => a.classId === cls.id)
  const dates  = [...new Set(cAtt.map(a => a.date))].sort().reverse()
  const rate   = cAtt.length
    ? Math.round(cAtt.filter(a => a.trangThai === 'Có mặt').length / cAtt.length * 100)
    : 0

  // ── Điểm ─────────────────────────────────────────────
  const getScore = (sid) =>
    scores.find(sc => sc.studentId === sid && sc.classId === cls.id && sc.ky === kyFilter)

  // badge màu
  const badgeClass = (color) =>
    color === 'green' ? 'badge-green' : color === 'blue' ? 'badge-blue' : color === 'amber' ? 'badge-amber' : 'badge-red'

  return (
    <div className="content" style={{ paddingTop: 12 }}>

      {/* Nút quay lại */}
      <button
        onClick={onBack}
        style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
          color:'var(--sky-dd)', fontFamily:'Nunito', fontWeight:800, fontSize:13,
          cursor:'pointer', marginBottom:14, padding:0 }}
      >
        ← Quay lại
      </button>

      {/* Header lớp */}
      <div className="card card-blue" style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, opacity:.8, fontWeight:700, marginBottom:4 }}>{cls.khoi}</div>
            <div style={{ fontSize:22, fontWeight:900 }}>{cls.name}</div>
            <div style={{ fontSize:13, opacity:.85, fontWeight:700, marginTop:4 }}>
              {classStudents.length} thiếu nhi
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:28, fontWeight:900 }}>{rate}%</div>
            <div style={{ fontSize:11, opacity:.8, fontWeight:700 }}>Chuyên cần</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab==='ds'?'active':''}`}        onClick={() => setTab('ds')}>👦 Danh sách</button>
        <button className={`tab ${tab==='diemdanh'?'active':''}`}  onClick={() => setTab('diemdanh')}>✅ Điểm danh</button>
        <button className={`tab ${tab==='diem'?'active':''}`}      onClick={() => setTab('diem')}>⭐ Điểm thi</button>
      </div>

      {/* ══ Tab 1: Danh sách ══ */}
      {tab === 'ds' && (
        <>
          {classStudents.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👶</div>
              <div className="empty-text">Chưa có thiếu nhi trong lớp</div>
            </div>
          ) : classStudents.map((s, idx) => (
            <div key={s.id} className="list-item">
              <div style={{ width:32, height:32, borderRadius:8, background:'var(--sky-ll)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:900, color:'var(--sky-dd)', flexShrink:0 }}>
                {idx + 1}
              </div>
              <div className="list-info">
                <div className="list-name">{fullName(s)}</div>
                <div className="list-sub">
                  GX {s.giaoXu}
                  {s.ngaySinh ? ` · ${new Date(s.ngaySinh).toLocaleDateString('vi-VN')}` : ''}
                </div>
              </div>
              {s.phuHuynh && (
                <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600, textAlign:'right', maxWidth:80 }}>
                  {s.phuHuynh}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* ══ Tab 2: Điểm danh chi tiết ══ */}
      {tab === 'diemdanh' && (
        <>
          {dates.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Chưa có dữ liệu điểm danh</div>
            </div>
          ) : (
            <>
              {/* Tổng kết */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
                {[
                  { label:'Có mặt', count: cAtt.filter(a=>a.trangThai==='Có mặt').length, bg:'#D1FAE5', color:'#065F46' },
                  { label:'Vắng',   count: cAtt.filter(a=>a.trangThai==='Vắng').length,   bg:'#FEE2E2', color:'#991B1B' },
                  { label:'Phép',   count: cAtt.filter(a=>a.trangThai==='Phép').length,   bg:'#FEF3C7', color:'#92400E' },
                ].map(item => (
                  <div key={item.label} style={{ background:item.bg, borderRadius:10, padding:'10px 6px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:900, color:item.color }}>{item.count}</div>
                    <div style={{ fontSize:10, fontWeight:800, color:item.color }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Từng buổi */}
              {dates.map(d => {
                const dayAtt = cAtt.filter(a => a.date === d)
                const co     = dayAtt.filter(a => a.trangThai==='Có mặt').length
                return (
                  <div key={d} className="card" style={{ marginBottom:10, padding:'12px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ fontWeight:800, fontSize:14 }}>
                        📅 {new Date(d).toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' })}
                      </div>
                      <span style={{ fontWeight:900, color: co/dayAtt.length>=0.8 ? 'var(--green)':'var(--amber)', fontSize:13 }}>
                        {co}/{dayAtt.length}
                      </span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {classStudents.map(s => {
                        const rec = dayAtt.find(a => a.studentId === s.id)
                        const st  = rec?.trangThai
                        const bg  = st==='Có mặt' ? '#D1FAE5' : st==='Vắng' ? '#FEE2E2' : st==='Phép' ? '#FEF3C7' : '#F1F5F9'
                        const cl  = st==='Có mặt' ? '#065F46' : st==='Vắng' ? '#991B1B' : st==='Phép' ? '#92400E' : '#94A3B8'
                        return (
                          <div key={s.id} style={{ background:bg, borderRadius:8, padding:'4px 8px', fontSize:11, fontWeight:700, color:cl }}>
                            {s.tenThanh?.split(' ').pop() || s.hoVaTen?.split(' ').pop()}
                            <span style={{ opacity:.6, marginLeft:3 }}>
                              {st==='Có mặt'?'✓':st==='Vắng'?'✗':st==='Phép'?'P':'?'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </>
      )}

      {/* ══ Tab 3: Điểm thi ══ */}
      {tab === 'diem' && (
        <>
          {/* Chọn kỳ */}
          <div className="tabs">
            {KY_THI.map(k => (
              <button key={k} className={`tab ${kyFilter===k?'active':''}`} onClick={() => setKyFilter(k)}>
                {k}
              </button>
            ))}
          </div>

          {classStudents.length === 0 ? (
            <div className="empty"><div className="empty-icon">📝</div><div className="empty-text">Chưa có thiếu nhi</div></div>
          ) : classStudents.map((s, idx) => {
            const sc  = getScore(s.id)
            const avg = calcAvg(sc)
            const xl  = xepLoai(avg)
            return (
              <div key={s.id} className="score-card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: sc ? 8 : 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:'var(--sky-ll)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:900, color:'var(--sky-dd)', flexShrink:0 }}>
                      {idx+1}
                    </div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:14 }}>{fullName(s)}</div>
                      <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600 }}>GX {s.giaoXu}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    {avg ? (
                      <>
                        <div style={{ fontSize:20, fontWeight:900, color:'var(--sky-dd)' }}>{avg}</div>
                        <span className={`badge ${badgeClass(xl.color)}`}>{xl.label}</span>
                      </>
                    ) : (
                      <span className="badge" style={{ background:'var(--lgray)', color:'var(--gray)' }}>Chưa có</span>
                    )}
                  </div>
                </div>
                {sc && (
                  <div style={{ display:'flex', gap:6 }}>
                    {[
                      { label:'Giáo Lý',    val: sc.giaoLy    },
                      { label:'Kinh Thánh', val: sc.kinhThanh },
                      { label:'Hạnh Kiểm',  val: sc.hanhKiem  },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ flex:1, background:'var(--sky-bg)', borderRadius:8, padding:'4px 8px', textAlign:'center' }}>
                        <div style={{ fontSize:10, color:'var(--gray)', fontWeight:700 }}>{label}</div>
                        <div style={{ fontWeight:900, color:'var(--sky-dd)' }}>{val || '—'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      <div style={{ height: 16 }} />
    </div>
  )
}