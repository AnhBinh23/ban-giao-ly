// ═══════════════════════════════════════════════════════
// pages/Scores.jsx  —  Nhập và xem điểm theo kỳ thi
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { ALL_CLASSES, HOC_KY, KY_THI, getClass } from '../constants'
import { uid, calcAvg, xepLoai, fullName } from '../utils/helpers'

// ── Tính điểm trung bình cả năm (4 kỳ) ─────────────────
function calcYearAvg(studentId, classId, scores) {
  const allScores = KY_THI.map(ky =>
    scores.find(sc => sc.studentId === studentId && sc.classId === classId && sc.ky === ky)
  ).filter(Boolean)
  if (!allScores.length) return null
  const avgs = allScores.map(sc => parseFloat(calcAvg(sc))).filter(v => !isNaN(v))
  if (!avgs.length) return null
  return (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)
}

// ── Kiểm tra môn nào dưới 5 → thi lại ─────────────────
function checkThiLai(sc) {
  if (!sc) return []
  const monList = [
    { key: 'giaoLy',    label: 'Giáo Lý'    },
    { key: 'kinhThanh', label: 'Kinh Thánh' },
    { key: 'hanhKiem',  label: 'Hạnh Kiểm'  },
  ]
  return monList.filter(m => sc[m.key] !== '' && sc[m.key] !== undefined && Number(sc[m.key]) < 5)
}

