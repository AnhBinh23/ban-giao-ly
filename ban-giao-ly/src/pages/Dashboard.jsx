import { useState } from 'react'
import { ALL_CLASSES, PARISHES, getClass } from '../constants'
import ClassDetail from './ClassDetail'

export default function Dashboard({ user, students, attendance, scores }) {
  const [selectedClass, setSelectedClass] = useState(null)

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday:'long', day:'2-digit', month:'2-digit', year:'numeric'
  })
  const totalAtt = attendance.length
  const coMat    = attendance.filter(a=>a.trangThai==='Có mặt').length
  const rate     = totalAtt ? Math.round(coMat/totalAtt*100) : 0
  const myClasses = ALL_CLASSES.filter(c=>user.role==='admin'||c.id===user.classId)
  const recentDates = [...new Set(attendance.map(a=>a.date))].sort().slice(-5)
  const khoiGroups  = [...new Set(myClasses.map(c=>c.khoi))]

  if (selectedClass) return (
    <ClassDetail cls={selectedClass} students={students} attendance={attendance}
      scores={scores} onBack={()=>setSelectedClass(null)}/>
  )

  return (
    <div className="content">
      <div className="card card-blue">
        <div style={{ fontSize:12, opacity:.85, fontWeight:700, marginBottom:2 }}>Xin chào 👋</div>
        <div style={{ fontSize:18, fontWeight:900, marginBottom:2 }}>{user.name}</div>
        <div style={{ fontSize:11, opacity:.75, fontWeight:600 }}>{today}</div>
        {user.role==='gly' && (
          <div style={{ marginTop:10, background:'rgba(255,255,255,.2)', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:700 }}>
            📚 Phụ trách: {getClass(user.classId)?.name}
          </div>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{students.length}</div>
          <div className="stat-lbl">Thiếu nhi</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color:rate>=80?'var(--green)':rate>=60?'var(--amber)':'var(--red)' }}>{rate}%</div>
          <div className="stat-lbl">Chuyên cần</div>
        </div>
        {user.role==='admin' && (
          <>
            <div className="stat-card">
              <div className="stat-num">{PARISHES.length}</div>
              <div className="stat-lbl">Giáo xứ</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{ALL_CLASSES.length}</div>
              <div className="stat-lbl">Tổng lớp</div>
            </div>
          </>
        )}
      </div>

      {recentDates.length>0 && (
        <>
          <div className="sec-hd"><div className="sec-title">📅 Điểm danh gần đây</div></div>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {[...recentDates].reverse().map(d=>{
              const dayAtt=attendance.filter(a=>a.date===d)
              const dayRate=dayAtt.length?Math.round(dayAtt.filter(a=>a.trangThai==='Có mặt').length/dayAtt.length*100):0
              return (
                <div key={d} style={{ background:'var(--sky-bg)', borderRadius:10, padding:'8px 12px', minWidth:80, textAlign:'center' }}>
                  <div style={{ fontSize:12, fontWeight:900, color:'var(--sky-dd)' }}>
                    {new Date(d).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})}
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:dayRate>=80?'var(--green)':'var(--amber)' }}>{dayRate}%</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="sec-hd"><div className="sec-title">📋 Các lớp</div></div>

      {khoiGroups.map(khoi=>(
        <div key={khoi} style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>
            {khoi}
          </div>
          {myClasses.filter(c=>c.khoi===khoi).map(c=>{
            const cAtt=attendance.filter(a=>a.classId===c.id)
            const cRate=cAtt.length?Math.round(cAtt.filter(a=>a.trangThai==='Có mặt').length/cAtt.length*100):null
            const count=students.filter(s=>s.lopId===c.id).length
            return (
              <div key={c.id} className="list-item" style={{ marginBottom:8 }} onClick={()=>setSelectedClass(c)}>
                <div className="list-avatar" style={{ fontSize:11, fontWeight:900 }}>{c.id}</div>
                <div className="list-info">
                  <div className="list-name">{c.name}</div>
                  <div className="list-sub">{count} thiếu nhi</div>
                </div>
                {cRate!==null?(
                  <div style={{ textAlign:'right', marginRight:6 }}>
                    <div style={{ fontSize:13, fontWeight:900, color:cRate>=80?'var(--green)':'var(--amber)' }}>{cRate}%</div>
                    <div style={{ fontSize:9, color:'var(--gray)', fontWeight:700 }}>Chuyên cần</div>
                  </div>
                ):(
                  <span className="badge badge-blue" style={{ marginRight:6 }}>{c.khoi}</span>
                )}
                <div style={{ color:'var(--gray)', fontSize:18, flexShrink:0 }}>›</div>
              </div>
            )
          })}
        </div>
      ))}
      <div style={{ height:8 }}/>
    </div>
  )
}