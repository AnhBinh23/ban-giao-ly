// ═══════════════════════════════════════════════════════
// App.jsx  —  Component gốc, quản lý toàn bộ trạng thái
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import { MOCK_USERS, SAMPLE_STUDENTS, ALL_CLASSES, getClass } from './constants'
import { saveData, loadData, KEYS }     from './utils/storage'
import { Icons }                        from './components/Icons'
import LoginScreen                      from './components/LoginScreen'
import Dashboard                        from './pages/Dashboard'
import Students                         from './pages/Students'
import Attendance                       from './pages/Attendance'
import Scores                           from './pages/Scores'
import Reports                          from './pages/Reports'

function UserMenuContent({ user, glvs, saveGlvs, onUpdateUser, onLogout }) {
  const [tab,      setTab]     = useState('info')
  const [form,     setForm]    = useState({ name: user.name, phone: user.phone || '', gioiThieu: user.gioiThieu || '' })
  const [passForm, setPassForm]= useState({ old: '', new1: '', new2: '' })
  const [msg,      setMsg]     = useState(null)

  const saveInfo = () => {
    if (!form.name) { setMsg({ type:'err', text:'Vui lòng nhập họ tên' }); return }
    onUpdateUser({ ...user, ...form })
    setMsg({ type:'ok', text:'Đã lưu thông tin thành công!' })
    setTimeout(() => { setMsg(null); setTab('info') }, 1500)
  }

  const savePass = () => {
    if (passForm.old !== user.password)  { setMsg({ type:'err', text:'Mật khẩu cũ không đúng' }); return }
    if (passForm.new1.length < 6)        { setMsg({ type:'err', text:'Mật khẩu mới phải từ 6 ký tự' }); return }
    if (passForm.new1 !== passForm.new2) { setMsg({ type:'err', text:'Mật khẩu mới không khớp' }); return }
    onUpdateUser({ ...user, password: passForm.new1 })
    setMsg({ type:'ok', text:'Đổi mật khẩu thành công!' })
    setPassForm({ old:'', new1:'', new2:'' })
    setTimeout(() => setMsg(null), 2000)
  }

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'var(--sky-ll)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'var(--sky-dd)', flexShrink:0 }}>
          {user.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight:900, fontSize:17 }}>{user.name}</div>
          <div style={{ fontSize:12, color:'var(--gray)', fontWeight:600, marginBottom:4 }}>{user.email}</div>
          <span className={`badge ${user.role==='admin'?'badge-blue':'badge-green'}`}>
            {user.role==='admin' ? '👑 Admin tổng' : '📚 Giáo lý viên'}
          </span>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:16 }}>
        <button className={`tab ${tab==='info'?'active':''}`} onClick={() => { setTab('info'); setMsg(null) }}>Hồ sơ</button>
        <button className={`tab ${tab==='edit'?'active':''}`} onClick={() => { setTab('edit'); setMsg(null) }}>Chỉnh sửa</button>
        <button className={`tab ${tab==='pass'?'active':''}`} onClick={() => { setTab('pass'); setMsg(null) }}>Đổi mật khẩu</button>
      </div>

      {msg && <div className={`alert ${msg.type==='ok'?'alert-ok':'alert-err'}`}>{msg.text}</div>}

      {tab==='info' && (
        <>
          {user.role==='gly' && (
            <div style={{ background:'var(--sky-bg)', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Phân công</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--sky-dd)' }}>
                📋 Lớp: {getClass(user.classId)?.name}
              </div>
            </div>
          )}
          <div style={{ background:'#F8FAFC', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:10 }}>Thông tin cá nhân</div>
            {[
              { label:'Họ tên',        val: user.name },
              { label:'Email',         val: user.email },
              { label:'Số điện thoại', val: user.phone || '—' },
              { label:'Giới thiệu',    val: user.gioiThieu || '—' },
            ].map(({ label, val }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, marginBottom:8, gap:8 }}>
                <span style={{ color:'var(--gray)', flexShrink:0 }}>{label}</span>
                <span style={{ fontWeight:700, textAlign:'right' }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ background:'#F8FAFC', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:10 }}>Thông tin app</div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, marginBottom:4 }}>
              <span style={{ color:'var(--gray)' }}>Giáo xứ</span>
              <span style={{ fontWeight:700 }}>Âm Sa · Đài Môn · Thuần Hậu</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600 }}>
              <span style={{ color:'var(--gray)' }}>Phiên bản</span>
              <span style={{ fontWeight:700 }}>1.1.0</span>
            </div>
          </div>
          <div className="divider"/>
          <button className="btn btn-outline btn-full" style={{ marginBottom:10 }} onClick={onLogout}>
            🔄 Đăng nhập tài khoản khác
          </button>
          <button className="btn btn-danger btn-full" onClick={onLogout}>
            🚪 Đăng xuất
          </button>
        </>
      )}

      {tab==='edit' && (
        <>
          <div className="form-group">
            <label className="form-label">Họ và tên *</label>
            <input className="form-input" placeholder="Nguyễn Văn A"
              value={form.name} onChange={e => setForm({ ...form, name:e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input className="form-input" type="tel" placeholder="09xxxxxxxx"
              value={form.phone} onChange={e => setForm({ ...form, phone:e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Giới thiệu bản thân</label>
            <input className="form-input" placeholder="GLV lớp Khai Tâm, GX Âm Sa..."
              value={form.gioiThieu} onChange={e => setForm({ ...form, gioiThieu:e.target.value })} />
          </div>
          <button className="btn btn-primary btn-full" onClick={saveInfo}>💾 Lưu thông tin</button>
        </>
      )}

      {tab==='pass' && (
        <>
          <div className="form-group">
            <label className="form-label">Mật khẩu hiện tại</label>
            <input className="form-input" type="password" placeholder="••••••"
              value={passForm.old} onChange={e => setPassForm({ ...passForm, old:e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu mới</label>
            <input className="form-input" type="password" placeholder="Tối thiểu 6 ký tự"
              value={passForm.new1} onChange={e => setPassForm({ ...passForm, new1:e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu mới</label>
            <input className="form-input" type="password" placeholder="Nhập lại mật khẩu mới"
              value={passForm.new2} onChange={e => setPassForm({ ...passForm, new2:e.target.value })} />
          </div>
          <button className="btn btn-primary btn-full" onClick={savePass}>🔐 Đổi mật khẩu</button>
        </>
      )}
    </>
  )
}

const PAGES = [
  { id: 'home',       label: 'Trang chủ', icon: Icons.home  },
  { id: 'students',   label: 'Thiếu nhi', icon: Icons.users },
  { id: 'attendance', label: 'Điểm danh', icon: Icons.check },
  { id: 'scores',     label: 'Điểm thi',  icon: Icons.star  },
  { id: 'reports',    label: 'Quản lý',   icon: Icons.chart },
]

export default function App() {
  const [user,       setUser]       = useState(null)
  const [students,   setStudents]   = useState(SAMPLE_STUDENTS)
  const [attendance, setAttendance] = useState([])
  const [scores,     setScores]     = useState([])
  const [glvs,       setGlvs]       = useState([])   // ← state GLV
  const [page,       setPage]       = useState('home')
  const [userMenu,   setUserMenu]   = useState(false)
  const [ready,      setReady]      = useState(false)

  useEffect(() => {
    const u  = loadData(KEYS.user)
    const s  = loadData(KEYS.students,   SAMPLE_STUDENTS)
    const a  = loadData(KEYS.attendance, [])
    const sc = loadData(KEYS.scores,     [])
    const g  = loadData(KEYS.glvs,       [])
    if (u) setUser(u)
    setStudents(s)
    setAttendance(a)
    setScores(sc)
    setGlvs(g)
    setReady(true)
  }, [])

  // ── Đăng nhập — kiểm tra admin mặc định + GLV động ──
  const handleLogin = (email, password) => {
    // 1. Admin & tài khoản mặc định
    const hardcoded = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (hardcoded) {
      setUser(hardcoded); saveData(KEYS.user, hardcoded); return true
    }
    // 2. GLV được thêm qua quản lý
    const currentGlvs = loadData(KEYS.glvs, [])
    const foundGlv = currentGlvs.find(g => g.email === email && g.password === password)
    if (foundGlv) {
      setUser(foundGlv); saveData(KEYS.user, foundGlv); return true
    }
    return false
  }

  const handleLogout = () => {
    setUser(null); saveData(KEYS.user, null)
    setUserMenu(false); setPage('home')
  }

  const saveStudents   = (d) => { setStudents(d);   saveData(KEYS.students,   d) }
  const saveAttendance = (d) => { setAttendance(d); saveData(KEYS.attendance, d) }
  const saveScores     = (d) => { setScores(d);     saveData(KEYS.scores,     d) }
  const saveGlvs       = (d) => { setGlvs(d);       saveData(KEYS.glvs,       d) }

  const visibleStudents = user?.role === 'admin'
    ? students
    : students.filter(s => s.lopId === user?.classId)

  if (!ready) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0369A1,#0EA5E9)' }}>
      <div style={{ color:'#fff', fontFamily:'Nunito', fontWeight:800, fontSize:18 }}>✝ Đang tải...</div>
    </div>
  )

  if (!user) return <LoginScreen onLogin={handleLogin} />

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <div className="topbar-title">✝ Ban Giáo Lý</div>
          <div className="topbar-sub">GX Âm Sa · Đài Môn · Thuần Hậu</div>
        </div>
        <div className="avatar" onClick={() => setUserMenu(true)}>
          {user.name.charAt(0)}
        </div>
      </div>

      {page === 'home'       && <Dashboard   user={user} students={visibleStudents} attendance={attendance} scores={scores} />}
      {page === 'students'   && <Students    user={user} students={visibleStudents} onSave={saveStudents} />}
      {page === 'attendance' && <Attendance  user={user} students={visibleStudents} attendance={attendance} onSave={saveAttendance} />}
      {page === 'scores'     && <Scores      user={user} students={visibleStudents} scores={scores} onSave={saveScores} />}
      {page === 'reports'    && <Reports
                                  user={user}
                                  students={students}
                                  attendance={attendance}
                                  scores={scores}
                                  glvs={glvs}
                                  onSaveGlvs={saveGlvs}
                                />}

      <nav className="bnav">
        {PAGES.map(p => (
          <button key={p.id} className={`bnav-btn ${page === p.id ? 'active' : ''}`} onClick={() => setPage(p.id)}>
            {p.icon}
            {p.label}
          </button>
        ))}
      </nav>

      {userMenu && (
        <div className="overlay" onClick={() => setUserMenu(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle"/>
            <UserMenuContent
              user={user}
              glvs={glvs}
              saveGlvs={saveGlvs}
              onUpdateUser={(updated) => {
                setUser(updated)
                saveData(KEYS.user, updated)
                if (updated.role === 'gly') {
                  const newGlvs = glvs.map(g => g.id === updated.id ? updated : g)
                  saveGlvs(newGlvs)
                }
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  )
}