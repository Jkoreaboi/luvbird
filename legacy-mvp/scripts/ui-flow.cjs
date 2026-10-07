const {chromium}=require('../server/node_modules/playwright-core');
const chromiumBinary=require(require.resolve('@sparticuz/chromium',{paths:[require('path').resolve('server')]})).default;
const express=require('../server/node_modules/express');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const {createApp}=await import('../server/app.mjs');let now=Date.now();const {app:api,db}=createApp({filename:':memory:',mode:'test',clock:()=>now});
 const app=express();app.use(express.static(path.resolve('mobile/dist')));app.get('/app/{*path}',(_,res)=>res.sendFile(path.resolve('mobile/dist/index.html')));app.use(api);const server=await new Promise(resolve=>{const s=app.listen(4000,'127.0.0.1',()=>resolve(s));});
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||await chromiumBinary.executablePath(),args:chromiumBinary.args});
 const fontDir=path.resolve('server/node_modules/@fontsource/noto-sans-kr');
 const css=fs.readFileSync(path.join(fontDir,'400.css'),'utf8').replace(/url\(([^)]+)\)/g,(m,file)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join(fontDir,file.replace(/["']/g,''))).toString('base64')})`)+ '\n* {font-family:"Noto Sans KR",sans-serif !important;}';
 const errors=[];
 async function page(){const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Asia/Seoul'});const p=await ctx.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>console.log('REQUEST_FAILED',r.url(),r.failure()?.errorText));p.on('response',r=>{if(r.status()>=400)console.log('HTTP_ERROR',r.status(),r.url());});p.on('dialog',d=>d.accept());return p;}
 async function fonts(p){
 const jpDir=path.resolve('server/node_modules/@fontsource/noto-sans-jp');
 const jpCss=fs.readFileSync(path.join(jpDir,'400.css'),'utf8').replace(/url\(([^)]+)\)/g,(m,file)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join(jpDir,file.replace(/["']/g,''))).toString('base64')})`);
 await p.addStyleTag({content:css+jpCss+'\n* {font-family:"Noto Sans KR","Noto Sans JP",sans-serif !important;}'});await p.evaluate(()=>document.fonts.ready);
}
 async function load(p){await p.addInitScript(() => localStorage.setItem('dearbird-onboarding-v1','done'));await p.goto('http://localhost:4000');await fonts(p);await p.waitForTimeout(300);}
 async function screenshot(p,name){await fonts(p);await p.screenshot({path:`docs/screenshots/${name}.png`});}
 const a=await page(),b=await page();
 try{
 await load(a);await screenshot(a,'01-onboarding');
 await a.getByRole('button',{name:'DearBird 사용 가이드',exact:true}).click();await a.getByText('05 · 24시간의 기다림',{exact:true}).scrollIntoViewIfNeeded();await screenshot(a,'08-guide');await a.getByText('닫기',{exact:true}).click();
 await a.getByRole('button',{name:'Luvbird 소개',exact:true}).click();await a.getByText('우리가 만드는 것',{exact:true}).waitFor();await a.getByText('닫기',{exact:true}).click();
 await a.getByRole('button',{name:'App language',exact:true}).click();await a.getByRole('button',{name:'日本語',exact:true}).click();
 await a.getByRole('button',{name:'ログイン',exact:true}).waitFor();await a.reload();await fonts(a);await a.getByRole('button',{name:'ログイン',exact:true}).waitFor();await screenshot(a,'07-japanese');await a.getByRole('button',{name:'DearBird 使い方ガイド',exact:true}).click();await a.getByText('01 · あなたの小さな世界',{exact:true}).waitFor();await a.getByText('閉じる',{exact:true}).click();
 await a.getByRole('button',{name:'App language',exact:true}).click();await a.getByRole('button',{name:'English',exact:true}).click();await a.getByRole('button',{name:'Log in',exact:true}).waitFor();
 await a.getByRole('button',{name:'App language',exact:true}).click();await a.getByRole('button',{name:'한국어',exact:true}).click();
 await a.getByRole('button',{name:'가입하고 시작하기',exact:true}).click();
 await a.getByRole('textbox',{name:'이메일',exact:true}).fill('sunje-ui@example.com');
 await a.getByRole('textbox',{name:'비밀번호 (12자 이상)',exact:true}).fill('private-ui-test-2026');
 await a.getByRole('textbox',{name:'닉네임',exact:true}).fill('Sunje');
 await a.getByRole('textbox',{name:'나의 이야기',exact:true}).fill('서울에서 작은 일상을 모으고 있어요. 여행과 사진, 좋은 커피를 좋아해요.');
 await a.getByRole('textbox',{name:'만나고 싶은 펜팔',exact:true}).fill('서로의 평범한 하루를 나눌 친구');
 await a.getByRole('switch').click();await a.getByRole('button',{name:'가입하고 시작하기',exact:true}).click();
 await a.getByRole('tab',{name:'◎ 월드맵'}).waitFor();
 const response=await fetch('http://localhost:4000/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'emma-ui@example.com',password:'private-ui-test-2026',adult:true,profile:{mbti:'ENFP',purpose:'travel',travelCity:'Seoul',nickname:'Emma',city:'seattle',bio:'시애틀의 비 오는 날과 작은 책방을 좋아해요. 오늘 찍은 풍경을 편지에 담고 싶어요.',lookingFor:'사진과 일상을 나눌, 다정한 친구',interests:['photography','books','coffee'],languages:['en','ko'],avatar:'flower'}})});assert.equal(response.status,201);
 await a.reload();await fonts(a);await a.getByRole('tab',{name:'♧ 펜팔'}).click();await a.getByText('Emma',{exact:true}).first().click();await a.getByRole('button',{name:'펜팔 요청 보내기'}).click();await a.getByRole('button',{name:'요청을 보냈어요'}).waitFor();
 await load(b);await b.getByRole('textbox',{name:'이메일',exact:true}).fill('emma-ui@example.com');await b.getByRole('textbox',{name:'비밀번호 (12자 이상)',exact:true}).fill('private-ui-test-2026');await b.getByRole('button',{name:'로그인',exact:true}).click();await b.getByRole('tab',{name:'♧ 펜팔'}).click();await b.getByRole('button',{name:'수락',exact:true}).click();
 await a.reload();await fonts(a);await a.getByRole('tab',{name:'♧ 펜팔'}).click();await screenshot(a,'02-penpals');await a.getByText('Emma',{exact:true}).first().click();await a.getByRole('button',{name:'편지 쓰기',exact:true}).click();
 await a.getByRole('textbox',{name:'편지 쓰기',exact:true}).fill('오늘은 집으로 돌아가는 길에 조금 멀리 걸었어요.\n\n서울에도 가을 바람이 불기 시작했거든요. 이 편지가 도착할 때쯤 시애틀은 어떤 날씨일까요?\n\n당신의 평범한 하루도 궁금해요.');
 await a.route('**/photos',async route=>{ if(route.request().method()==='POST'){await route.fetch();await route.abort('failed');}else await route.continue();});
 const chooser=a.waitForEvent('filechooser');await a.getByRole('button',{name:/사진 추가/}).click();await (await chooser).setFiles(path.resolve('mobile/assets/icon.png'));await a.getByRole('button',{name:'다시 시도',exact:true}).waitFor();
 await a.reload();await fonts(a);await a.getByRole('tab',{name:'♧ 펜팔'}).click();await a.getByText('Emma',{exact:true}).first().click();await a.getByRole('button',{name:'편지 쓰기',exact:true}).click();
 await a.getByRole('button',{name:'다시 시도',exact:true}).waitFor();await a.unroute('**/photos');await a.getByRole('button',{name:'다시 시도',exact:true}).click();await a.getByRole('button',{name:/사진 추가 \(1\/3\)/}).waitFor();assert.equal(db.prepare('SELECT count(*) n FROM photos').get().n,1);
 await a.getByText('초안 저장됨',{exact:true}).waitFor();await a.getByText('Dear Emma,',{exact:true}).scrollIntoViewIfNeeded();await screenshot(a,'03-compose');
 await a.getByText('닫기',{exact:true}).click();await a.getByText('Emma',{exact:true}).first().click();await a.getByRole('button',{name:'편지 쓰기',exact:true}).click();assert.match(await a.getByRole('textbox',{name:'편지 쓰기',exact:true}).inputValue(),/가을 바람/);
 await a.getByRole('button',{name:'봉인하고 보내기'}).click();await a.getByText('마음이 출발했어요',{exact:true}).waitFor();await a.getByRole('button',{name:'월드맵',exact:true}).click();await screenshot(a,'04-world-map');
 await b.reload();await fonts(b);await b.getByRole('tab',{name:'✉ 우편함'}).click();await screenshot(b,'05-in-flight');
 now+=86400000;await b.reload();await fonts(b);await b.getByRole('tab',{name:'✉ 우편함'}).click();await b.getByRole('button',{name:'도착한 편지',exact:true}).click();await b.getByText('Sunje',{exact:true}).first().click();await b.getByRole('button',{name:'봉투 열기'}).click();await b.getByText(/오늘은 집으로/).waitFor();await screenshot(b,'06-open-letter');
 await b.getByRole('button',{name:'답장 쓰기'}).click();await b.getByRole('textbox',{name:'편지 쓰기',exact:true}).fill('시애틀에도 가을이 왔어요. 당신의 편지가 반가웠어요.');await b.getByRole('button',{name:'봉인하고 보내기'}).click();await b.getByText('마음이 출발했어요',{exact:true}).waitFor();
 assert.equal(db.prepare('SELECT count(*) n FROM letters').get().n,2);assert.equal(db.prepare('SELECT count(*) n FROM photos WHERE letter IS NOT NULL').get().n,1);assert.deepEqual(errors,[]);
 fs.writeFileSync('docs/ui-verification.json',JSON.stringify({passed:true,viewport:'390×844 browser rendering of React Native app',physicalDevice:false,checks:['Japanese/English/Korean switch and restart persistence','lost upload response and reload recovery without duplicate','UI registration','UI login','request and acceptance','image picker and authenticated photo upload','draft recovery','seal and send','world map','arrival with controlled server clock','open letter','reply'],consoleErrors:errors},null,2));console.log('UI_FLOW_PASS: registration, request, acceptance, photo, draft, send, map, arrival, open, reply');
 }catch(e){await a.screenshot({path:'docs/screenshots/ui-error-a.png'});await b.screenshot({path:'docs/screenshots/ui-error-b.png'});console.log('A_TEXT',await a.locator('body').innerText());console.log('B_TEXT',await b.locator('body').innerText());throw e;}
 finally{await browser.close();await new Promise(r=>server.close(r));db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
