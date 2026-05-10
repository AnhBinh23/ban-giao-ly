import { useState } from 'react'
import { ALL_CLASSES } from '../constants'
import { saveSheet } from '../utils/storage'
import { uid } from '../utils/helpers'

export default function LoginScreen({ onLogin, pending, onSavePending }) {
  const [tab,    setTab]    = useState('login')
  const [email,  setEmail]  = useState('')
  const [pass,   setPass]   = useState('')
  const [error,  setError]  = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading,setLoading]= useState(false)

  const [reg,       setReg]       = useState({ name:'', email:'', password:'', confirm:'', classId:'' })
  const [regStatus, setRegStatus] = useState(null)
  const [regMsg,    setRegMsg]    = useState('')

  const handleLogin = async () => {
    setError(''); setLoading(true)
    if (!email||!pass) { setError('Vui lòng nhập đầy đủ thông tin'); setLoading(false); return }

    const result = await onLogin(email, pass)
    setLoading(false)
    if (result==='pending') setError('⏳ Tài khoản đang chờ Admin duyệt!')
    else if (result==='fail') setError('Email hoặc mật khẩu không đúng')
  }

  const handleRegister = async () => {
    setRegMsg('')
    if (!reg.name||!reg.email||!reg.password||!reg.classId) {
      setRegStatus('error'); setRegMsg('Vui lòng điền đầy đủ thông tin (*)'); return
    }
    if (reg.password.length<6) { setRegStatus('error'); setRegMsg('Mật khẩu phải từ 6 ký tự'); return }
    if (reg.password!==reg.confirm) { setRegStatus('error'); setRegMsg('Mật khẩu xác nhận không khớp'); return }
    if (pending?.find(p=>p.email===reg.email)) { setRegStatus('error'); setRegMsg('Email này đã đăng ký và đang chờ duyệt'); return }

    setLoading(true)
    const newReq = { id:uid(), name:reg.name, email:reg.email, password:reg.password,
      classId:reg.classId, role:'gly', time:new Date().toISOString(), status:'pending' }
    const newPending = [...(pending||[]), newReq]
    onSavePending(newPending)
    setLoading(false)
    setRegStatus('success')
  }

  const cls = ALL_CLASSES.find(c=>c.id===reg.classId)

  return (
    <div className="login-bg">
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ width:72, height:72, borderRadius:22, background:'rgba(255,255,255,.2)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:36,
          margin:'0 auto 14px', boxShadow:'0 8px 32px rgba(0,0,0,.15)' }}>✝</div>
        <div style={{ color:'#fff', fontWeight:900, fontSize:22, marginBottom:4 }}>Ban Giáo Lý</div>
        <div style={{ color:'rgba(255,255,255,.75)', fontSize:12, fontWeight:600 }}>GX Âm Sa · Đài Môn · Thuần Hậu</div>
      </div>

      <div className="login-box">
        <div className="tabs" style={{ marginBottom:20 }}>
          <button className={`tab ${tab==='login'?'active':''}`} onClick={()=>{ setTab('login'); setError(''); setRegStatus(null) }}>🔑 Đăng nhập</button>
          <button className={`tab ${tab==='register'?'active':''}`} onClick={()=>{ setTab('register'); setError(''); setRegStatus(null) }}>📝 Đăng ký GLV</button>
        </div>

        {tab==='login' && (
          <>
            {error&&<div className="alert alert-err" style={{ marginBottom:14 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="email@gmail.com"
                value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div style={{ position:'relative' }}>
                <input className="form-input" type={showPw?'text':'password'} placeholder="••••••"
                  value={pass} onChange={e=>setPass(e.target.value)} style={{ paddingRight:44 }}
                  onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
                <button onClick={()=>setShowPw(!showPw)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'var(--gray)' }}>
                  {showPw?'🙈':'👁'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}>
              {loading?'⏳ Đang đăng nhập...':'🔑 Đăng nhập'}
            </button>
            <div style={{ marginTop:14, background:'var(--sky-bg)', borderRadius:10, padding:'10px 14px', fontSize:12, fontWeight:700, color:'var(--sky-dd)' }}>
              👆 Chưa có tài khoản? Bấm tab <strong>Đăng ký GLV</strong>
            </div>
          </>
        )}

        {tab==='register' && (
          regStatus==='success' ? (
            <div style={{ textAlign:'center', padding:'20px 10px' }}>
              <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
              <div style={{ fontWeight:900, fontSize:18, color:'var(--sky-dd)', marginBottom:8 }}>Đã gửi yêu cầu!</div>
              <div style={{ fontSize:13, color:'var(--gray)', fontWeight:600, lineHeight:1.6, marginBottom:20 }}>
                Yêu cầu của <strong>{reg.name}</strong> đã được gửi đến Admin.<br/>
                Lớp đăng ký: <strong>{cls?.name}</strong><br/><br/>
                Sau khi Admin duyệt, bạn đăng nhập bằng email và mật khẩu vừa tạo.
              </div>
              <button className="btn btn-primary btn-full" onClick={()=>{ setTab('login'); setRegStatus(null); setReg({ name:'', email:'', password:'', confirm:'', classId:'' }) }}>
                🔑 Về trang đăng nhập
              </button>
            </div>
          ) : (
            <>
              {regMsg&&<div className="alert alert-err" style={{ marginBottom:14 }}>{regMsg}</div>}
              {[['name','Họ và tên *','Nguyễn Văn A','text'],['email','Email *','email@gmail.com','email'],
                ['password','Mật khẩu *','Tối thiểu 6 ký tự','password'],['confirm','Xác nhận mật khẩu *','Nhập lại','password']].map(([k,l,ph,t])=>(
                <div className="form-group" key={k}>
                  <label className="form-label">{l}</label>
                  <input className="form-input" type={t} placeholder={ph} value={reg[k]} onChange={e=>setReg({...reg,[k]:e.target.value})}/>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Lớp muốn phụ trách *</label>
                <select className="form-input" value={reg.classId} onChange={e=>setReg({...reg,classId:e.target.value})}>
                  <option value="">-- Chọn lớp --</option>
                  {ALL_CLASSES.map(c=><option key={c.id} value={c.id}>{c.name} ({c.khoi})</option>)}
                </select>
              </div>
              <div style={{ background:'#FEF3C7', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:12, fontWeight:700, color:'#92400E' }}>
                ⚠️ Admin sẽ xét duyệt trước khi bạn đăng nhập được.
              </div>
              <button className="btn btn-primary btn-full" onClick={handleRegister} disabled={loading}>
                {loading?'⏳ Đang gửi...':'📤 Gửi yêu cầu đăng ký'}
              </button>
            </>
          )
        )}
      </div>
    </div>
  )
}