import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
const digest = value => createHash('sha256').update(value).digest();
export function installOperations({ app, db, token, clock = Date.now }) {
  db.exec(`CREATE TABLE IF NOT EXISTS suspensions(user TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS report_actions(id TEXT PRIMARY KEY,report TEXT NOT NULL,action TEXT NOT NULL,note TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS report_versions(report TEXT PRIMARY KEY,version INTEGER NOT NULL DEFAULT 0);`);
  if (!token) return;
  if (token.length < 32) throw new Error('OPERATIONS_TOKEN must contain at least 32 characters');
  app.get('/ops', (_req,res) => res.type('html').send(page));
  app.get('/ops/app.js', (_req,res) => res.type('application/javascript').send(script));
  app.use('/ops/api', rateLimit({ windowMs: 60000, limit: 60, standardHeaders: true, legacyHeaders: false }), (req,res,next) => {
    const supplied = req.headers.authorization?.replace(/^Bearer /, '') || '';
    if (!timingSafeEqual(digest(supplied), digest(token))) return res.status(401).json({error:'운영자 인증이 필요합니다.'});
    next();
  });
  app.get('/ops/api/reports', (req,res) => {
    const status = String(req.query.status || 'open');
    if (!['open','reviewing','resolved','dismissed','all'].includes(status)) return res.status(400).json({error:'잘못된 상태입니다.'});
    const offset = Math.max(0, Math.min(100000, Number(req.query.offset) || 0));
    const rows = db.prepare(`SELECT r.*,coalesce(v.version,0) version,
      a.profile reporterProfile,b.profile targetProfile, s.user suspended
      FROM reports r LEFT JOIN users a ON a.id=r.reporter LEFT JOIN users b ON b.id=r.target
      LEFT JOIN suspensions s ON s.user=r.target LEFT JOIN report_versions v ON v.report=r.id
      WHERE (?='all' OR r.status=?) ORDER BY r.created DESC,r.id LIMIT 51 OFFSET ?`).all(status,status,offset);
    res.json({ more: rows.length > 50, items: rows.slice(0,50).map(({reporterProfile,targetProfile,...r}) => ({...r,
      reporterName: reporterProfile ? JSON.parse(reporterProfile).nickname : '삭제된 계정',
      targetName: targetProfile ? JSON.parse(targetProfile).nickname : '삭제된 계정',
      history: db.prepare('SELECT action,note,created FROM report_actions WHERE report=? ORDER BY created,id').all(r.id),
    })) });
  });
  app.post('/ops/api/reports/:id', (req,res) => {
    const { action, note, version } = req.body || {};
    if (!['reviewing','resolved','dismissed','open','suspend','restore'].includes(action) || typeof note !== 'string' || !note.trim() || note.length > 2000 || !Number.isInteger(version)) return res.status(400).json({error:'처리 상태와 1~2000자 메모를 입력해주세요.'});
    db.exec('BEGIN IMMEDIATE');
    try {
      const report = db.prepare('SELECT r.*,coalesce(v.version,0) version FROM reports r LEFT JOIN report_versions v ON v.report=r.id WHERE r.id=?').get(req.params.id);
      if (!report) { db.exec('ROLLBACK'); return res.status(404).json({error:'신고가 없습니다.'}); }
      if (report.version !== version) { db.exec('ROLLBACK'); return res.status(409).json({error:'다른 처리가 반영되었습니다. 새로고침 후 확인해주세요.'}); }
      if (['suspend','restore'].includes(action)) {
        if (!report.target) { db.exec('ROLLBACK'); return res.status(409).json({error:'이미 삭제된 계정입니다.'}); }
        if (action === 'suspend') {
          db.prepare('INSERT OR IGNORE INTO suspensions VALUES(?,?)').run(report.target,clock());
          db.prepare('DELETE FROM sessions WHERE user=?').run(report.target);
          db.prepare('DELETE FROM devices WHERE user=?').run(report.target);
        } else db.prepare('DELETE FROM suspensions WHERE user=?').run(report.target);
      } else db.prepare('UPDATE reports SET status=? WHERE id=?').run(action,report.id);
      db.prepare('INSERT INTO report_actions VALUES(?,?,?,?,?)').run(randomUUID(),report.id,action,note.trim(),clock());
      db.prepare('INSERT INTO report_versions VALUES(?,1) ON CONFLICT(report) DO UPDATE SET version=version+1').run(report.id);
      db.exec('COMMIT'); res.json({ok:true});
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  });
  app.use('/ops/api', (_req,res) => res.status(404).json({error:'not_found'}));
}
const page = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DearBird · 신고 관리</title>
<style>body{margin:0;background:#f7f5ee;color:#24464a;font:16px system-ui;padding:24px}main{max-width:900px;margin:auto}h1{font-size:32px}input,textarea,select,button{font:inherit;padding:12px;border:1px solid #bbc9c3;border-radius:10px;box-sizing:border-box}textarea{width:100%;min-height:80px}button{background:#24464a;color:white;cursor:pointer}button:disabled{opacity:.4}section,article{background:white;padding:22px;border-radius:18px;margin:16px 0}.row{display:flex;gap:10px;flex-wrap:wrap}p{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#526660}#message{min-height:24px}label{display:block;margin:12px 0}#token{width:100%}</style>
<main><small>LUVBIRD / OPERATIONS</small><h1>신고 관리</h1><p>신고 검토 · 처리 메모 · 계정 이용 제한</p><section id="login"><label>운영자 키<input id="token" type="password" autocomplete="off"></label><button id="connect">접속</button><p>키는 이 화면의 메모리에만 유지됩니다. 창을 닫으면 다시 입력해야 합니다.</p></section>
<section id="workspace" hidden><div class="row"><select id="filter" aria-label="신고 상태"><option value="open">미처리</option><option value="reviewing">검토 중</option><option value="resolved">처리 완료</option><option value="dismissed">기각</option><option value="all">전체</option></select><button id="refresh">새로고침</button><button id="logout">접속 종료</button></div><div id="reports"></div><div class="row"><button id="previous">이전</button><button id="next">다음</button></div></section><p id="message" role="status"></p></main><script src="/ops/app.js" defer></script></html>`;
const script = `let key='',offset=0;const $=id=>document.getElementById(id);const labels={open:'미처리',reviewing:'검토 중',resolved:'처리 완료',dismissed:'기각',suspend:'계정 이용 제한',restore:'제한 해제'};
async function api(path,body){const r=await fetch('/ops/api'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok){if(r.status===401)logout();throw Error(d.error||'요청 실패');}return d;}
function logout(){key='';$('token').value='';$('reports').replaceChildren();$('workspace').hidden=true;$('login').hidden=false;}
function text(tag,value,parent){const e=document.createElement(tag);e.textContent=value;parent.append(e);return e;}
async function load(){try{$('message').textContent='불러오는 중…';const d=await api('/reports?status='+$('filter').value+'&offset='+offset);$('reports').replaceChildren();$('login').hidden=true;$('workspace').hidden=false;$('previous').disabled=offset===0;$('next').disabled=!d.more;
for(const r of d.items){const box=document.createElement('article');$('reports').append(box);text('h2',r.targetName+' · '+labels[r.status],box);text('small','신고자: '+r.reporterName+' · '+new Date(r.created).toLocaleString(),box);text('p',r.reason,box);text('p',r.suspended?'계정 이용 제한 중':'계정 이용 제한 없음',box);text('small','신고 ID: '+r.id,box);const details=document.createElement('details');box.append(details);text('summary','처리 이력 ('+r.history.length+')',details);for(const h of r.history)text('p',labels[h.action]+' · '+new Date(h.created).toLocaleString()+'\\n'+h.note,details);
const note=document.createElement('textarea');note.placeholder='판단 근거와 조치 내용을 남겨주세요.';note.setAttribute('aria-label','처리 메모');note.maxLength=2000;box.append(note);const select=document.createElement('select');select.setAttribute('aria-label','처리 조치');for(const action of ['reviewing','resolved','dismissed','open',r.suspended?'restore':'suspend']){const o=document.createElement('option');o.value=action;o.textContent=labels[action];select.append(o);}box.append(select);const button=text('button','조치 저장',box);button.onclick=async()=>{if(!note.value.trim()){$('message').textContent='처리 메모를 입력해주세요.';return;}if(['suspend','restore'].includes(select.value)&&!confirm(r.targetName+': '+labels[select.value]+' 하시겠어요?'))return;button.disabled=true;try{await api('/reports/'+encodeURIComponent(r.id),{action:select.value,note:note.value,version:r.version});await load();$('message').textContent='조치와 이력을 저장했습니다.';}catch(e){$('message').textContent=e.message;}finally{button.disabled=false;}};}
$('message').textContent=d.items.length?'신고 '+d.items.length+'건':'해당 상태의 신고가 없습니다.';}catch(e){$('message').textContent=e.message;}}
$('connect').onclick=()=>{key=$('token').value;$('token').value='';offset=0;load();};$('logout').onclick=logout;$('refresh').onclick=load;$('filter').onchange=()=>{offset=0;load();};$('previous').onclick=()=>{offset=Math.max(0,offset-50);load();};$('next').onclick=()=>{offset+=50;load();};`;
