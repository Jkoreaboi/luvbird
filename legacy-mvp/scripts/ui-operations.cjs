const {chromium}=require('../server/node_modules/playwright-core');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const {createApp}=await import('../server/app.mjs');const key='ui-test-only-operator-key-'.repeat(3);const ctx=createApp({filename:':memory:',mode:'test',operationsToken:key});
 const server=await new Promise(resolve=>{const s=ctx.app.listen(4000,'127.0.0.1',()=>resolve(s));});let browser;
 try {
 const register=async(email,nickname)=>(await fetch('http://localhost:4000/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'operations-ui-password',adult:true,profile:{nickname,city:'seoul',bio:'',lookingFor:'',interests:[],languages:['ko'],avatar:'dove'}})})).json();
 const a=await register('reporter@example.com','테스트 신고자'),b=await register('reported@example.com','테스트 대상');
 await fetch('http://localhost:4000/reports',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+a.token},body:JSON.stringify({target:b.profile.id,reason:'<img src=x onerror=alert(1)> 반복적인 원치 않는 요청 — 테스트 신고'})});
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1100,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto('http://localhost:4000/ops');
 await page.getByLabel('운영자 키').fill('wrong');await page.getByRole('button',{name:'접속',exact:true}).click();await page.getByText('운영자 인증이 필요합니다.',{exact:true}).waitFor();
 await page.getByLabel('운영자 키').fill(key);await page.getByRole('button',{name:'접속',exact:true}).click();await page.getByText('테스트 대상 · 미처리',{exact:true}).waitFor();assert.equal(await page.locator('article img').count(),0);
 await page.getByLabel('처리 메모').fill('테스트 검토: 반복 요청 내용을 확인했습니다.');await page.getByLabel('처리 조치').selectOption('reviewing');await page.getByRole('button',{name:'조치 저장'}).click();await page.getByText('조치와 이력을 저장했습니다.',{exact:true}).waitFor();
 await page.getByLabel('신고 상태').selectOption('reviewing');await page.getByText('테스트 대상 · 검토 중',{exact:true}).waitFor();await page.getByLabel('처리 메모').fill('테스트 조치: 이용 제한 적용.');await page.getByLabel('처리 조치').selectOption('suspend');await page.getByRole('button',{name:'조치 저장'}).click();await page.getByText('계정 이용 제한 중',{exact:true}).waitFor();
 await page.getByText('처리 이력 (2)',{exact:true}).click();const fontDir=path.resolve('server/node_modules/@fontsource/noto-sans-kr');
 const css=fs.readFileSync(path.join(fontDir,'400.css'),'utf8').replace(/url\(([^)]+)\)/g,(_,f)=>'url(data:font/woff2;base64,'+fs.readFileSync(path.join(fontDir,f.replace(/["']/g,''))).toString('base64')+')');
 await page.addStyleTag({content:css+'\n*{font-family:"Noto Sans KR",sans-serif!important}'});await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:'docs/screenshots/16-operations.png',fullPage:true});
 await page.getByRole('button',{name:'접속 종료'}).click();assert.equal(await page.locator('article').count(),0);assert.deepEqual(errors,[]);
 fs.writeFileSync('docs/operations-ui-verification.json',JSON.stringify({passed:true,checks:['wrong key rejected','report text rendered without HTML','review status and mandatory note','suspend account','audit history','logout clears reports'],realUsers:false},null,2));console.log('OPERATIONS_UI_PASS');
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));ctx.db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
