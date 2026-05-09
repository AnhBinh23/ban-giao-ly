// ═══════════════════════════════════════════════════════
// pages/Students.jsx  —  Quản lý danh sách thiếu nhi
// ═══════════════════════════════════════════════════════
import { useState } from 'react'
import { ALL_CLASSES, PARISHES, getClass } from '../constants'
import { uid, fullName } from '../utils/helpers'
import { Icons } from '../components/Icons'

export default function Students({ user, students, onSave }) {
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [modal,   setModal]   = useState(null)   // null | 'add' | 'edit'
  const [form,    setForm]    = useState({})
  const [confirm, setConfirm] = useState(false)

  // Lớp mà user được phép thấy
  const myClasses = ALL_CLASSES.filter(c =>
    user.role === 'admin' || c.id === user.classId
  )

  // Lọc danh sách
  const filtered = students.filter(s => {
    const q   = search.toLowerCase()
    const hit = !q || fullName(s).toLowerCase().includes(q) || s.tenThanh?.toLowerCase().includes(q)
    const cls = filter === 'all' || s.lopId === filter
    return hit && cls
  })

  // Mở form thêm mới
  const openAdd = () => {
    setForm({ lopId: user.role === 'gly' ? user.classId : '', giaoXu: '' })
    setModal('add')
    setConfirm(false)
  }

  // Mở form chỉnh sửa
  const openEdit = (s) => {
    setForm({ ...s })
    setModal('edit')
    setConfirm(false)
  }

  // Lưu form
  const saveForm = () => {
    if (!form.hoVaTen || !form.lopId || !form.giaoXu) return
    const updated = modal === 'add'
      ? [...students, { ...form, id: uid() }]
      : students.map(s => s.id === form.id ? form : s)
    onSave(updated)
    setModal(null)
  }

  // Xóa thiếu nhi
  const deleteStudent = () => {
    onSave(students.filter(s => s.id !== form.id))
    setModal(null)
    setConfirm(false)
  }

  return (
    <div className="content">
      <div className="sec-hd">
        <div className="sec-title">👦 Thiếu Nhi</div>
        <span className="badge badge-blue">{filtered.length}</span>
      </div>

      {/* Tìm kiếm */}
      <div className="search-wrap">
        <span className="search-icon">{Icons.search}</span>
        <input
          className="search-input"
          placeholder="Tìm tên, tên thánh..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Lọc theo lớp */}
      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          Tất cả
        </button>
        {myClasses.map(c => (
          <button key={c.id} className={`tab ${filter === c.id ? 'active' : ''}`} onClick={() => setFilter(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Danh sách */}
      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👶</div>
          <div className="empty-text">Chưa có thiếu nhi nào</div>
        </div>
      ) : filtered.map(s => (
        <div key={s.id} className="list-item" onClick={() => openEdit(s)}>
          <div className="list-avatar">{s.tenThanh?.charAt(0) || s.hoVaTen?.charAt(0)}</div>
          <div className="list-info">
            <div className="list-name">{fullName(s)}</div>
            <div className="list-sub">{getClass(s.lopId)?.name} · GX {s.giaoXu}</div>
          </div>
          <span className="badge badge-blue">{s.lopId}</span>
        </div>
      ))}

      {/* Nút thêm mới */}
      <button className="fab" onClick={openAdd}>{Icons.plus}</button>

      {/* Modal thêm/sửa */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-handle"/>
            <div className="modal-title">
              {modal === 'add' ? '➕ Thêm thiếu nhi' : '✏️ Chỉnh sửa'}
            </div>

            <div className="form-group">
              <label className="form-label">Tên thánh</label>
              <input className="form-input" placeholder="Maria, Giuse..."
                value={form.tenThanh || ''}
                onChange={e => setForm({ ...form, tenThanh: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input className="form-input" placeholder="Nguyễn Thị An"
                value={form.hoVaTen || ''}
                onChange={e => setForm({ ...form, hoVaTen: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày sinh</label>
              <input className="form-input" type="date"
                value={form.ngaySinh || ''}
                onChange={e => setForm({ ...form, ngaySinh: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Giáo xứ *</label>
              <select className="form-input"
                value={form.giaoXu || ''}
                onChange={e => setForm({ ...form, giaoXu: e.target.value })}>
                <option value="">-- Chọn giáo xứ --</option>
                {PARISHES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lớp *</label>
              <select className="form-input"
                value={form.lopId || ''}
                disabled={user.role === 'gly'}
                onChange={e => setForm({ ...form, lopId: e.target.value })}>
                <option value="">-- Chọn lớp --</option>
                {myClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phụ huynh</label>
              <input className="form-input" placeholder="Tên phụ huynh"
                value={form.phuHuynh || ''}
                onChange={e => setForm({ ...form, phuHuynh: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" type="tel" placeholder="09xxxxxxxx"
                value={form.sdt || ''}
                onChange={e => setForm({ ...form, sdt: e.target.value })} />
            </div>

            <button className="btn btn-primary btn-full" style={{ marginBottom: 8 }} onClick={saveForm}>
              {modal === 'add' ? 'Thêm thiếu nhi' : 'Lưu thay đổi'}
            </button>

            {modal === 'edit' && (
              confirm ? (
                <div style={{ background: '#FEE2E2', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#991B1B', marginBottom: 8 }}>
                    Xác nhận xóa thiếu nhi này?
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setConfirm(false)}>Hủy</button>
                    <button className="btn btn-danger btn-sm"  style={{ flex: 1 }} onClick={deleteStudent}>Xóa</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-danger btn-full btn-sm" onClick={() => setConfirm(true)}>
                  🗑 Xóa thiếu nhi
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
