import { useState } from 'react'
import { ALL_CLASSES, KY_THI } from '../constants'
import { uid, fullName } from '../utils/helpers'
import { Icons } from '../components/Icons'

const getDiem    = (sc)   => (sc?.diem!==undefined&&sc?.diem!=='') ? parseFloat(sc.diem) : null
const xepLoaiDi  = (diem) => {
  if (diem===null) return null
  if (diem<5) return { label:'Yếu', color:'red' }
  if (diem<7) return { label:'TB',  color:'gray' }
  if (diem<9) return { label:'Khá', color:'blue' }
  return           { label:'Giỏi', color:'green' }
}
function calcYearAvg(studentId, classId, scores) {
  const vals = KY_THI
    .map(ky=>scores.find(sc=>sc.studentId===studentId&&sc.classId===classId&&sc.ky===ky))
    .map(sc=>getDiem(sc)).filter(v=>v!==null&&!isNaN(v))
  return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null
}

export default function Reports({ user, students, attendance, scores, glvs=[], onSaveGlvs, pending=[], onApprove, onReject }) {
  const isAdmin = user.role==='admin'
  const [view, setView] = useState(isAdmin&&pending.length>0 ? 'duyet' : 'class')

  const byClass = ALL_CLASSES
    .filter(c=>isAdmin||c.id===user.classId)
    .map(c => {
      const att = attendance.filter(a=>a.classId===c.id)
      return {
        ...c,
        count: students.filter(s=>s.lopId===c.id).length,
        rate:  att.length ? Math.round(att.filter(a=>a.trangThai==='Có mặt').length/att.length*100) : 0,
        totalSessions: [...new Set(att.map(a=>a.date))].length,
      }
    })

  return (
    <div className="content">
      <div className="sec-hd">
        <div className="sec-title">📊 {isAdmin?'Quản lý':'Báo Cáo'}</div>
      </div>

      <div className="tabs">
        <button className={`tab ${view==='class'?'active':''}`}  onClick={()=>setView('class')}>📋 Chuyên cần</button>
        <button className={`tab ${view==='scores'?'active':''}`} onClick={()=>setView('scores')}>⭐ Điểm số</button>
        {isAdmin && (
          <>
            <button className={`tab ${view==='glv'?'active':''}`} onClick={()=>setView('glv')}>👨‍🏫 GLV</button>
            <button className={`tab ${view==='duyet'?'active':''}`} onClick={()=>setView('duyet')}
              style={{ position:'relative' }}>
              ✅ Duyệt
              {pending.length>0 && (
                <span style={{ marginLeft:5, background:'var(--red)', color:'#fff', borderRadius:10, fontSize:9, fontWeight:900, padding:'1px 5px' }}>
                  {pending.length}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* ══ Chuyên cần ══ */}
      {view==='class' && (
        <>
          {isAdmin && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div className="stat-card"><div className="stat-num">{students.length}</div><div className="stat-lbl">Tổng thiếu nhi</div></div>
              <div className="stat-card">
                <div className="stat-num" style={{ color:'var(--green)' }}>
                  {attendance.length?Math.round(attendance.filter(a=>a.trangThai==='Có mặt').length/attendance.length*100):0}%
                </div>
                <div className="stat-lbl">Chuyên cần TB</div>
              </div>
            </div>
          )}
          {byClass.map(c=>(
            <div key={c.id} className="card" style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:900, fontSize:15 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600 }}>{c.khoi} · {c.totalSessions} buổi</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:900, fontSize:20, color:'var(--sky-dd)' }}>{c.count}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--gray)' }}>Thiếu nhi</div>
                </div>
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700, color:'var(--gray)', marginBottom:4 }}>
                  <span>Chuyên cần</span>
                  <span style={{ color:c.rate>=80?'var(--green)':c.rate>=60?'var(--amber)':'var(--red)' }}>{c.rate}%</span>
                </div>
                <div style={{ height:8, background:'var(--lgray)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${c.rate}%`, background:`linear-gradient(90deg,${c.rate>=80?'#10B981,#059669':c.rate>=60?'#F59E0B,#D97706':'#EF4444,#DC2626'})`, borderRadius:4 }}/>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ══ Điểm số ══ */}
      {view==='scores' && <ScoreReport user={user} students={students} scores={scores}/>}

      {/* ══ Quản lý GLV ══ */}
      {view==='glv' && isAdmin && <GlvManager glvs={glvs} onSave={onSaveGlvs}/>}

      {/* ══ Duyệt đăng ký ══ */}
      {view==='duyet' && isAdmin && (
        <PendingApprovals pending={pending} onApprove={onApprove} onReject={onReject}/>
      )}
    </div>
  )
}

// ── Duyệt đăng ký GLV ────────────────────────────────
function PendingApprovals({ pending, onApprove, onReject }) {
  const [confirmId, setConfirmId] = useState(null) // id đang xác nhận từ chối

  if (pending.length===0) return (
    <div className="empty">
      <div className="empty-icon">✅</div>
      <div className="empty-text">Không có yêu cầu nào chờ duyệt</div>
    </div>
  )

  return (
    <>
      <div style={{ background:'#FEF3C7', borderRadius:12, padding:'12px 14px', marginBottom:14, display:'flex', gap:10, alignItems:'center' }}>
        <span style={{ fontSize:20 }}>⏳</span>
        <div>
          <div style={{ fontWeight:900, fontSize:13, color:'#92400E' }}>{pending.length} yêu cầu đang chờ duyệt</div>
          <div style={{ fontSize:11, color:'#92400E', fontWeight:600 }}>Kiểm tra thông tin trước khi duyệt</div>
        </div>
      </div>

      {pending.map(req => {
        const cls = ALL_CLASSES.find(c=>c.id===req.classId)
        return (
          <div key={req.id} className="card" style={{ marginBottom:12 }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:'#EDE9FE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, color:'#5B21B6', flexShrink:0 }}>
                {req.name.charAt(0)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:900, fontSize:15, color:'var(--text)' }}>{req.name}</div>
                <div style={{ fontSize:12, color:'var(--gray)', fontWeight:600 }}>{req.email}</div>
              </div>
              <span className="badge badge-amber">Chờ duyệt</span>
            </div>

            {/* Thông tin */}
            <div style={{ background:'var(--bg)', borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
              {[
                ['📋 Lớp đăng ký', cls?.name || req.classId],
                ['🕐 Thời gian', new Date(req.time).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})],
              ].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, marginBottom:6 }}>
                  <span style={{ color:'var(--gray)' }}>{l}</span>
                  <span style={{ fontWeight:800, color:'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Nút hành động */}
            {confirmId===req.id ? (
              <div style={{ background:'#FEE2E2', borderRadius:10, padding:12 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#991B1B', marginBottom:8, textAlign:'center' }}>
                  Xác nhận từ chối yêu cầu của {req.name}?
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex:1 }} onClick={()=>setConfirmId(null)}>Hủy</button>
                  <button className="btn btn-danger btn-sm" style={{ flex:1 }} onClick={()=>{ onReject(req); setConfirmId(null) }}>Từ chối</button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-sm" style={{ flex:1, background:'#FEE2E2', color:'#991B1B', border:'none' }}
                  onClick={()=>setConfirmId(req.id)}>
                  ✗ Từ chối
                </button>
                <button className="btn btn-primary btn-sm" style={{ flex:2 }} onClick={()=>onApprove(req)}>
                  ✅ Duyệt — Cho vào lớp {cls?.name}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

// ── Báo cáo điểm ─────────────────────────────────────
function ScoreReport({ user, students, scores }) {
  const [expand, setExpand] = useState(null)
  const classes = ALL_CLASSES.filter(c=>user.role==='admin'||c.id===user.classId)
  return (
    <>
      {classes.map(c=>{
        const classStudents = students.filter(s=>s.lopId===c.id)
        const yearAvgs = classStudents.map(s=>calcYearAvg(s.id,c.id,scores)).filter(Boolean).map(parseFloat)
        const avg = yearAvgs.length?(yearAvgs.reduce((a,b)=>a+b,0)/yearAvgs.length).toFixed(1):null
        const entered = classStudents.filter(s=>calcYearAvg(s.id,c.id,scores)!==null).length
        const dist={gioi:0,kha:0,tb:0,yeu:0}
        yearAvgs.forEach(v=>{ if(v>=9)dist.gioi++; else if(v>=7)dist.kha++; else if(v>=5)dist.tb++; else dist.yeu++ })
        return (
          <div key={c.id} className="card" style={{ marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:avg?10:0 }}
              onClick={()=>setExpand(expand===c.id?null:c.id)} role="button">
              <div>
                <div style={{ fontWeight:900, fontSize:15 }}>{c.name}</div>
                <div style={{ fontSize:11, color:'var(--gray)', fontWeight:600 }}>{entered}/{classStudents.length} em đã có điểm</div>
              </div>
              <div style={{ textAlign:'right' }}>
                {avg?<><div style={{ fontWeight:900, fontSize:22, color:'var(--sky-dd)' }}>{avg}</div><span className="badge badge-blue">TB năm</span></>
                    :<span className="badge" style={{ background:'var(--lgray)', color:'var(--gray)' }}>Chưa có</span>}
              </div>
            </div>
            {avg&&<div style={{ display:'flex', gap:6, marginBottom:expand===c.id?12:0 }}>
              {[['Giỏi',dist.gioi,'#D1FAE5','#065F46'],['Khá',dist.kha,'#DBEAFE','#1E40AF'],['TB',dist.tb,'#F1F5F9','#475569'],['Yếu',dist.yeu,'#FEE2E2','#991B1B']]
                .filter(i=>i[1]>0).map(([l,count,bg,color])=>(
                  <div key={l} style={{ flex:1, background:bg, borderRadius:8, padding:'5px 4px', textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:900, color }}>{count}</div>
                    <div style={{ fontSize:9, fontWeight:800, color }}>{l}</div>
                  </div>
              ))}
            </div>}
            {expand===c.id&&classStudents.map(s=>{
              const ya=calcYearAvg(s.id,c.id,scores); const xl=xepLoaiDi(ya?parseFloat(ya):null)
              return (
                <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 4px', borderBottom:'1px solid var(--lgray)' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{fullName(s)}</div>
                  {ya?<div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontWeight:900, color:'var(--sky-dd)' }}>{ya}</span>
                    <span className={`badge ${xl?.color==='green'?'badge-green':xl?.color==='blue'?'badge-blue':xl?.color==='red'?'badge-red':'badge'}`}
                      style={xl?.color==='gray'?{background:'#F1F5F9',color:'#475569'}:{}}>{xl?.label}</span>
                  </div>:<span style={{ fontSize:12, color:'var(--gray)', fontWeight:600 }}>Chưa có</span>}
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}

// ── Quản lý GLV ───────────────────────────────────────
function GlvManager({ glvs=[], onSave }) {
  const [modal,setModal]=useState(null); const [form,setForm]=useState({})
  const [confirm,setConfirm]=useState(false); const [search,setSearch]=useState(''); const [msg,setMsg]=useState(null)
  const filtered=glvs.filter(g=>!search||g.name.toLowerCase().includes(search.toLowerCase())||g.email.toLowerCase().includes(search.toLowerCase()))
  const openAdd=()=>{ setForm({name:'',email:'',password:'123456',classId:'',phone:'',role:'gly'}); setModal('add'); setConfirm(false); setMsg(null) }
  const openEdit=g=>{ setForm({...g}); setModal('edit'); setConfirm(false); setMsg(null) }
  const saveForm=()=>{
    if(!form.name||!form.email||!form.password||!form.classId){ setMsg({type:'err',text:'Vui lòng điền đầy đủ (*)'}); return }
    if(modal==='add'&&glvs.find(g=>g.email===form.email)){ setMsg({type:'err',text:'Email đã tồn tại'}); return }
    onSave(modal==='add'?[...glvs,{...form,id:uid()}]:glvs.map(g=>g.id===form.id?form:g)); setModal(null)
  }
  return (
    <>
      <div className="card card-blue" style={{ marginBottom:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><div style={{ fontSize:28, fontWeight:900 }}>{glvs.length}</div><div style={{ fontSize:12, opacity:.85, fontWeight:700 }}>Giáo lý viên</div></div>
        <div style={{ fontSize:32 }}>👨‍🏫</div>
      </div>
      <div className="search-wrap">
        <span className="search-icon">{Icons.search}</span>
        <input className="search-input" placeholder="Tìm tên, email..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {filtered.length===0?<div className="empty"><div className="empty-icon">👨‍🏫</div><div className="empty-text">{search?'Không tìm thấy':'Chưa có GLV'}</div></div>
      :filtered.map(g=>(
        <div key={g.id} className="list-item" onClick={()=>openEdit(g)}>
          <div className="list-avatar" style={{ background:'#EDE9FE', color:'#5B21B6' }}>{g.name.charAt(0)}</div>
          <div className="list-info"><div className="list-name">{g.name}</div><div className="list-sub">{g.email}</div></div>
          {g.classId?<span className="badge badge-green">{ALL_CLASSES.find(c=>c.id===g.classId)?.name}</span>:<span className="badge badge-red">Chưa phân lớp</span>}
        </div>
      ))}
      <button className="fab" onClick={openAdd}>{Icons.plus}</button>
      {modal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-handle"/>
            <div className="modal-title">{modal==='add'?'➕ Thêm GLV':'✏️ Chỉnh sửa GLV'}</div>
            {msg&&<div className={`alert ${msg.type==='ok'?'alert-ok':'alert-err'}`}>{msg.text}</div>}
            {[['name','Họ và tên *','Nguyễn Văn A','text'],['email','Email *','gly@gmail.com','email'],['password',modal==='add'?'Mật khẩu *':'Đặt lại MK','Tối thiểu 6 ký tự','password'],['phone','SĐT','09xxxxxxxx','tel']].map(([k,l,ph,t])=>(
              <div className="form-group" key={k}><label className="form-label">{l}</label>
              <input className="form-input" type={t} placeholder={ph} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})} disabled={k==='email'&&modal==='edit'}/></div>
            ))}
            <div className="form-group"><label className="form-label">Phân công lớp *</label>
              <select className="form-input" value={form.classId||''} onChange={e=>setForm({...form,classId:e.target.value})}>
                <option value="">-- Chọn lớp --</option>
                {ALL_CLASSES.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginBottom:8 }} onClick={saveForm}>{modal==='add'?'✅ Thêm GLV':'💾 Lưu'}</button>
            {modal==='edit'&&(confirm?
              <div style={{ background:'#FEE2E2', borderRadius:10, padding:12, textAlign:'center' }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#991B1B', marginBottom:8 }}>Xác nhận xóa GLV?</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex:1 }} onClick={()=>setConfirm(false)}>Hủy</button>
                  <button className="btn btn-danger btn-sm" style={{ flex:1 }} onClick={()=>{ onSave(glvs.filter(g=>g.id!==form.id)); setModal(null) }}>Xóa</button>
                </div>
              </div>
              :<button className="btn btn-danger btn-full btn-sm" onClick={()=>setConfirm(true)}>🗑 Xóa GLV</button>
            )}
          </div>
        </div>
      )}
    </>
  )
}