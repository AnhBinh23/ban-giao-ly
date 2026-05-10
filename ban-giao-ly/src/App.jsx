// ═══════════════════════════════════════════════════════
// App.jsx — Phiên bản kết nối Google Sheets
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react'
import { SAMPLE_STUDENTS, ALL_CLASSES, getClass } from './constants'
import { saveLocalData, loadLocalData, loadAllData, saveSheet, initSheets, KEYS } from './utils/storage'
import { Icons }        from './components/Icons'
import LoginScreen      from './components/LoginScreen'
import Dashboard        from './pages/Dashboard'
import Students         from './pages/Students'
import Attendance       from './pages/Attendance'
import Scores           from './pages/Scores'
import Reports          from './pages/Reports'

// ── Splash ───────────────────────────────────────────
function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash-logo">✝</div>
      <div className="splash-title">Ban Giáo Lý</div>
      <div className="splash-sub">GX Âm Sa · Đài Môn · Thuần Hậu</div>
      <div className="splash-dots">
        <div className="splash-dot"/><div className="splash-dot"/><div className="splash-dot"/>
      </div>
    </div>
  )
}

// ── Loading overlay ───────────────────────────────────
function LoadingBar({ text }) {
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:9998,
      background:'linear-gradient(135deg,#0369A1,#0EA5E9)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', fontFamily:'Nunito' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>✝</div>
      <div style={{ color:'#fff', fontWeight:900, fontSize:18, marginBottom:8 }}>{text||'Đang tải...'}</div>
      <div style={{ width:200, height:6, background:'rgba(255,255,255,.2)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:'60%', background:'#fff', borderRadius:3, animation:'loadBar 1.5s ease infinite' }}/>
      </div>
      <style>{`@keyframes loadBar { 0%{width:0%} 50%{width:80%} 100%{width:100%} }`}</style>
    </div>
  )
}

// ── User Menu ─────────────────────────────────────────
function UserMenuContent({ user, onUpdateUser, onLogout }) {
  const [tab,      setTab]     = useState('info')
  const [form,     setForm]    = useState({ name:user.name, phone:user.phone||'', gioiThieu:user.gioiThieu||'' })
  const [passForm, setPassForm]= useState({ old:'', new1:'', new2:'' })
  const [msg,      setMsg]     = useState(null)

  const saveInfo = () => {
    if (!form.name) { setMsg({ type:'err', text:'Vui lòng nhập họ tên' }); return }
    onUpdateUser({ ...user, ...form })
    setMsg({ type:'ok', text:'Đã lưu thành công!' })
    setTimeout(()=>{ setMsg(null); setTab('info') }, 1500)
  }
  const savePass = () => {
    if (passForm.old!==user.password)  { setMsg({ type:'err', text:'Mật khẩu cũ không đúng' }); return }
    if (passForm.new1.length<6)        { setMsg({ type:'err', text:'Mật khẩu mới phải từ 6 ký tự' }); return }
    if (passForm.new1!==passForm.new2) { setMsg({ type:'err', text:'Mật khẩu mới không khớp' }); return }
    onUpdateUser({ ...user, password:passForm.new1 })
    setMsg({ type:'ok', text:'Đổi mật khẩu thành công!' })
    setPassForm({ old:'', new1:'', new2:'' })
    setTimeout(()=>setMsg(null), 2000)
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
            {user.role==='admin'?'👑 Admin tổng':'📚 Giáo lý viên'}
          </span>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:16 }}>
        {['info','edit','pass'].map(t=>(
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>{ setTab(t); setMsg(null) }}>
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
          {[['old','Mật khẩu hiện tại'],['new1','Mật khẩu mới'],['new2','Xác nhận']].map(([k,l])=>(
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

// ── Thông báo ─────────────────────────────────────────
function NotifPanel({ notifs, user, onSave, onClose }) {
  const myNotifs = notifs.filter(n=>n.to==='all'||n.to===user.role||n.to===user.id)
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({ title:'', body:'', icon:'📢', to:'all' })

  const markRead = id => onSave(notifs.map(n=>n.id===id?{...n,readBy:[...(n.readBy||[]),user.id]}:n))
  const markAll  = ()  => onSave(notifs.map(n=>(n.to==='all'||n.to===user.role||n.to===user.id)?{...n,readBy:[...new Set([...(n.readBy||[]),user.id])]}:n))
  const addNotif = ()  => {
    if (!form.title||!form.body) return
    onSave([{ id:Date.now()+'', ...form, time:new Date().toISOString(), readBy:[], from:user.id }, ...notifs])
    setForm({ title:'', body:'', icon:'📢', to:'all' }); setShowForm(false)
  }
  const unread = myNotifs.filter(n=>!n.readBy?.includes(user.id))

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div className="modal-title" style={{ marginBottom:0 }}>🔔 Thông báo</div>
          <div style={{ display:'flex', gap:8 }}>
            {unread.length>0&&<button className="btn btn-sm btn-outline" onClick={markAll}>Đọc tất cả</button>}
            {user.role==='admin'&&<button className="btn btn-sm btn-primary" onClick={()=>setShowForm(!showForm)}>+ Thêm</button>}
          </div>
        </div>
        {showForm&&(
          <div style={{ background:'var(--sky-bg)', borderRadius:12, padding:14, marginBottom:14 }}>
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['📢','⛪','📅','⚠️','✅','🎉','📝','🙏'].map(ic=>(
                  <button key={ic} onClick={()=>setForm({...form,icon:ic})}
                    style={{ fontSize:20, padding:'4px 8px', borderRadius:8, border:'2px solid', borderColor:form.icon===ic?'var(--sky)':'var(--lgray)', background:'var(--card-bg)', cursor:'pointer' }}>{ic}</button>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Tiêu đề</label><input className="form-input" placeholder="Tiêu đề" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Nội dung</label><input className="form-input" placeholder="Nội dung..." value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></div>
            <div className="form-group">
              <label className="form-label">Gửi đến</label>
              <select className="form-input" value={form.to} onChange={e=>setForm({...form,to:e.target.value})}>
                <option value="all">Tất cả</option><option value="gly">GLV</option><option value="admin">Admin</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={addNotif}>📢 Gửi thông báo</button>
          </div>
        )}
        {myNotifs.length===0
          ? <div className="empty"><div className="empty-icon">🔔</div><div className="empty-text">Chưa có thông báo</div></div>
          : myNotifs.map(n=>{
              const isUnread=!n.readBy?.includes(user.id)
              return (
                <div key={n.id} className={`notif-item ${isUnread?'unread':''}`} onClick={()=>markRead(n.id)}>
                  <div className="notif-icon">{n.icon}</div>
                  <div style={{ flex:1 }}>
                    <div className="notif-title">{n.title} {isUnread&&<span style={{ width:7,height:7,borderRadius:'50%',background:'var(--sky)',display:'inline-block',marginLeft:4 }}/>}</div>
                    <div className="notif-body">{n.body}</div>
                    <div className="notif-time">{new Date(n.time).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                </div>
              )
            })
        }
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
  const [students,   setStudents]   = useState([])
  const [attendance, setAttendance] = useState([])
  const [scores,     setScores]     = useState([])
  const [glvs,       setGlvs]       = useState([])
  const [pending,    setPending]    = useState([])
  const [notifs,     setNotifs]     = useState([])
  const [users,      setUsers]      = useState([])
  const [page,       setPage]       = useState('home')
  const [userMenu,   setUserMenu]   = useState(false)
  const [showNotif,  setShowNotif]  = useState(false)
  const [theme,      setTheme]      = useState('light')
  const [splash,     setSplash]     = useState(true)
  const [loading,    setLoading]    = useState(true)
  const [loadMsg,    setLoadMsg]    = useState('Đang kết nối...')
  const [syncStatus, setSyncStatus] = useState(null) // 'saving' | 'saved' | 'error'

  useEffect(() => {
    const t = setTimeout(()=>setSplash(false), 2500)
    return ()=>clearTimeout(t)
  }, [])

  // Load toàn bộ dữ liệu từ Sheets khi khởi động
  useEffect(() => {
    const init = async () => {
      const th = loadLocalData(KEYS.theme, 'light')
      setTheme(th)
      document.documentElement.setAttribute('data-theme', th)

      // Kiểm tra đã đăng nhập chưa
      const savedUser = loadLocalData(KEYS.user)

      setLoadMsg('Đang tải dữ liệu từ Google Sheets...')
      try {
        const data = await loadAllData()
        setStudents(data.students.length ? data.students : SAMPLE_STUDENTS)
        setAttendance(data.attendance)
        setScores(data.scores)
        setGlvs(data.glvs)
        setPending(data.pending)
        setNotifs(data.notifs)
        setUsers(data.users)

        // Xác thực lại user từ Sheets
        if (savedUser) {
          // Tìm trong users sheet + glvs sheet
          const allAccounts = [...data.users, ...data.glvs]
          const verified = allAccounts.find(u=>u.email===savedUser.email&&u.password===savedUser.password)
          if (verified) setUser(verified)
        }
      } catch (err) {
        console.error('Lỗi kết nối Sheets:', err)
        // Dùng cache nếu offline
        if (savedUser) setUser(savedUser)
      }

      setLoading(false)
    }
    init()
  }, [])

  // Sync lên Sheets sau mỗi thay đổi
  const syncSheet = useCallback(async (sheetName, data) => {
    setSyncStatus('saving')
    try {
      await saveSheet(sheetName, data)
      setSyncStatus('saved')
      setTimeout(()=>setSyncStatus(null), 2000)
    } catch {
      setSyncStatus('error')
      setTimeout(()=>setSyncStatus(null), 3000)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme==='light'?'dark':'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    saveLocalData(KEYS.theme, next)
  }

  // Đăng nhập — tìm trong users + glvs từ Sheets
  const handleLogin = async (email, password) => {
    // Kiểm tra pending
    if (pending.find(p=>p.email===email)) return 'pending'

    const allAccounts = [...users, ...glvs]
    const found = allAccounts.find(u=>u.email===email&&u.password===password)
    if (found) {
      setUser(found)
      saveLocalData(KEYS.user, found)
      return 'ok'
    }
    return 'fail'
  }

  const handleLogout = () => {
    setUser(null); saveLocalData(KEYS.user, null)
    setUserMenu(false); setPage('home')
  }

  // Lưu + sync
  const saveStudents   = d=>{ setStudents(d);   syncSheet('students',   d) }
  const saveAttendance = d=>{ setAttendance(d); syncSheet('attendance', d) }
  const saveScores     = d=>{ setScores(d);     syncSheet('scores',     d) }
  const saveGlvs       = d=>{ setGlvs(d);       syncSheet('glvs',       d) }
  const savePending    = d=>{ setPending(d);     syncSheet('pending',    d) }
  const saveNotifs     = d=>{ setNotifs(d);      syncSheet('notifs',     d) }

  // Admin duyệt GLV
  const approvePending = (req) => {
    const newGlv  = { id:req.id, name:req.name, email:req.email, password:req.password, classId:req.classId, role:'gly', phone:'' }
    const newGlvs = [...glvs, newGlv]
    const newPend = pending.filter(p=>p.id!==req.id)
    saveGlvs(newGlvs)
    savePending(newPend)
    const newNotif = { id:Date.now()+'', icon:'✅', title:'Tài khoản đã được duyệt!',
      body:`Chào ${req.name}! Admin đã duyệt tài khoản. Bạn có thể đăng nhập ngay.`,
      to:req.id, time:new Date().toISOString(), readBy:[], from:'admin' }
    saveNotifs([newNotif, ...notifs])
  }
  const rejectPending = (req) => savePending(pending.filter(p=>p.id!==req.id))

  const visibleStudents = user?.role==='admin' ? students : students.filter(s=>s.lopId===user?.classId)
  const unreadCount     = user ? notifs.filter(n=>(n.to==='all'||n.to===user.role||n.to===user.id)&&!n.readBy?.includes(user.id)).length : 0
  const pendingCount    = user?.role==='admin' ? pending.length : 0

  if (loading) return <LoadingBar text={loadMsg}/>
  if (!user)   return <LoginScreen onLogin={handleLogin} pending={pending} onSavePending={savePending}/>

  return (
    <div className="app">
      {splash && <SplashScreen/>}

      {/* Sync status */}
      {syncStatus && (
        <div style={{ position:'fixed', top:56, left:'50%', transform:'translateX(-50%)', zIndex:500,
          background: syncStatus==='saved'?'#065F46':syncStatus==='error'?'#991B1B':'#0369A1',
          color:'#fff', padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:800,
          boxShadow:'0 2px 12px rgba(0,0,0,.2)', transition:'.3s' }}>
          {syncStatus==='saving'?'⏳ Đang lưu...'
           :syncStatus==='saved'?'✅ Đã lưu lên Sheets'
           :'❌ Lỗi kết nối Sheets'}
        </div>
      )}

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
          <button className="topbar-btn" onClick={toggleTheme}>{theme==='dark'?'☀️':'🌙'}</button>
          <button className="topbar-btn" onClick={()=>setShowNotif(true)}>
            🔔
            {unreadCount>0&&<div className="notif-badge">{unreadCount>9?'9+':unreadCount}</div>}
          </button>
          <div className="avatar" onClick={()=>setUserMenu(true)}>{user.name.charAt(0)}</div>
        </div>
      </div>

      {page==='home'       && <Dashboard   user={user} students={visibleStudents} attendance={attendance} scores={scores}/>}
      {page==='students'   && <Students    user={user} students={visibleStudents} onSave={saveStudents}/>}
      {page==='attendance' && <Attendance  user={user} students={visibleStudents} attendance={attendance} onSave={saveAttendance}/>}
      {page==='scores'     && <Scores      user={user} students={visibleStudents} scores={scores} onSave={saveScores}/>}
      {page==='reports'    && <Reports
                                user={user} students={students} attendance={attendance}
                                scores={scores} glvs={glvs} onSaveGlvs={saveGlvs}
                                pending={pending} onApprove={approvePending} onReject={rejectPending}/>}

      <nav className="bnav">
        {PAGES.map(p=>(
          <button key={p.id} className={`bnav-btn ${page===p.id?'active':''}`} onClick={()=>setPage(p.id)}
            style={{ position:'relative' }}>
            {p.icon}{p.label}
            {p.id==='reports'&&pendingCount>0&&(
              <div style={{ position:'absolute', top:6, right:'50%', transform:'translateX(10px)',
                width:16, height:16, borderRadius:'50%', background:'var(--red)',
                color:'#fff', fontSize:9, fontWeight:900,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {pendingCount}
              </div>
            )}
          </button>
        ))}
      </nav>

      {userMenu&&(
        <div className="overlay" onClick={()=>setUserMenu(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <UserMenuContent user={user}
              onUpdateUser={updated=>{
                setUser(updated); saveLocalData(KEYS.user, updated)
                if (updated.role==='gly') saveGlvs(glvs.map(g=>g.id===updated.id?updated:g))
                else setUsers(users.map(u=>u.id===updated.id?updated:u))
              }}
              onLogout={handleLogout}/>
          </div>
        </div>
      )}

      {showNotif&&<NotifPanel notifs={notifs} user={user} onSave={saveNotifs} onClose={()=>setShowNotif(false)}/>}
    </div>
  )
}