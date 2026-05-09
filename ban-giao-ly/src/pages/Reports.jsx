// ═══════════════════════════════════════════════════════
// pages/Reports.jsx  —  Báo cáo + Quản lý GLV (admin)
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { ALL_CLASSES } from '../constants'
import { uid } from '../utils/helpers'

export default function Reports({ user, students, attendance, glvs, onSaveGlvs }) {
  const [view, setView] = useState('class')  // 'class' | 'glv'

  // ── Thống kê theo lớp ───────────────────────────────
  const byClass = ALL_CLASSES
    .filter(c => user.role === 'admin' || c.id === user.classId)
    .map(c => {
      const att   = attendance.filter(a => a.classId === c.id)
      const total = att.length
      const co    = att.filter(a => a.trangThai === 'Có mặt').length
      return { ...c, count: students.filter(s => s.lopId === c.id).length, rate: total ? Math.round(co / total * 100) : 0 }
    })

  return (
    <div className="content">
      <div className="sec-hd">
        <div className="sec-title">📊 {user.role === 'admin' ? 'Quản lý' : 'Báo Cáo'}</div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${view === 'class' ? 'active' : ''}`} onClick={() => setView('class')}>
          Báo cáo lớp
        </button>
        {user.role === 'admin' && (
          <button className={`tab ${view === 'glv' ? 'active' : ''}`} onClick={() => setView('glv')}>
            👨‍🏫 Quản lý GLV
          </button>
        )}
      </div>

      {/* Báo cáo theo lớp */}
      {view === 'class' && byClass.map(c => (
        <div key={c.id} className="card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600 }}>{c.khoi}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: 'var(--sky-dd)' }}>{c.count}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray)' }}>Thiếu nhi</div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--gray)', marginBottom: 4 }}>
              <span>Chuyên cần</span>
              <span style={{ color: c.rate >= 80 ? 'var(--green)' : c.rate >= 60 ? 'var(--amber)' : 'var(--red)' }}>{c.rate}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--lgray)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${c.rate}%`, background: 'linear-gradient(90deg,var(--sky),var(--sky-d))', borderRadius: 4, transition: '.3s' }}/>
            </div>
          </div>
        </div>
      ))}

      {/* Quản lý GLV */}
      {view === 'glv' && user.role === 'admin' && (
        <GlvManager glvs={glvs} onSave={onSaveGlvs} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// GlvManager — Thêm / sửa / xóa tài khoản GLV
// ══════════════════════════════════════════════════════════
function GlvManager({ glvs, onSave }) {
  const [modal,   setModal]   = useState(null)   // null | 'add' | glv object
  const [form,    setForm]    = useState({})
  const [confirm, setConfirm] = useState(false)
  const [search,  setSearch]  = useState('')

  const filtered = glvs.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setForm({ name: '', email: '', password: '123456', classId: '', phone: '', role: 'gly' })
    setModal('add')
    setConfirm(false)
  }

  const openEdit = (g) => {
    setForm({ ...g })
    setModal('edit')
    setConfirm(false)
  }

  const saveForm = () => {
    if (!form.name || !form.email || !form.password || !form.classId) return
    // Kiểm tra email trùng khi thêm mới
    if (modal === 'add' && glvs.find(g => g.email === form.email)) return

    const updated = modal === 'add'
      ? [...glvs, { ...form, id: uid() }]
      : glvs.map(g => g.id === form.id ? form : g)
    onSave(updated)
    setModal(null)
  }

  const deleteGlv = () => {
    onSave(glvs.filter(g => g.id !== form.id))
    setModal(null)
    setConfirm(false)
  }

  const assignedClass = (classId) => ALL_CLASSES.find(c => c.id === classId)

  return (
    <>
      {/* Tổng số */}
      <div className="card card-blue" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{glvs.length}</div>
          <div style={{ fontSize: 12, opacity: .85, fontWeight: 700 }}>Giáo lý viên</div>
        </div>
        <div style={{ fontSize: 32 }}>👨‍🏫</div>
      </div>

      {/* Tìm kiếm */}
      <div className="search-wrap">
        <span className="search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input className="search-input" placeholder="Tìm tên, email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Danh sách GLV */}
      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👨‍🏫</div>
          <div className="empty-text">Chưa có giáo lý viên nào</div>
        </div>
      ) : filtered.map(g => (
        <div key={g.id} className="list-item" onClick={() => openEdit(g)}>
          <div className="list-avatar" style={{ background: '#EDE9FE', color: '#5B21B6' }}>
            {g.name.charAt(0)}
          </div>
          <div className="list-info">
            <div className="list-name">{g.name}</div>
            <div className="list-sub">{g.email}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            {g.classId
              ? <span className="badge badge-green">{assignedClass(g.classId)?.name || g.classId}</span>
              : <span className="badge badge-red">Chưa phân lớp</span>
            }
          </div>
        </div>
      ))}

      {/* Nút thêm */}
      <button className="fab" onClick={openAdd} style={{ bottom: 80 }}>+</button>

      {/* Modal thêm/sửa */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-handle"/>
            <div className="modal-title">
              {modal === 'add' ? '➕ Thêm giáo lý viên' : '✏️ Chỉnh sửa GLV'}
            </div>

            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input className="form-input" placeholder="Nguyễn Văn A"
                value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Email đăng nhập *</label>
              <input className="form-input" type="email" placeholder="gly@gmail.com"
                value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                disabled={modal === 'edit'} />
              {modal === 'edit' && <div className="hint">Email không thể thay đổi</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                {modal === 'add' ? 'Mật khẩu *' : 'Đặt lại mật khẩu'}
              </label>
              <input className="form-input" type="password" placeholder="Tối thiểu 6 ký tự"
                value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} />
              {modal === 'add' && <div className="hint">Mặc định: 123456</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" type="tel" placeholder="09xxxxxxxx"
                value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Phân công lớp *</label>
              <select className="form-input"
                value={form.classId || ''} onChange={e => setForm({ ...form, classId: e.target.value })}>
                <option value="">-- Chọn lớp phụ trách --</option>
                {ALL_CLASSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.khoi})</option>
                ))}
              </select>
            </div>

            {/* Thông tin tài khoản */}
            <div style={{ background: 'var(--sky-bg)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, fontWeight: 700, color: 'var(--sky-dd)' }}>
              ℹ️ GLV sẽ đăng nhập bằng email và mật khẩu trên
            </div>

            <button className="btn btn-primary btn-full" style={{ marginBottom: 8 }} onClick={saveForm}>
              {modal === 'add' ? '✅ Thêm GLV' : '💾 Lưu thay đổi'}
            </button>

            {modal === 'edit' && (
              confirm ? (
                <div style={{ background: '#FEE2E2', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#991B1B', marginBottom: 8 }}>
                    Xác nhận xóa GLV này?
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setConfirm(false)}>Hủy</button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={deleteGlv}>Xóa</button>
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
