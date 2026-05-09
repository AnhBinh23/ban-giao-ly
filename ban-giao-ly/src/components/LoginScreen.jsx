// ═══════════════════════════════════════════════════════
// components/LoginScreen.jsx  —  Màn hình đăng nhập
// ═══════════════════════════════════════════════════════
import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!email || !pass) { setErr('Vui lòng nhập đầy đủ thông tin'); return }
    setLoading(true)
    const ok = await onLogin(email.trim().toLowerCase(), pass)
    if (!ok) setErr('Email hoặc mật khẩu không đúng')
    setLoading(false)
  }

  return (
    <div className="login-bg">
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>✝</div>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>Ban Giáo Lý</div>
        <div style={{ color: '#BAE6FD', fontSize: 12, fontWeight: 600, marginTop: 4 }}>
          GX Âm Sa · Đài Môn · Thuần Hậu
        </div>
      </div>

      {/* Form đăng nhập */}
      <div className="login-box">
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0369A1', marginBottom: 4 }}>
          Đăng nhập
        </div>
        <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 24 }}>
          Quản lý thiếu nhi giáo xứ
        </div>

        {/* Thông báo lỗi */}
        {err && <div className="alert alert-err">{err}</div>}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="email@bgl.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setErr('') }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu</label>
          <input
            className="form-input"
            type="password"
            placeholder="••••••"
            value={pass}
            onChange={e => { setPass(e.target.value); setErr('') }}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>


      </div>
    </div>
  )
}