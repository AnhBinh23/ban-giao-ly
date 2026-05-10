import { useState, useEffect, useRef } from 'react'
import { MOCK_USERS, SAMPLE_STUDENTS, ALL_CLASSES, getClass } from './constants'
import { saveData, loadData, KEYS } from './utils/storage'
import { Icons } from './components/Icons'
import LoginScreen from './components/LoginScreen'
import Dashboard   from './pages/Dashboard'
import Students    from './pages/Students'
import Attendance  from './pages/Attendance'
import Scores      from './pages/Scores'
import Reports     from './pages/Reports'

// ── Splash Screen ────────────────────────────────────
function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash-logo">✝</div>
      <div className="splash-title">Ban Giáo Lý</div>
      <div className="splash-sub">GX Âm Sa · Đài Môn · Thuần Hậu</div>
      <div className="splash-dots">
        <div className="splash-dot"/>
        <div className="splash-dot"/>
        <div className="splash-dot"/>
      </div>
    </div>
  )
}

// ── User Menu ─────────────────────────────────────────
function UserMenuContent({ user, glvs, saveGlvs, onUpdateUser, onLogout }) {
  const [tab,      setTab]     = useState('info')
  const [form,     setForm]    = useState({ name: user.name, phone: user.phone || '', gioiThieu: user.gioiThieu || '' })
  const [passForm, setPassForm]= useState({ old: '', new1: '', new2: '' })
  const [msg,      setMsg]     = useState(null)

  const saveInfo = () => {
    if (!form.name) { setMsg({ type:'err', text:'Vui lòng nhập họ tên' }); return }
    onUpdateUser({ ...user, ...form })
    setMsg({ type:'ok', text:'Đã lưu thành công!' })
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
          <div style={{ fontWeight:900, fontSize:17, color:'var(--text)' }}>{user.name}</div>
          <div style={{ fontSize:12, color:'var(--gray)', fontWeight:600, marginBottom:4 }}>{user.email}</div>
          <span className={`badge ${user.role==='admin'?'badge-blue':'badge-green'}`}>
            {user.role==='admin' ? '👑 Admin tổng' : '📚 Giáo lý viên'}
          </span>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:16 }}>
        {['info','edit','pass'].map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => { setTab(t); setMsg(null) }}>
            {t==='info'?'Hồ sơ':t==='edit'?'Chỉnh sửa':'Đổi MK'}
          </button>
        ))}
      </div>

      {msg && <div className={`alert ${msg.type==='ok'?'alert-ok':'alert-err'}`}>{msg.text}</div>}

      {tab==='info' && (
        <>
          {user.role==='gly' && (
            <div style={{ background:'var(--sky-bg)', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>Phân công</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--sky-dd)' }}>📋 {getClass(user.classId)?.name}</div>
            </div>
          )}
          <div style={{ background:'var(--bg)', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
            {[['Họ tên',user.name],['Email',user.email],['Điện thoại',user.phone||'—'],['Giới thiệu',user.gioiThieu||'—']].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, marginBottom:8, gap:8 }}>
                <span style={{ color:'var(--gray)', flexShrink:0 }}>{l}</span>
                <span style={{ fontWeight:700, textAlign:'right', color:'var(--text)' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="divider"/>
          <button className="btn btn-danger btn-full" onClick={onLogout}>🚪 Đăng xuất</button>
        </>
      )}
      {tab==='edit' && (
        <>
          {[['name','Họ và tên *','Nguyễn Văn A','text'],['phone','Điện thoại','09xxxxxxxx','tel'],['gioiThieu','Giới thiệu','GLV lớp...','text']].map(([k,l,ph,t])=>(
            <div className="form-group" key={k}>
              <label className="form-label">{l}</label>
              <input className="form-input" type={t} placeholder={ph} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>
            </div>
          ))}
          <button className="btn btn-primary btn-full" onClick={saveInfo}>💾 Lưu thông tin</button>
        </>
      )}
      {tab==='pass' && (
        <>
          {[['old','Mật khẩu hiện tại'],['new1','Mật khẩu mới'],['new2','Xác nhận mật khẩu mới']].map(([k,l])=>(
            <div className="form-group" key={k}>
              <label className="form-label">{l}</label>
              <input className="form-input" type="password" placeholder="••••••" value={passForm[k]} onChange={e=>setPassForm({...passForm,[k]:e.target.value})}/>
            </div>
          ))}
          <button className="btn btn-primary btn-full" onClick={savePass}>🔐 Đổi mật khẩu</button>
        </>
      )}
    </>
  )
}

// ── Notification Panel ────────────────────────────────
function NotifPanel({ notifs, user, onSave, onClose }) {
  const myNotifs = notifs.filter(n => n.to === 'all' || n.to === user.role || n.to === user.id)
  const unread   = myNotifs.filter(n => !n.readBy?.includes(user.id))

  const markRead = (id) => {
    const updated = notifs.map(n =>
      n.id === id ? { ...n, readBy: [...(n.readBy||[]), user.id] } : n
    )
    onSave(updated)
  }
  const markAll = () => {
    const updated = notifs.map(n =>
      (n.to==='all'||n.to===user.role||n.to===user.id)
        ? { ...n, readBy: [...new Set([...(n.readBy||[]), user.id])] }
        : n
    )
    onSave(updated)
  }

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', body:'', icon:'📢', to:'all' })

  const addNotif = () => {
    if (!form.title || !form.body) return
    const newN = { id: Date.now()+'', ...form, time: new Date().toISOString(), readBy:[], from: user.id }
    onSave([newN, ...notifs])
    setForm({ title:'', body:'', icon:'📢', to:'all' }); setShowForm(false)
  }

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div className="modal-title" style={{ marginBottom:0 }}>🔔 Thông báo</div>
          <div style={{ display:'flex', gap:8 }}>
            {unread.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={markAll}>Đọc tất cả</button>
            )}
            {user.role === 'admin' && (
              <button className="btn btn-sm btn-primary" onClick={() => setShowForm(!showForm)}>+ Thêm</button>
            )}
          </div>
        </div>

        {/* Form thêm thông báo (admin) */}
        {showForm && (
          <div style={{ background:'var(--sky-bg)', borderRadius:12, padding:14, marginBottom:14 }}>
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['📢','⛪','📅','⚠️','✅','🎉','📝','🙏'].map(ic=>(
                  <button key={ic} onClick={()=>setForm({...form,icon:ic})}
                    style={{ fontSize:20, padding:'4px 8px', borderRadius:8, border:'2px solid', borderColor: form.icon===ic?'var(--sky)':'var(--lgray)', background:'var(--card-bg)', cursor:'pointer' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tiêu đề</label>
              <input className="form-input" placeholder="Tiêu đề thông báo" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung</label>
              <input className="form-input" placeholder="Nội dung..." value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Gửi đến</label>
              <select className="form-input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}>
                <option value="all">Tất cả</option>
                <option value="gly">Giáo lý viên</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={addNotif}>📢 Gửi thông báo</button>
          </div>
        )}

        {myNotifs.length === 0 ? (
          <div className="empty"><div className="empty-icon">🔔</div><div className="empty-text">Chưa có thông báo</div></div>
        ) : myNotifs.map(n => {
          const isUnread = !n.readBy?.includes(user.id)
          return (
            <div key={n.id} className={`notif-item ${isUnread?'unread':''}`} onClick={() => markRead(n.id)}>
              <div className="notif-icon">{n.icon}</div>
              <div style={{ flex:1 }}>
                <div className="notif-title">{n.title} {isUnread && <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--sky)', display:'inline-block', marginLeft:4 }}/>}</div>
                <div className="notif-body">{n.body}</div>
                <div className="notif-time">{new Date(n.time).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const PAGES = [
  { id:'home',       label:'Trang chủ', icon:Icons.home  },
  { id:'students',   label:'Thiếu nhi', icon:Icons.users },
  { id:'attendance', label:'Điểm danh', icon:Icons.check },
  { id:'scores',     label:'Điểm thi',  icon:Icons.star  },
  { id:'reports',    label:'Quản lý',   icon:Icons.chart },
]

export default function App() {
  const [user,       setUser]       = useState(null)
  const [students,   setStudents]   = useState(SAMPLE_STUDENTS)
  const [attendance, setAttendance] = useState([])
  const [scores,     setScores]     = useState([])
  const [glvs,       setGlvs]       = useState([])
  const [notifs,     setNotifs]     = useState([])
  const [page,       setPage]       = useState('home')
  const [userMenu,   setUserMenu]   = useState(false)
  const [showNotif,  setShowNotif]  = useState(false)
  const [theme,      setTheme]      = useState('light')
  const [splash,     setSplash]     = useState(true)
  const [ready,      setReady]      = useState(false)

  // Splash 2.5s
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2500)
    return () => clearTimeout(t)
  }, [])

  // Load dữ liệu
  useEffect(() => {
    const u  = loadData(KEYS.user)
    const s  = loadData(KEYS.students,   SAMPLE_STUDENTS)
    const a  = loadData(KEYS.attendance, [])
    const sc = loadData(KEYS.scores,     [])
    const g  = loadData(KEYS.glvs,       [])
    const n  = loadData(KEYS.notifs,     [])
    const th = loadData(KEYS.theme,      'light')
    if (u)  setUser(u)
    setStudents(s); setAttendance(a); setScores(sc); setGlvs(g); setNotifs(n)
    setTheme(th)
    document.documentElement.setAttribute('data-theme', th)
    setReady(true)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    saveData(KEYS.theme, next)
  }

  const handleLogin = (email, password) => {
    const hardcoded = MOCK_USERS.find(u => u.email===email && u.password===password)
    if (hardcoded) { setUser(hardcoded); saveData(KEYS.user, hardcoded); return true }
    const currentGlvs = loadData(KEYS.glvs, [])
    const foundGlv = currentGlvs.find(g => g.email===email && g.password===password)
    if (foundGlv)  { setUser(foundGlv); saveData(KEYS.user, foundGlv); return true }
    return false
  }

  const handleLogout = () => {
    setUser(null); saveData(KEYS.user, null)
    setUserMenu(false); setPage('home')
  }

  const saveStudents   = d => { setStudents(d);   saveData(KEYS.students,   d) }
  const saveAttendance = d => { setAttendance(d); saveData(KEYS.attendance, d) }
  const saveScores     = d => { setScores(d);     saveData(KEYS.scores,     d) }
  const saveGlvs       = d => { setGlvs(d);       saveData(KEYS.glvs,       d) }
  const saveNotifs     = d => { setNotifs(d);      saveData(KEYS.notifs,     d) }

  const visibleStudents = user?.role==='admin' ? students : students.filter(s=>s.lopId===user?.classId)

  // Đếm thông báo chưa đọc
  const unreadCount = user ? notifs.filter(n =>
    (n.to==='all'||n.to===user.role||n.to===user.id) && !n.readBy?.includes(user.id)
  ).length : 0

  if (!ready) return null
  if (!user)  return <LoginScreen onLogin={handleLogin}/>

  return (
    <div className="app">
      {splash && <SplashScreen/>}

      {/* TopBar */}
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-icon">✝</div>
          <div>
            <div className="topbar-title">Ban Giáo Lý</div>
            <div className="topbar-sub">GX Âm Sa · Đài Môn · Thuần Hậu</div>
          </div>
        </div>
        <div className="topbar-actions">
          {/* Dark mode toggle */}
          <button className="topbar-btn" onClick={toggleTheme} title="Đổi giao diện">
            {theme==='dark' ? '☀️' : '🌙'}
          </button>
          {/* Thông báo */}
          <button className="topbar-btn" onClick={()=>setShowNotif(true)}>
            🔔
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>
            )}
          </button>
          {/* Avatar */}
          <div className="avatar" onClick={()=>setUserMenu(true)}>
            {user.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Pages */}
      {page==='home'       && <Dashboard   user={user} students={visibleStudents} attendance={attendance} scores={scores} notifs={notifs} onSaveNotifs={saveNotifs}/>}
      {page==='students'   && <Students    user={user} students={visibleStudents} onSave={saveStudents}/>}
      {page==='attendance' && <Attendance  user={user} students={visibleStudents} attendance={attendance} onSave={saveAttendance}/>}
      {page==='scores'     && <Scores      user={user} students={visibleStudents} scores={scores} onSave={saveScores}/>}
      {page==='reports'    && <Reports     user={user} students={students} attendance={attendance} scores={scores} glvs={glvs} onSaveGlvs={saveGlvs}/>}

      {/* Bottom nav */}
      <nav className="bnav">
        {PAGES.map(p=>(
          <button key={p.id} className={`bnav-btn ${page===p.id?'active':''}`} onClick={()=>setPage(p.id)}>
            {p.icon}{p.label}
          </button>
        ))}
      </nav>

      {/* User menu */}
      {userMenu && (
        <div className="overlay" onClick={()=>setUserMenu(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <UserMenuContent
              user={user} glvs={glvs} saveGlvs={saveGlvs}
              onUpdateUser={updated => {
                setUser(updated); saveData(KEYS.user, updated)
                if (updated.role==='gly') saveGlvs(glvs.map(g=>g.id===updated.id?updated:g))
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Thông báo */}
      {showNotif && (
        <NotifPanel notifs={notifs} user={user} onSave={saveNotifs} onClose={()=>setShowNotif(false)}/>
      )}
    </div>
  )
}