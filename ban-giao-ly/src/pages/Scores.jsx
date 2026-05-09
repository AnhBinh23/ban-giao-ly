// ═══════════════════════════════════════════════════════
// pages/Scores.jsx  —  Nhập và xem điểm theo kỳ thi
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { ALL_CLASSES, KY_THI, getClass } from '../constants'
import { uid, calcAvg, xepLoai, fullName } from '../utils/helpers'

export default function Scores({ user, students, scores, onSave }) {
  const [classId, setClassId] = useState(user.role === 'gly' ? user.classId : ALL_CLASSES[0].id)
  const [ky,      setKy]      = useState(KY_THI[0])
  const [modal,   setModal]   = useState(null)   // null | student object
  const [form,    setForm]    = useState({})

  const myClasses     = user.role === 'admin' ? ALL_CLASSES : ALL_CLASSES.filter(c => c.id === user.classId)
  const classStudents = students.filter(s => s.lopId === classId)

  // Lấy điểm của 1 học sinh trong kỳ hiện tại
  const getScore = (sid) =>
    scores.find(sc => sc.studentId === sid && sc.classId === classId && sc.ky === ky)

  // Mở form nhập điểm
  const openScore = (s) => {
    const existing = getScore(s.id) || {}
    setForm({ studentId: s.id, classId, ky, giaoLy: '', kinhThanh: '', hanhKiem: '', ...existing })
    setModal(s)
  }

  // Lưu điểm
  const saveScore = () => {
    const exists = scores.find(sc => sc.studentId === form.studentId && sc.classId === form.classId && sc.ky === form.ky)
    const updated = exists
      ? scores.map(sc =>
          sc.studentId === form.studentId && sc.classId === form.classId && sc.ky === form.ky
            ? { ...form, id: sc.id } : sc
        )
      : [...scores, { ...form, id: uid() }]
    onSave(updated)
    setModal(null)
  }

  // Map màu xếp loại
  const badgeColor = { green: 'badge-green', blue: 'badge-blue', amber: 'badge-amber', red: 'badge-red' }

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

      {/* Chọn kỳ thi */}
      <div className="tabs">
        {KY_THI.map(k => (
          <button key={k} className={`tab ${ky === k ? 'active' : ''}`} onClick={() => setKy(k)}>
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
        const sc  = getScore(s.id)
        const avg = calcAvg(sc)
        const xl  = xepLoai(avg)
        return (
          <div key={s.id} className="score-card" onClick={() => openScore(s)}>
            {/* Tên & điểm TB */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{fullName(s)}</div>
                <div style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600 }}>GX {s.giaoXu}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {avg
                  ? <>
                      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--sky-dd)' }}>{avg}</div>
                      <span className={`badge ${badgeColor[xl.color]}`}>{xl.label}</span>
                    </>
                  : <span className="badge" style={{ background: 'var(--lgray)', color: 'var(--gray)' }}>Chưa có</span>
                }
              </div>
            </div>

            {/* Chi tiết từng môn */}
            {sc && (
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Giáo Lý',   val: sc.giaoLy    },
                  { label: 'Kinh Thánh', val: sc.kinhThanh },
                  { label: 'Hạnh Kiểm', val: sc.hanhKiem  },
                ].map(({ label, val }) => (
                  <div key={label} style={{ flex: 1, background: 'var(--sky-bg)', borderRadius: 8, padding: '4px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--gray)', fontWeight: 700 }}>{label}</div>
                    <div style={{ fontWeight: 900, color: 'var(--sky-dd)' }}>{val || '-'}</div>
                  </div>
                ))}
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
            <div style={{ background: 'var(--sky-bg)', borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 12, fontWeight: 700, color: 'var(--sky-dd)' }}>
              {getClass(classId)?.name} · {ky}
            </div>
            {[
              { key: 'giaoLy',    label: 'Giáo Lý'    },
              { key: 'kinhThanh', label: 'Kinh Thánh' },
              { key: 'hanhKiem',  label: 'Hạnh Kiểm'  },
            ].map(({ key, label }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" type="number" min="0" max="10" step="0.5" placeholder="0 – 10"
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <button className="btn btn-primary btn-full" onClick={saveScore}>Lưu điểm</button>
          </div>
        </div>
      )}
    </div>
  )
}
