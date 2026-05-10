// ═══════════════════════════════════════════════════════
// pages/Attendance.jsx  —  Điểm danh + vuốt nhanh + lịch sử vắng
// ═══════════════════════════════════════════════════════
import { useState, useRef } from 'react'
import { ALL_CLASSES } from '../constants'
import { uid, today, fullName } from '../utils/helpers'

// ── SwipeCard — vuốt trái/phải để điểm danh ──────────
function SwipeCard({ student, status, onStatus }) {
  const startX   = useRef(null)
  const cardRef  = useRef(null)
  const [offset, setOffset] = useState(0)
  const [hint,   setHint]   = useState(null) // 'co' | 'vang'

  const STATUS_SEQ = ['Có mặt', 'Vắng', 'Phép']

  const onStart = (e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX
  }
  const onMove = (e) => {
    if (startX.current === null) return
    const dx = (e.touches ? e.touches[0].clientX : e.clientX) - startX.current
    setOffset(Math.max(-80, Math.min(80, dx)))
    if (dx > 20)  setHint('co')
    else if (dx < -20) setHint('vang')
    else setHint(null)
  }
  const onEnd = () => {
    if (offset > 40)       onStatus('Có mặt')
    else if (offset < -40) onStatus('Vắng')
    setOffset(0); setHint(null); startX.current = null
  }

  const bgColor = status === 'Có mặt' ? '#D1FAE5'
    : status === 'Vắng'   ? '#FEE2E2'
    : status === 'Phép'   ? '#FEF3C7'
    : 'var(--card-bg)'

  const txtColor = status === 'Có mặt' ? '#065F46'
    : status === 'Vắng'   ? '#991B1B'
    : status === 'Phép'   ? '#92400E'
    : 'var(--gray)'

  return (
    <div style={{ position:'relative', marginBottom:6, overflow:'hidden', borderRadius:12 }}>
      {/* Nền vuốt */}
      {hint === 'co' && (
        <div style={{ position:'absolute', inset:0, background:'#D1FAE5', display:'flex', alignItems:'center', paddingLeft:16, borderRadius:12, zIndex:0 }}>
          <span style={{ fontSize:18, fontWeight:900, color:'#065F46' }}>✓ Có mặt</span>
        </div>
      )}
      {hint === 'vang' && (
        <div style={{ position:'absolute', inset:0, background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:16, borderRadius:12, zIndex:0 }}>
          <span style={{ fontSize:18, fontWeight:900, color:'#991B1B' }}>✗ Vắng</span>
        </div>
      )}

      {/* Card chính */}
      <div
        ref={cardRef}
        className="att-row"
        style={{
          transform: `translateX(${offset}px)`,
          transition: offset === 0 ? 'transform .2s ease' : 'none',
          background: bgColor,
          borderRadius:12, zIndex:1, position:'relative',
          touchAction:'pan-y', userSelect:'none',
        }}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
        onMouseDown={onStart}  onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
      >
        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,.5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'var(--sky-dd)', flexShrink:0 }}>
          {student.tenThanh?.charAt(0)||student.hoVaTen?.charAt(0)}
        </div>
        <div className="att-name" style={{ color: status ? txtColor : 'var(--text)' }}>
          {fullName(student)}
        </div>
        {/* Nút bấm nhanh */}
        <div style={{ display:'flex', gap:4 }}>
          {[
            { label:'Có mặt', sym:'✓', co:'att-co'   },
            { label:'Vắng',   sym:'✗', co:'att-vang' },
            { label:'Phép',   sym:'P',  co:'att-phep' },
          ].map(({ label, sym, co }) => (
            <button key={label}
              className={`att-btn ${status===label ? co : 'att-none'}`}
              onMouseDown={e => e.stopPropagation()}
              onTouchStart={e => e.stopPropagation()}
              onClick={() => onStatus(label)}>
              {sym}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Lịch sử vắng của 1 em ────────────────────────────
function AbsenceHistory({ student, attendance, classId, onClose }) {
  const records = attendance
    .filter(a => a.studentId === student.id && a.classId === classId && a.trangThai !== 'Có mặt')
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalSessions = [...new Set(
    attendance.filter(a => a.classId === classId).map(a => a.date)
  )].length

  const absentCount = attendance.filter(
    a => a.studentId === student.id && a.classId === classId && a.trangThai === 'Vắng'
  ).length

  const presentCount = attendance.filter(
    a => a.studentId === student.id && a.classId === classId && a.trangThai === 'Có mặt'
  ).length

  const rate = totalSessions ? Math.round(presentCount / totalSessions * 100) : 0

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <div className="modal-title">📊 {fullName(student)}</div>

        {/* Thống kê */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
          {[
            { label:'Chuyên cần', val:`${rate}%`,       bg:'#DBEAFE', color:'#1E40AF' },
            { label:'Vắng',       val:absentCount,       bg:'#FEE2E2', color:'#991B1B' },
            { label:'Phép',       val:records.filter(r=>r.trangThai==='Phép').length, bg:'#FEF3C7', color:'#92400E' },
          ].map(item => (
            <div key={item.label} style={{ background:item.bg, borderRadius:10, padding:'10px 6px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:900, color:item.color }}>{item.val}</div>
              <div style={{ fontSize:10, fontWeight:800, color:item.color }}>{item.label}</div>
            </div>
          ))}
        </div>

        {records.length === 0 ? (
          <div className="empty" style={{ padding:'20px' }}>
            <div className="empty-icon">🎉</div>
            <div className="empty-text">Chưa có buổi vắng / phép nào!</div>
          </div>
        ) : records.map(r => (
          <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 4px', borderBottom:'1px solid var(--lgray)' }}>
            <div style={{ fontWeight:700, fontSize:13, color:'var(--text)' }}>
              📅 {new Date(r.date).toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' })}
            </div>
            <span className={`badge ${r.trangThai==='Vắng'?'badge-red':'badge-amber'}`}>
              {r.trangThai}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Attendance({ user, students, attendance, onSave }) {
  const [date,    setDate]    = useState(today())
  const [classId, setClassId] = useState(user.role==='gly' ? user.classId : ALL_CLASSES[0].id)
  const [mode,    setMode]    = useState('diemdanh') // 'diemdanh' | 'lichsu'
  const [history, setHistory] = useState(null) // student đang xem lịch sử

  const myClasses     = user.role==='admin' ? ALL_CLASSES : ALL_CLASSES.filter(c=>c.id===user.classId)
  const classStudents = students.filter(s=>s.lopId===classId)

  const getStatus = (sid) =>
    attendance.find(a=>a.studentId===sid && a.date===date && a.classId===classId)?.trangThai || null

  const setStatus = (sid, status) => {
    const exists = attendance.find(a=>a.studentId===sid && a.date===date && a.classId===classId)
    const updated = exists
      ? attendance.map(a => a.studentId===sid && a.date===date && a.classId===classId ? {...a, trangThai:status} : a)
      : [...attendance, { id:uid(), studentId:sid, date, classId, trangThai:status }]
    onSave(updated)
  }

  const markAll = (status) => {
    const cleaned = attendance.filter(a=>!(a.date===date && a.classId===classId))
    onSave([...cleaned, ...classStudents.map(s=>({ id:uid(), studentId:s.id, date, classId, trangThai:status }))])
  }

  const counts = { co:0, vang:0, phep:0, chua:0 }
  classStudents.forEach(s => {
    const st = getStatus(s.id)
    if      (st==='Có mặt') counts.co++
    else if (st==='Vắng')   counts.vang++
    else if (st==='Phép')   counts.phep++
    else                    counts.chua++
  })

  const done = counts.chua === 0 && classStudents.length > 0

  return (
    <div className="content">
      <div className="sec-hd">
        <div className="sec-title">✅ Điểm Danh</div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${mode==='diemdanh'?'active':''}`} onClick={()=>setMode('diemdanh')}>📋 Điểm danh</button>
        <button className={`tab ${mode==='lichsu'?'active':''}`}   onClick={()=>setMode('lichsu')}>📊 Lịch sử vắng</button>
      </div>

      {/* ══ Tab Điểm danh ══ */}
      {mode === 'diemdanh' && (
        <>
          {/* Chọn ngày & lớp */}
          <div className="card" style={{ marginBottom:12 }}>
            <div className="form-group" style={{ marginBottom: user.role==='admin' ? 10 : 0 }}>
              <label className="form-label">Ngày điểm danh</label>
              <input className="form-input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
            </div>
            {user.role==='admin' && (
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Lớp</label>
                <select className="form-input" value={classId} onChange={e=>setClassId(e.target.value)}>
                  {myClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Tóm tắt */}
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            {[
              { count:counts.co,   label:'Có mặt', bg:'#D1FAE5', color:'#065F46' },
              { count:counts.vang, label:'Vắng',   bg:'#FEE2E2', color:'#991B1B' },
              { count:counts.phep, label:'Phép',   bg:'#FEF3C7', color:'#92400E' },
              { count:counts.chua, label:'Chưa',   bg:'#F1F5F9', color:'#64748B' },
            ].map(item=>(
              <div key={item.label} style={{ flex:1, background:item.bg, borderRadius:10, padding:'8px 4px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:900, color:item.color }}>{item.count}</div>
                <div style={{ fontSize:10, fontWeight:800, color:item.color }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Hoàn thành */}
          {done && (
            <div style={{ background:'#D1FAE5', borderRadius:12, padding:'10px 14px', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>✅</span>
              <span style={{ fontWeight:800, fontSize:13, color:'#065F46' }}>Đã điểm danh xong buổi này!</span>
            </div>
          )}

          {/* Nút điểm danh nhanh */}
          <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            <button className="btn btn-sm" style={{ flex:1, background:'#D1FAE5', color:'#065F46', border:'none' }} onClick={()=>markAll('Có mặt')}>✓ Có mặt hết</button>
            <button className="btn btn-sm" style={{ flex:1, background:'#FEE2E2', color:'#991B1B', border:'none' }} onClick={()=>markAll('Vắng')}>✗ Vắng hết</button>
          </div>

          {/* Gợi ý vuốt */}
          <div className="swipe-hint">👆 Bấm nút · 👈👉 Vuốt để điểm danh nhanh</div>

          {classStudents.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-text">Chưa có thiếu nhi trong lớp</div>
            </div>
          ) : classStudents.map(s => (
            <SwipeCard
              key={s.id}
              student={s}
              status={getStatus(s.id)}
              onStatus={status => setStatus(s.id, status)}
            />
          ))}
        </>
      )}

      {/* ══ Tab Lịch sử vắng ══ */}
      {mode === 'lichsu' && (
        <>
          {user.role==='admin' && (
            <div className="form-group">
              <label className="form-label">Lớp</label>
              <select className="form-input" value={classId} onChange={e=>setClassId(e.target.value)}>
                {myClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {classStudents.length === 0 ? (
            <div className="empty"><div className="empty-icon">📊</div><div className="empty-text">Chưa có thiếu nhi</div></div>
          ) : classStudents.map(s => {
            const absent = attendance.filter(a=>a.studentId===s.id && a.classId===classId && a.trangThai==='Vắng').length
            const phep   = attendance.filter(a=>a.studentId===s.id && a.classId===classId && a.trangThai==='Phép').length
            const total  = [...new Set(attendance.filter(a=>a.classId===classId).map(a=>a.date))].length
            const co     = attendance.filter(a=>a.studentId===s.id && a.classId===classId && a.trangThai==='Có mặt').length
            const rate   = total ? Math.round(co/total*100) : 0

            return (
              <div key={s.id} className="list-item" onClick={()=>setHistory(s)}>
                <div style={{ width:36, height:36, borderRadius:10, background:'var(--sky-ll)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:13, color:'var(--sky-dd)', flexShrink:0 }}>
                  {s.tenThanh?.charAt(0)||s.hoVaTen?.charAt(0)}
                </div>
                <div className="list-info">
                  <div className="list-name">{fullName(s)}</div>
                  <div className="list-sub">
                    Vắng: {absent} · Phép: {phep} · {total} buổi
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontWeight:900, fontSize:15, color: rate>=80?'var(--green)':rate>=60?'var(--amber)':'var(--red)' }}>
                    {rate}%
                  </div>
                  <div style={{ fontSize:9, color:'var(--gray)', fontWeight:700 }}>Chuyên cần</div>
                </div>
                <div style={{ color:'var(--gray)', fontSize:16 }}>›</div>
              </div>
            )
          })}
        </>
      )}

      {/* Modal lịch sử vắng */}
      {history && (
        <AbsenceHistory
          student={history}
          attendance={attendance}
          classId={classId}
          onClose={()=>setHistory(null)}
        />
      )}
    </div>
  )
}