export default function Scores({ user, students, scores, onSave }) {
  const [classId, setClassId] = useState(user.role === 'gly' ? user.classId : ALL_CLASSES[0].id)
  const [hocKy,   setHocKy]   = useState(0)           // 0 = HK I, 1 = HK II
  const [ky,      setKy]      = useState(HOC_KY[0].ky[0])
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({})

  const myClasses     = user.role === 'admin' ? ALL_CLASSES : ALL_CLASSES.filter(c => c.id === user.classId)
  const classStudents = students.filter(s => s.lopId === classId)

  const getScore = (sid) =>
    scores.find(sc => sc.studentId === sid && sc.classId === classId && sc.ky === ky)

  const openScore = (s) => {
    const existing = getScore(s.id) || {}
    setForm({ studentId: s.id, classId, ky, giaoLy: '', kinhThanh: '', hanhKiem: '', ...existing })
    setModal(s)
  }

  const saveScore = () => {
    const exists = scores.find(sc =>
      sc.studentId === form.studentId && sc.classId === form.classId && sc.ky === form.ky
    )
    const updated = exists
      ? scores.map(sc =>
          sc.studentId === form.studentId && sc.classId === form.classId && sc.ky === form.ky
            ? { ...form, id: sc.id } : sc
        )
      : [...scores, { ...form, id: uid() }]
    onSave(updated)
    setModal(null)
  }

  // Cảnh báo trong form khi nhập
  const formThiLai = checkThiLai(form)
  const formAvg    = calcAvg(form)
  const formThiLaiWarn = formThiLai.length > 0
  const formOLaiLop = (() => {
    // Tính trung bình cả năm preview (gộp điểm vừa nhập vào)
    const previewScores = scores.filter(sc =>
      !(sc.studentId === form.studentId && sc.classId === form.classId && sc.ky === form.ky)
    )
    previewScores.push({ ...form })
    return parseFloat(calcYearAvg(form.studentId, form.classId, previewScores)) < 5
  })()

  const badgeColor = { green:'badge-green', blue:'badge-blue', amber:'badge-amber', red:'badge-red' }

  return (
    <div className="content">
      <div className="sec-hd">
        <div className="sec-title">⭐ Điểm Thi</div>
      </div>

      {/* Chọn lớp (admin) */}
      {user.role === 'admin' && (
        <div className="form-group">
          <label className="form-label">Lớp</label>
          <select className="form-input" value={classId} onChange={e => setClassId(e.target.value)}>
            {myClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Tab Học kỳ */}
      <div className="tabs">
        {HOC_KY.map((hk, idx) => (
          <button key={hk.label}
            className={`tab ${hocKy === idx ? 'active' : ''}`}
            onClick={() => { setHocKy(idx); setKy(HOC_KY[idx].ky[0]) }}>
            {hk.label}
          </button>
        ))}
      </div>

      {/* Tab kỳ thi con (Giữa kỳ / Cuối kỳ) */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {HOC_KY[hocKy].ky.map(k => (
          <button key={k}
            onClick={() => setKy(k)}
            style={{
              flex:1, padding:'9px 12px', borderRadius:10, border:'none',
              fontFamily:'Nunito', fontWeight:800, fontSize:13, cursor:'pointer', transition:'.15s',
              background: ky === k ? 'var(--sky-dd)' : 'var(--sky-ll)',
              color:      ky === k ? '#fff'          : 'var(--sky-dd)',
            }}>
            {k}
          </button>
        ))}
      </div>

      {/* Danh sách điểm */}
      {classStudents.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📝</div>
          <div className="empty-text">Chưa có thiếu nhi trong lớp này</div>
        </div>
      ) : classStudents.map(s => {
        const sc      = getScore(s.id)
        const avg     = calcAvg(sc)
        const xl      = xepLoai(avg)
        const thiLai  = checkThiLai(sc)
        const yearAvg = calcYearAvg(s.id, classId, scores)
        const oLaiLop = yearAvg !== null && parseFloat(yearAvg) < 5

        return (
          <div key={s.id} className="score-card" onClick={() => openScore(s)}>
            {/* Tên & điểm TB */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: sc ? 8 : 0 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:14 }}>{fullName(s)}</div>
                <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600 }}>GX {s.giaoXu}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {avg ? (
                  <>
                    <div style={{ fontSize:20, fontWeight:900, color: parseFloat(avg)<5 ? 'var(--red)' : 'var(--sky-dd)' }}>{avg}</div>
                    <span className={`badge ${badgeColor[xl.color]}`}>{xl.label}</span>
                  </>
                ) : (
                  <span className="badge" style={{ background:'var(--lgray)', color:'var(--gray)' }}>Chưa có</span>
                )}
              </div>
            </div>

            {/* Chi tiết từng môn */}
            {sc && (
              <div style={{ display:'flex', gap:6, marginBottom: (thiLai.length > 0 || oLaiLop) ? 8 : 0 }}>
                {[
                  { label:'Giáo Lý',    val: sc.giaoLy    },
                  { label:'Kinh Thánh', val: sc.kinhThanh },
                  { label:'Hạnh Kiểm',  val: sc.hanhKiem  },
                ].map(({ label, val }) => (
                  <div key={label} style={{
                    flex:1, borderRadius:8, padding:'4px 8px', textAlign:'center',
                    background: val !== '' && val !== undefined && Number(val) < 5 ? '#FEE2E2' : 'var(--sky-bg)',
                  }}>
                    <div style={{ fontSize:10, color:'var(--gray)', fontWeight:700 }}>{label}</div>
                    <div style={{ fontWeight:900, color: val !== '' && val !== undefined && Number(val) < 5 ? 'var(--red)' : 'var(--sky-dd)' }}>
                      {val || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cảnh báo thi lại */}
            {thiLai.length > 0 && (
              <div style={{ background:'#FEF3C7', borderRadius:8, padding:'6px 10px', display:'flex', alignItems:'center', gap:6, marginBottom: oLaiLop ? 6 : 0 }}>
                <span style={{ fontSize:14 }}>⚠️</span>
                <span style={{ fontSize:12, fontWeight:800, color:'#92400E' }}>
                  Thi lại: {thiLai.map(m => m.label).join(', ')}
                </span>
              </div>
            )}

            {/* Cảnh báo ở lại lớp */}
            {oLaiLop && (
              <div style={{ background:'#FEE2E2', borderRadius:8, padding:'6px 10px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:14 }}>🚨</span>
                <span style={{ fontSize:12, fontWeight:800, color:'#991B1B' }}>
                  Ở lại lớp — ĐTB cả năm: {yearAvg}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Modal nhập điểm */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-handle"/>
            <div className="modal-title">📝 Nhập điểm — {fullName(modal)}</div>

            {/* Info lớp + kỳ */}
            <div style={{ background:'var(--sky-bg)', borderRadius:10, padding:'8px 12px', marginBottom:14, fontSize:12, fontWeight:700, color:'var(--sky-dd)' }}>
              {getClass(classId)?.name} · {ky}
            </div>

            {/* Input điểm */}
            {[
              { key:'giaoLy',    label:'Giáo Lý'    },
              { key:'kinhThanh', label:'Kinh Thánh' },
              { key:'hanhKiem',  label:'Hạnh Kiểm'  },
            ].map(({ key, label }) => {
              const val    = form[key]
              const isDuoi5 = val !== '' && val !== undefined && Number(val) < 5
              return (
                <div className="form-group" key={key}>
                  <label className="form-label" style={{ color: isDuoi5 ? 'var(--red)' : undefined }}>
                    {label} {isDuoi5 && <span style={{ fontWeight:900 }}>— Thi lại ⚠️</span>}
                  </label>
                  <input
                    className="form-input"
                    type="number" min="0" max="10" step="0.5"
                    placeholder="0 – 10"
                    value={val || ''}
                    style={{ borderColor: isDuoi5 ? 'var(--red)' : undefined }}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              )
            })}

            {/* Cảnh báo thi lại trong modal */}
            {formThiLaiWarn && (
              <div style={{ background:'#FEF3C7', borderRadius:10, padding:'10px 14px', marginBottom:10, display:'flex', gap:8 }}>
                <span style={{ fontSize:18 }}>⚠️</span>
                <div>
                  <div style={{ fontWeight:900, fontSize:13, color:'#92400E' }}>Cần thi lại!</div>
                  <div style={{ fontSize:12, color:'#92400E', fontWeight:700 }}>
                    Môn dưới 5 điểm: {formThiLai.map(m => m.label).join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Cảnh báo ở lại lớp trong modal */}
            {formAvg && parseFloat(calcYearAvg(form.studentId, form.classId, [
              ...scores.filter(sc => !(sc.studentId === form.studentId && sc.classId === form.classId && sc.ky === form.ky)),
              form
            ])) < 5 && (
              <div style={{ background:'#FEE2E2', borderRadius:10, padding:'10px 14px', marginBottom:10, display:'flex', gap:8 }}>
                <span style={{ fontSize:18 }}>🚨</span>
                <div>
                  <div style={{ fontWeight:900, fontSize:13, color:'#991B1B' }}>Nguy cơ ở lại lớp!</div>
                  <div style={{ fontSize:12, color:'#991B1B', fontWeight:700 }}>
                    ĐTB cả năm hiện tại dưới 5 điểm
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={saveScore}>💾 Lưu điểm</button>
          </div>
        </div>
      )}
    </div>
  )
}