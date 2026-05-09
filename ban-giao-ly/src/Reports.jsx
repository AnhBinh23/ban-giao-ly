// ═══════════════════════════════════════════════════════
// pages/Reports.jsx  —  Báo cáo + Quản lý GLV (admin)
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { ALL_CLASSES, KY_THI } from '../constants'
import { uid, calcAvg, xepLoai, fullName } from '../utils/helpers'
import { Icons } from '../components/Icons'

export default function Reports({ user, students, attendance, scores, glvs = [], onSaveGlvs }) {
  // GLV chỉ xem 'class' | admin xem thêm 'scores' và 'glv'
  const [view, setView] = useState('class')

  // ── Thống kê chuyên cần theo lớp ────────────────────
  const byClass = ALL_CLASSES
    .filter(c => user.role === 'admin' || c.id === user.classId)
    .map(c => {
      const att   = attendance.filter(a => a.classId === c.id)
      const total = att.length
      const co    = att.filter(a => a.trangThai === 'Có mặt').length
      const classStudents = students.filter(s => s.lopId === c.id)
      return {
        ...c,
        count: classStudents.length,
        rate: total ? Math.round(co / total * 100) : 0,
        totalSessions: [...new Set(att.map(a => a.date))].length,
      }
    })

  // ── Thống kê điểm theo lớp + kỳ ─────────────────────
  const ScoreReport = () => {
    const [ky, setKy] = useState(KY_THI[0])
    const [expand, setExpand] = useState(null)

    const classSummaries = ALL_CLASSES
      .filter(c => user.role === 'admin' || c.id === user.classId)
      .map(c => {
        const classStudents = students.filter(s => s.lopId === c.id)
        const classScores   = classStudents.map(s =>
          scores.find(sc => sc.studentId === s.id && sc.classId === c.id && sc.ky === ky)
        )
        const withScores = classScores.filter(Boolean)
        const avgs = withScores.map(sc => parseFloat(calcAvg(sc))).filter(v => !isNaN(v))
        const avg  = avgs.length ? (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(1) : null

        const dist = { xuat_sac:0, gioi:0, kha:0, yeu:0 }
        avgs.forEach(v => {
          if (v >= 9) dist.xuat_sac++
          else if (v >= 7) dist.gioi++
          else if (v >= 5) dist.kha++
          else dist.yeu++
        })
        return { ...c, count: classStudents.length, entered: withScores.length, avg, dist, students: classStudents }
      })

    return (
      <>
        <div className="tabs">
          {KY_THI.map(k => (
            <button key={k} className={`tab ${ky === k ? 'active' : ''}`} onClick={() => { setKy(k); setExpand(null) }}>
              {k}
            </button>
          ))}
        </div>

        {classSummaries.map(c => (
          <div key={c.id} className="card" style={{ marginBottom:10 }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: c.avg ? 10 : 0 }}
                 onClick={() => setExpand(expand === c.id ? null : c.id)}
                 role="button">
              <div>
                <div style={{ fontWeight:900, fontSize:15 }}>{c.name}</div>
                <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600 }}>
                  {c.entered}/{c.count} em đã nhập điểm
                </div>
              </div>
              <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                {c.avg ? (
                  <>
                    <div style={{ fontWeight:900, fontSize:22, color:'var(--sky-dd)' }}>{c.avg}</div>
                    <span className={`badge ${c.avg >= 9 ? 'badge-green' : c.avg >= 7 ? 'badge-blue' : c.avg >= 5 ? 'badge-amber' : 'badge-red'}`}>
                      TB lớp
                    </span>
                  </>
                ) : (
                  <span className="badge" style={{ background:'var(--lgray)', color:'var(--gray)' }}>Chưa có</span>
                )}
              </div>
            </div>

            {/* Phân bổ xếp loại */}
            {c.avg && (
              <div style={{ display:'flex', gap:6, marginBottom: expand === c.id ? 12 : 0 }}>
                {[
                  { label:'Xuất sắc', count: c.dist.xuat_sac, bg:'#D1FAE5', color:'#065F46' },
                  { label:'Giỏi',     count: c.dist.gioi,      bg:'#DBEAFE', color:'#1E40AF' },
                  { label:'Khá',      count: c.dist.kha,       bg:'#FEF3C7', color:'#92400E' },
                  { label:'Yếu',      count: c.dist.yeu,       bg:'#FEE2E2', color:'#991B1B' },
                ].map(item => item.count > 0 && (
                  <div key={item.label} style={{ flex:1, background:item.bg, borderRadius:8, padding:'5px 4px', textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:900, color:item.color }}>{item.count}</div>
                    <div style={{ fontSize:9,  fontWeight:800, color:item.color }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Chi tiết từng em — mở rộng */}
            {expand === c.id && c.students.length > 0 && (
              <div style={{ borderTop:'1.5px solid var(--lgray)', paddingTop:10 }}>
                {c.students.map(s => {
                  const sc  = scores.find(x => x.studentId === s.id && x.classId === c.id && x.ky === ky)
                  const avg = calcAvg(sc)
                  const xl  = xepLoai(avg)
                  return (
                    <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid var(--lgray)' }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{fullName(s)}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {avg ? (
                          <>
                            <span style={{ fontWeight:900, color:'var(--sky-dd)' }}>{avg}</span>
                            <span className={`badge badge-${xl.color === 'green' ? 'green' : xl.color === 'blue' ? 'blue' : xl.color === 'amber' ? 'amber' : 'red'}`}>
                              {xl.label}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize:12, color:'var(--gray)', fontWeight:600 }}>Chưa có</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {expand === c.id && c.students.length === 0 && (
              <div style={{ color:'var(--gray)', fontSize:13, fontWeight:600, textAlign:'center', padding:'8px 0' }}>
                Chưa có thiếu nhi trong lớp
              </div>
            )}
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="content">
      <div className="sec-hd">
        <div className="sec-title">📊 {user.role === 'admin' ? 'Quản lý' : 'Báo Cáo'}</div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${view === 'class' ? 'active' : ''}`} onClick={() => setView('class')}>
          📋 Chuyên cần
        </button>
        <button className={`tab ${view === 'scores' ? 'active' : ''}`} onClick={() => setView('scores')}>
          ⭐ Điểm số
        </button>
        {user.role === 'admin' && (
          <button className={`tab ${view === 'glv' ? 'active' : ''}`} onClick={() => setView('glv')}>
            👨‍🏫 GLV
          </button>
        )}
      </div>

      {/* === Tab 1: Chuyên cần === */}
      {view === 'class' && (
        <>
          {/* Tổng quan */}
          {user.role === 'admin' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div className="stat-card">
                <div className="stat-num">{students.length}</div>
                <div className="stat-lbl">Tổng thiếu nhi</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color:'var(--green)' }}>
                  {attendance.length
                    ? Math.round(attendance.filter(a=>a.trangThai==='Có mặt').length / attendance.length * 100)
                    : 0}%
                </div>
                <div className="stat-lbl">Chuyên cần TB</div>
              </div>
            </div>
          )}

          {byClass.map(c => (
            <div key={c.id} className="card" style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:900, fontSize:15 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600 }}>
                    {c.khoi} · {c.totalSessions} buổi
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:900, fontSize:20, color:'var(--sky-dd)' }}>{c.count}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--gray)' }}>Thiếu nhi</div>
                </div>
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700, color:'var(--gray)', marginBottom:4 }}>
                  <span>Chuyên cần</span>
                  <span style={{ color: c.rate >= 80 ? 'var(--green)' : c.rate >= 60 ? 'var(--amber)' : 'var(--red)' }}>
                    {c.rate}%
                  </span>
                </div>
                <div style={{ height:8, background:'var(--lgray)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${c.rate}%`, background:`linear-gradient(90deg,${c.rate>=80?'#10B981,#059669':c.rate>=60?'#F59E0B,#D97706':'#EF4444,#DC2626'})`, borderRadius:4, transition:'.3s' }}/>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* === Tab 2: Điểm số === */}
      {view === 'scores' && <ScoreReport />}

      {/* === Tab 3: Quản lý GLV (admin) === */}
      {view === 'glv' && user.role === 'admin' && (
        <GlvManager glvs={glvs} onSave={onSaveGlvs} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// GlvManager — Thêm / sửa / xóa tài khoản GLV
// ══════════════════════════════════════════════════════════
function GlvManager({ glvs = [], onSave }) {
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({})
  const [confirm, setConfirm] = useState(false)
  const [search,  setSearch]  = useState('')
  const [msg,     setMsg]     = useState(null)

  const filtered = glvs.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setForm({ name:'', email:'', password:'123456', classId:'', phone:'', role:'gly' })
    setModal('add'); setConfirm(false); setMsg(null)
  }

  const openEdit = (g) => {
    setForm({ ...g }); setModal('edit'); setConfirm(false); setMsg(null)
  }

  const saveForm = () => {
    if (!form.name || !form.email || !form.password || !form.classId) {
      setMsg({ type:'err', text:'Vui lòng điền đầy đủ thông tin bắt buộc (*)' }); return
    }
    if (modal === 'add' && glvs.find(g => g.email === form.email)) {
      setMsg({ type:'err', text:'Email này đã tồn tại' }); return
    }
    const updated = modal === 'add'
      ? [...glvs, { ...form, id: uid() }]
      : glvs.map(g => g.id === form.id ? form : g)
    onSave(updated)
    setModal(null)
  }

  const deleteGlv = () => {
    onSave(glvs.filter(g => g.id !== form.id))
    setModal(null); setConfirm(false)
  }

  const assignedClass = (classId) => ALL_CLASSES.find(c => c.id === classId)

  return (
    <>
      <div className="card card-blue" style={{ marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:28, fontWeight:900 }}>{glvs.length}</div>
          <div style={{ fontSize:12, opacity:.85, fontWeight:700 }}>Giáo lý viên</div>
        </div>
        <div style={{ fontSize:32 }}>👨‍🏫</div>
      </div>

      <div className="search-wrap">
        <span className="search-icon">{Icons.search}</span>
        <input className="search-input" placeholder="Tìm tên, email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👨‍🏫</div>
          <div className="empty-text">{search ? 'Không tìm thấy' : 'Chưa có giáo lý viên nào'}</div>
          {!search && <div style={{ fontSize:12, color:'var(--gray)', marginTop:6 }}>Nhấn + để thêm GLV mới</div>}
        </div>
      ) : filtered.map(g => (
        <div key={g.id} className="list-item" onClick={() => openEdit(g)}>
          <div className="list-avatar" style={{ background:'#EDE9FE', color:'#5B21B6' }}>
            {g.name.charAt(0)}
          </div>
          <div className="list-info">
            <div className="list-name">{g.name}</div>
            <div className="list-sub">{g.email} · {g.phone || 'Chưa có SĐT'}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
            {g.classId
              ? <span className="badge badge-green">{assignedClass(g.classId)?.name || g.classId}</span>
              : <span className="badge badge-red">Chưa phân lớp</span>
            }
          </div>
        </div>
      ))}

      <button className="fab" onClick={openAdd}>
        {Icons.plus}
      </button>

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-handle"/>
            <div className="modal-title">
              {modal === 'add' ? '➕ Thêm giáo lý viên' : '✏️ Chỉnh sửa GLV'}
            </div>

            {msg && <div className={`alert ${msg.type==='ok'?'alert-ok':'alert-err'}`}>{msg.text}</div>}

            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input className="form-input" placeholder="Nguyễn Văn A"
                value={form.name || ''} onChange={e => setForm({ ...form, name:e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Email đăng nhập *</label>
              <input className="form-input" type="email" placeholder="gly@gmail.com"
                value={form.email || ''} onChange={e => setForm({ ...form, email:e.target.value })}
                disabled={modal === 'edit'} />
              {modal === 'edit' && <div className="hint">Email không thể thay đổi</div>}
            </div>

            <div className="form-group">
              <label className="form-label">{modal === 'add' ? 'Mật khẩu *' : 'Đặt lại mật khẩu'}</label>
              <input className="form-input" type="password" placeholder="Tối thiểu 6 ký tự"
                value={form.password || ''} onChange={e => setForm({ ...form, password:e.target.value })} />
              {modal === 'add' && <div className="hint">Mặc định: 123456</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" type="tel" placeholder="09xxxxxxxx"
                value={form.phone || ''} onChange={e => setForm({ ...form, phone:e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Phân công lớp *</label>
              <select className="form-input"
                value={form.classId || ''} onChange={e => setForm({ ...form, classId:e.target.value })}>
                <option value="">-- Chọn lớp phụ trách --</option>
                {ALL_CLASSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.khoi})</option>
                ))}
              </select>
            </div>

            <div style={{ background:'var(--sky-bg)', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:12, fontWeight:700, color:'var(--sky-dd)' }}>
              ℹ️ GLV sẽ đăng nhập bằng email và mật khẩu trên
            </div>

            <button className="btn btn-primary btn-full" style={{ marginBottom:8 }} onClick={saveForm}>
              {modal === 'add' ? '✅ Thêm GLV' : '💾 Lưu thay đổi'}
            </button>

            {modal === 'edit' && (
              confirm ? (
                <div style={{ background:'#FEE2E2', borderRadius:10, padding:12, textAlign:'center' }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'#991B1B', marginBottom:8 }}>
                    Xác nhận xóa GLV này?
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-outline btn-sm" style={{ flex:1 }} onClick={() => setConfirm(false)}>Hủy</button>
                    <button className="btn btn-danger btn-sm"  style={{ flex:1 }} onClick={deleteGlv}>Xóa</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-danger btn-full btn-sm" onClick={() => setConfirm(true)}>
                  🗑 Xóa GLV
                </button>
              )
            )}
          </div>
        </div>
      )}
    </>
  )
}