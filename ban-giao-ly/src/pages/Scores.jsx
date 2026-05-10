import { useState } from 'react'
import { ALL_CLASSES, HOC_KY, KY_THI, getClass } from '../constants'
import { uid, fullName } from '../utils/helpers'

const getDiem = (sc) => (sc?.diem!==undefined&&sc?.diem!=='') ? parseFloat(sc.diem) : null

// Xếp loại theo điểm kỳ
function xepLoaiDiem(diem) {
  if (diem === null) return null
  if (diem < 5)  return { label:'Yếu',  color:'red',   ghiChu:'Thi lại' }
  if (diem < 7)  return { label:'TB',   color:'gray',  ghiChu:'' }
  if (diem < 9)  return { label:'Khá',  color:'blue',  ghiChu:'' }
  return              { label:'Giỏi', color:'green', ghiChu:'' }
}

// TB cả năm
function calcYearAvg(studentId, classId, scores) {
  const vals = KY_THI
    .map(ky => scores.find(sc=>sc.studentId===studentId&&sc.classId===classId&&sc.ky===ky))
    .map(sc => getDiem(sc)).filter(v=>v!==null&&!isNaN(v))
  return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : null
}

// ── Bảng tổng kết ─────────────────────────────────────
function SummaryTable({ classId, classStudents, scores }) {
  const rows = classStudents.map(s => {
    const kyData  = KY_THI.map(ky => {
      const sc   = scores.find(x=>x.studentId===s.id&&x.classId===classId&&x.ky===ky)
      return { ky, diem: getDiem(sc) }
    })
    const yearAvg = calcYearAvg(s.id, classId, scores)
    const xl      = xepLoaiDiem(yearAvg!==null?parseFloat(yearAvg):null)
    return { s, kyData, yearAvg, xl }
  })

  const withYear = rows.filter(r=>r.yearAvg!==null)
  const classAvg = withYear.length
    ? (withYear.map(r=>parseFloat(r.yearAvg)).reduce((a,b)=>a+b,0)/withYear.length).toFixed(1) : null
  const dist = { gioi:0, kha:0, tb:0, yeu:0 }
  withYear.forEach(r => {
    const v = parseFloat(r.yearAvg)
    if (v>=9) dist.gioi++; else if (v>=7) dist.kha++; else if (v>=5) dist.tb++; else dist.yeu++
  })

  return (
    <>
      {classAvg && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
          <div className="card card-blue" style={{ textAlign:'center', padding:'14px 10px' }}>
            <div style={{ fontSize:32, fontWeight:900 }}>{classAvg}</div>
            <div style={{ fontSize:11, opacity:.85, fontWeight:700 }}>ĐTB Cả Năm</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {[
              { label:'Giỏi', count:dist.gioi, bg:'#D1FAE5', color:'#065F46' },
              { label:'Khá',  count:dist.kha,  bg:'#DBEAFE', color:'#1E40AF' },
              { label:'TB',   count:dist.tb,   bg:'#F1F5F9', color:'#475569' },
              { label:'Yếu',  count:dist.yeu,  bg:'#FEE2E2', color:'#991B1B' },
            ].map(item=>(
              <div key={item.label} style={{ background:item.bg, borderRadius:10, padding:'6px 4px', textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:900, color:item.color }}>{item.count}</div>
                <div style={{ fontSize:9,  fontWeight:800, color:item.color }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ overflowX:'auto', borderRadius:14, boxShadow:'0 2px 12px var(--shadow)' }}>
        <table className="score-table">
          <thead>
            <tr>
              <th style={{ width:36 }}>#</th>
              <th style={{ textAlign:'left', paddingLeft:10 }}>Họ tên</th>
              <th>GK I</th><th>CK I</th><th>GK II</th><th>CK II</th>
              <th style={{ background:'#0C4A6E', color:'#fff' }}>TB Năm</th>
              <th>Xếp loại</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,idx)=>(
              <tr key={r.s.id}>
                <td>{idx+1}</td>
                <td style={{ textAlign:'left', paddingLeft:10, fontWeight:800, fontSize:12, maxWidth:120, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {fullName(r.s)}
                </td>
                {r.kyData.map(k=>(
                  <td key={k.ky} style={k.diem!==null&&k.diem<5?{ color:'var(--red)', fontWeight:900 }:{}}>
                    {k.diem!==null ? k.diem.toFixed(1) : '—'}
                  </td>
                ))}
                <td style={{ fontWeight:900, background:'var(--sky-bg)', color: r.yearAvg&&parseFloat(r.yearAvg)<5?'var(--red)':'var(--sky-dd)' }}>
                  {r.yearAvg||'—'}
                </td>
                <td>
                  {r.xl ? (
                    <span className={`badge ${r.xl.color==='green'?'badge-green':r.xl.color==='blue'?'badge-blue':r.xl.color==='red'?'badge-red':'badge'}`}
                      style={r.xl.color==='gray'?{ background:'#F1F5F9', color:'#475569' }:{}}>
                      {r.xl.label}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ fontSize:11, color: r.xl?.ghiChu==='Thi lại'?'var(--red)':'var(--gray)', fontWeight:r.xl?.ghiChu?800:400 }}>
                  {r.xl?.ghiChu||''}
                </td>
              </tr>
            ))}
            {classAvg && (
              <tr style={{ background:'var(--sky-bg)', borderTop:'2px solid var(--sky-l)' }}>
                <td colSpan={2} style={{ textAlign:'left', paddingLeft:10, fontWeight:900, color:'var(--sky-dd)' }}>ĐTB Lớp</td>
                {KY_THI.map(ky=>{
                  const vals = rows.map(r=>r.kyData.find(k=>k.ky===ky)?.diem).filter(v=>v!==null&&!isNaN(v))
                  const avg  = vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):null
                  return <td key={ky} style={{ fontWeight:800, color:'var(--sky-dd)' }}>{avg||'—'}</td>
                })}
                <td style={{ fontWeight:900, color:'var(--sky-dd)' }}>{classAvg}</td>
                <td colSpan={2}/>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Component chính ───────────────────────────────────
export default function Scores({ user, students, scores, onSave }) {
  const [classId, setClassId] = useState(user.role==='gly'?user.classId:ALL_CLASSES[0].id)
  const [hocKy,   setHocKy]   = useState(0)
  const [ky,      setKy]      = useState(HOC_KY[0].ky[0])
  const [tab,     setTab]     = useState('nhap')
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({})

  const myClasses     = user.role==='admin'?ALL_CLASSES:ALL_CLASSES.filter(c=>c.id===user.classId)
  const classStudents = students.filter(s=>s.lopId===classId)
  const getScore      = (sid) => scores.find(sc=>sc.studentId===sid&&sc.classId===classId&&sc.ky===ky)

  const openScore = (s) => {
    const ex = getScore(s.id)||{}
    setForm({ studentId:s.id, classId, ky, diem:'', ...ex })
    setModal(s)
  }
  const saveScore = () => {
    const exists = scores.find(sc=>sc.studentId===form.studentId&&sc.classId===form.classId&&sc.ky===form.ky)
    const updated = exists
      ? scores.map(sc=>sc.studentId===form.studentId&&sc.classId===form.classId&&sc.ky===form.ky?{...form,id:sc.id}:sc)
      : [...scores, {...form, id:uid()}]
    onSave(updated); setModal(null)
  }

  const formDiem    = form.diem!==''&&form.diem!==undefined ? parseFloat(form.diem) : null
  const formXl      = xepLoaiDiem(formDiem)
  const yearAvgPrev = calcYearAvg(form.studentId, form.classId, [
    ...scores.filter(sc=>!(sc.studentId===form.studentId&&sc.classId===form.classId&&sc.ky===form.ky)),
    form
  ])
  const oLaiPreview = yearAvgPrev!==null && parseFloat(yearAvgPrev)<5

  const printTable = () => {
    const cls  = getClass(classId)
    const rows = classStudents.map((s,i)=>{
      const sc   = getScore(s.id); const diem = getDiem(sc); const xl = xepLoaiDiem(diem)
      return { s, diem, xl, i }
    })
    const win = window.open('','_blank')
    win.document.write(`<html><head><meta charset="UTF-8"/>
    <title>Bảng Điểm ${cls?.name} - ${ky}</title>
    <style>
      body{font-family:Arial;padding:24px}h2{text-align:center;font-size:18px;margin-bottom:4px}
      p{text-align:center;color:#555;font-size:13px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#0369A1;color:#fff;padding:8px 6px;text-align:center;border:1px solid #aaa}
      td{padding:7px 6px;border:1px solid #ccc;text-align:center}td:nth-child(2){text-align:left}
      .red{color:red;font-weight:bold}@media print{button{display:none}}
    </style></head><body>
    <h2>✝ BAN GIÁO LÝ GX ÂM SA · ĐÀI MÔN · THUẦN HẬU</h2>
    <p>${cls?.name} — ${ky} — In ngày ${new Date().toLocaleDateString('vi-VN')}</p>
    <button onclick="window.print()" style="display:block;margin:0 auto 16px;padding:8px 20px;background:#0369A1;color:#fff;border:none;border-radius:8px;cursor:pointer">🖨 In</button>
    <table><thead><tr><th>#</th><th>Họ và Tên</th><th>Điểm thi</th><th>Xếp loại</th><th>Ghi chú</th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td>${r.i+1}</td><td>${fullName(r.s)}</td>
      <td class="${r.diem!==null&&r.diem<5?'red':''}">${r.diem!==null?r.diem.toFixed(1):'—'}</td>
      <td>${r.xl?.label||'—'}</td>
      <td style="color:${r.xl?.ghiChu?'red':''}">${r.xl?.ghiChu||''}</td>
    </tr>`).join('')}</tbody></table></body></html>`)
    win.document.close()
  }

  return (
    <div className="content">
      <div className="sec-hd"><div className="sec-title">⭐ Điểm Thi</div></div>

      {user.role==='admin' && (
        <div className="form-group">
          <label className="form-label">Lớp</label>
          <select className="form-input" value={classId} onChange={e=>setClassId(e.target.value)}>
            {myClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab==='nhap'?'active':''}`}    onClick={()=>setTab('nhap')}>📝 Nhập điểm</button>
        <button className={`tab ${tab==='tongket'?'active':''}`} onClick={()=>setTab('tongket')}>📊 Tổng kết</button>
      </div>

      {tab==='nhap' && (
        <>
          <div className="tabs">
            {HOC_KY.map((hk,idx)=>(
              <button key={hk.label} className={`tab ${hocKy===idx?'active':''}`}
                onClick={()=>{ setHocKy(idx); setKy(HOC_KY[idx].ky[0]) }}>{hk.label}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {HOC_KY[hocKy].ky.map(k=>(
              <button key={k} onClick={()=>setKy(k)} style={{
                flex:1, padding:'9px 12px', borderRadius:10, border:'none',
                fontFamily:'Nunito', fontWeight:800, fontSize:13, cursor:'pointer',
                background:ky===k?'var(--sky-dd)':'var(--sky-ll)',
                color:     ky===k?'#fff':'var(--sky-dd)',
              }}>{k}</button>
            ))}
          </div>

          <button className="btn btn-outline btn-full" style={{ marginBottom:14 }} onClick={printTable}>
            🖨 Xuất / In bảng điểm — {ky}
          </button>

          {classStudents.length===0 ? (
            <div className="empty"><div className="empty-icon">📝</div><div className="empty-text">Chưa có thiếu nhi</div></div>
          ) : (
            <div style={{ overflowX:'auto', borderRadius:14, boxShadow:'0 2px 12px var(--shadow)' }}>
              <table className="score-table">
                <thead><tr>
                  <th style={{ width:36 }}>#</th>
                  <th style={{ textAlign:'left', paddingLeft:10 }}>Họ tên</th>
                  <th>Điểm thi</th>
                  <th>Xếp loại</th>
                  <th>Ghi chú</th>
                </tr></thead>
                <tbody>
                  {classStudents.map((s,idx)=>{
                    const sc   = getScore(s.id)
                    const diem = getDiem(sc)
                    const xl   = xepLoaiDiem(diem)
                    return (
                      <tr key={s.id} onClick={()=>openScore(s)} style={{ cursor:'pointer' }}>
                        <td>{idx+1}</td>
                        <td style={{ textAlign:'left', paddingLeft:10, fontWeight:800, fontSize:12, maxWidth:140, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {fullName(s)}
                        </td>
                        <td style={diem!==null&&diem<5?{ color:'var(--red)', fontWeight:900 }:{ fontWeight:900, color:'var(--sky-dd)' }}>
                          {diem!==null ? diem.toFixed(1) : '—'}
                        </td>
                        <td>
                          {xl ? (
                            <span className={`badge ${xl.color==='green'?'badge-green':xl.color==='blue'?'badge-blue':xl.color==='red'?'badge-red':'badge'}`}
                              style={xl.color==='gray'?{ background:'#F1F5F9', color:'#475569' }:{}}>
                              {xl.label}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ fontSize:12, fontWeight:800, color:xl?.ghiChu?'var(--red)':'var(--gray)' }}>
                          {xl?.ghiChu||''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab==='tongket' && (
        <SummaryTable classId={classId} classStudents={classStudents} scores={scores}/>
      )}

      {/* Modal nhập điểm */}
      {modal && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-handle"/>
            <div className="modal-title">📝 {fullName(modal)}</div>
            <div style={{ background:'var(--sky-bg)', borderRadius:10, padding:'8px 12px', marginBottom:14, fontSize:12, fontWeight:700, color:'var(--sky-dd)' }}>
              {getClass(classId)?.name} · {ky}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color:formDiem!==null&&formDiem<5?'var(--red)':undefined }}>
                Điểm thi {formDiem!==null&&formDiem<5&&'— Thi lại ⚠️'}
              </label>
              <input className="form-input" type="number" min="0" max="10" step="0.5"
                placeholder="Nhập điểm (0 – 10)"
                value={form.diem||''}
                style={{ fontSize:22, fontWeight:900, textAlign:'center', borderColor:formDiem!==null&&formDiem<5?'var(--red)':undefined }}
                onChange={e=>setForm({...form,diem:e.target.value})}/>
            </div>

            {/* Preview xếp loại ngay khi nhập */}
            {formXl && (
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                <span className={`badge ${formXl.color==='green'?'badge-green':formXl.color==='blue'?'badge-blue':formXl.color==='red'?'badge-red':'badge'}`}
                  style={{ fontSize:14, padding:'6px 16px', ...(formXl.color==='gray'?{ background:'#F1F5F9', color:'#475569' }:{}) }}>
                  {formXl.label} {formXl.ghiChu && `— ${formXl.ghiChu}`}
                </span>
              </div>
            )}

            {formDiem!==null&&formDiem<5 && (
              <div style={{ background:'#FEF3C7', borderRadius:10, padding:'10px 14px', marginBottom:10 }}>
                <div style={{ fontWeight:900, fontSize:13, color:'#92400E' }}>⚠️ Điểm dưới 5 — Cần thi lại!</div>
              </div>
            )}
            {form.diem && oLaiPreview && (
              <div style={{ background:'#FEE2E2', borderRadius:10, padding:'10px 14px', marginBottom:10 }}>
                <div style={{ fontWeight:900, fontSize:13, color:'#991B1B' }}>🚨 ĐTB cả năm dưới 5 — Nguy cơ ở lại lớp!</div>
                <div style={{ fontSize:12, color:'#991B1B', fontWeight:700, marginTop:4 }}>ĐTB năm hiện tại: {yearAvgPrev}</div>
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={saveScore}>💾 Lưu điểm</button>
          </div>
        </div>
      )}
    </div>
  )
}