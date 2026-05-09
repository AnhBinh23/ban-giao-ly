// ═══════════════════════════════════════════════════════
// pages/Attendance.jsx  —  Điểm danh từng buổi
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { ALL_CLASSES } from '../constants'
import { uid, today, fullName } from '../utils/helpers'

export default function Attendance({ user, students, attendance, onSave }) {
  const [date,    setDate]    = useState(today())
  const [classId, setClassId] = useState(user.role === 'gly' ? user.classId : ALL_CLASSES[0].id)

  const myClasses      = user.role === 'admin' ? ALL_CLASSES : ALL_CLASSES.filter(c => c.id === user.classId)
  const classStudents  = students.filter(s => s.lopId === classId)

  // Lấy trạng thái điểm danh của 1 học sinh
  const getStatus = (sid) => {
    const rec = attendance.find(a => a.studentId === sid && a.date === date && a.classId === classId)
    return rec?.trangThai || null
  }

  // Cập nhật trạng thái 1 học sinh
  const setStatus = (sid, status) => {
    const exists = attendance.find(a => a.studentId === sid && a.date === date && a.classId === classId)
    const updated = exists
      ? attendance.map(a =>
          a.studentId === sid && a.date === date && a.classId === classId
            ? { ...a, trangThai: status } : a
        )
      : [...attendance, { id: uid(), studentId: sid, date, classId, trangThai: status }]
    onSave(updated)
  }

  // Điểm danh tất cả cùng 1 trạng thái
  const markAll = (status) => {
    const cleaned = attendance.filter(a => !(a.date === date && a.classId === classId))
    const newRows  = classStudents.map(s => ({ id: uid(), studentId: s.id, date, classId, trangThai: status }))
    onSave([...cleaned, ...newRows])
  }

  // Đếm từng trạng thái
  const counts = { co: 0, vang: 0, phep: 0, chua: 0 }
  classStudents.forEach(s => {
    const st = getStatus(s.id)
    if      (st === 'Có mặt') counts.co++
    else if (st === 'Vắng')   counts.vang++
    else if (st === 'Phép')   counts.phep++
    else                       counts.chua++
  })

  return (
    <div className="content">
      <div className="sec-hd">
        <div className="sec-title">✅ Điểm Danh</div>
      </div>

      {/* Chọn ngày & lớp */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="form-group" style={{ marginBottom: 10 }}>
          <label className="form-label">Ngày điểm danh</label>
          <input className="form-input" type="date"
            value={date} onChange={e => setDate(e.target.value)} />
        </div>
        {user.role === 'admin' && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lớp</label>
            <select className="form-input" value={classId} onChange={e => setClassId(e.target.value)}>
              {myClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Tóm tắt số liệu */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { count: counts.co,   label: 'Có mặt', bg: '#D1FAE5', color: '#065F46' },
          { count: counts.vang, label: 'Vắng',   bg: '#FEE2E2', color: '#991B1B' },
          { count: counts.phep, label: 'Phép',   bg: '#FEF3C7', color: '#92400E' },
          { count: counts.chua, label: 'Chưa',   bg: '#F1F5F9', color: '#64748B' },
        ].map(item => (
          <div key={item.label} style={{ flex: 1, background: item.bg, borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.count}</div>
            <div style={{ fontSize: 10, fontWeight: 800, color: item.color }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Nút điểm danh nhanh */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button className="btn btn-sm" style={{ flex: 1, background: '#D1FAE5', color: '#065F46', border: 'none' }}
          onClick={() => markAll('Có mặt')}>✓ Có mặt hết</button>
        <button className="btn btn-sm" style={{ flex: 1, background: '#FEF3C7', color: '#92400E', border: 'none' }}
          onClick={() => markAll('Vắng')}>✗ Vắng hết</button>
      </div>

      {/* Danh sách điểm danh */}
      {classStudents.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <div className="empty-text">Chưa có thiếu nhi trong lớp này</div>
        </div>
      ) : classStudents.map(s => {
        const st = getStatus(s.id)
        return (
          <div key={s.id} className="att-row">
            <div className="list-avatar" style={{ width: 32, height: 32, fontSize: 12, borderRadius: 8 }}>
              {s.tenThanh?.charAt(0) || s.hoVaTen?.charAt(0)}
            </div>
            <div className="att-name">{fullName(s)}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { label: 'Có mặt', sym: '✓', cls: 'att-co'   },
                { label: 'Vắng',   sym: '✗', cls: 'att-vang' },
                { label: 'Phép',   sym: 'P',  cls: 'att-phep' },
              ].map(({ label, sym, cls }) => (
                <button key={label}
                  className={`att-btn ${st === label ? cls : 'att-none'}`}
                  onClick={() => setStatus(s.id, label)}>
                  {sym}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
