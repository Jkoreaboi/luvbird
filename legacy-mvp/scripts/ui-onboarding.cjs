const { chromium } = require('../server/node_modules/playwright-core');
const binary = require(require.resolve('@sparticuz/chromium', { paths: [require('path').resolve('server')] })).default;
const express = require('../server/node_modules/express');
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
(async () => {
 const { createApp } = await import('../server/app.mjs');
 const ctx = createApp({filename:':memory:',mode:'test'});
 const app = express(); app.use(express.static(path.resolve('mobile/dist'))); app.get('/app/{*path}',(_,res)=>res.sendFile(path.resolve('mobile/dist/index.html')));app.use(ctx.app);
 const server = await new Promise(resolve=>{const s=app.listen(4000,'127.0.0.1',()=>resolve(s));});let browser,page;
 const register=async(email,nickname)=>(await fetch('http://localhost:4000/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'onboarding-test-password',adult:true,profile:{nickname,city:'seoul',bio:'사진과 산책, 평범한 하루의 이야기를 좋아해요.',lookingFor:'일상을 나눌 친구',interests:['사진','산책'],languages:['ko'],avatar:'flower'}})})).json();
 const fontDir=path.resolve('server/node_modules/@fontsource/noto-sans-kr');const css=fs.readFileSync(path.join(fontDir,'400.css'),'utf8').replace(/url\(([^)]+)\)/g,(_,f)=>`url(data:font/woff2;base64,${fs.readFileSync(path.join(fontDir,f.replace(/["']/g,''))).toString('base64')})`);
 const shot=async name=>{await page.addStyleTag({content:css+'\n* {font-family:"Noto Sans KR",sans-serif !important;}'});await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'docs/screenshots/'+name+'.png'});};
 try {
  await register('intro@example.com','Sunje');await register('intro-pal@example.com','Hana');
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||await binary.executablePath(),args:binary.args});page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(12000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/health',r=>r.abort());await page.goto('http://localhost:4000');
  await page.getByText('먼저, 펜팔을 만나요',{exact:true}).waitFor();await shot('11-onboarding-people');
  await page.getByRole('button',{name:'English',exact:true}).click();await page.getByText('Meet someone before you write',{exact:true}).waitFor();
  await page.getByRole('button',{name:'日本語',exact:true}).click();await page.getByText('手紙の前に、人と出会う',{exact:true}).waitFor();await page.getByRole('button',{name:'한국어',exact:true}).click();
  await page.getByRole('button',{name:'다음',exact:true}).click();await page.getByText('작은 인사로 연결돼요',{exact:true}).waitFor();
  await page.getByRole('button',{name:'이전',exact:true}).click();await page.getByText('먼저, 펜팔을 만나요',{exact:true}).waitFor();
  await page.getByRole('button',{name:'다음',exact:true}).click();await page.getByRole('button',{name:'다음',exact:true}).click();await shot('12-onboarding-letter');await page.getByRole('button',{name:'다음',exact:true}).click();await page.getByText('하루 뒤, 편지가 도착해요',{exact:true}).waitFor();
  await page.getByRole('button',{name:'시작하기',exact:true}).click();await page.getByRole('button',{name:'다시 연결하기',exact:true}).waitFor();await page.unroute('**/health');await page.getByRole('button',{name:'다시 연결하기',exact:true}).click();
  await page.getByRole('textbox',{name:'이메일',exact:true}).fill('intro@example.com');await page.getByRole('textbox',{name:'비밀번호 (12자 이상)',exact:true}).fill('onboarding-test-password');await page.getByRole('button',{name:'로그인',exact:true}).click();
  await page.getByRole('tab',{name:'♧ 펜팔',selected:true}).waitFor();await page.getByText('Hana',{exact:true}).waitFor();
  const card=await page.getByText('Hana',{exact:true}).boundingBox();assert(card.y<650,'A real profile is visible in the first viewport');assert.equal(await page.getByRole('textbox',{name:'관심사 검색'}).count(),0);await shot('13-people-first');
  await page.getByText('Hana',{exact:true}).click();await page.getByRole('button',{name:'펜팔 요청 보내기'}).click();await page.getByRole('button',{name:'요청을 보냈어요'}).waitFor();await page.reload();await page.getByRole('tab',{name:'♧ 펜팔',selected:true}).waitFor();
  await page.getByRole('tab',{name:'◉ 내 프로필'}).click();await page.getByRole('button',{name:'처음 사용법 다시 보기',exact:true}).click();await page.getByText('먼저, 펜팔을 만나요',{exact:true}).waitFor();await page.getByRole('button',{name:'건너뛰기',exact:true}).click();await page.getByRole('tab',{name:'◉ 내 프로필',selected:true}).waitFor();
  const fresh=await browser.newPage({viewport:{width:390,height:844}});await fresh.goto('http://localhost:4000');await fresh.evaluate(()=>{localStorage.clear();sessionStorage.clear();});await fresh.reload();await fresh.getByRole('button',{name:'건너뛰기',exact:true}).click();await fresh.getByRole('button',{name:'로그인',exact:true}).waitFor();await fresh.reload();await fresh.getByRole('button',{name:'로그인',exact:true}).waitFor();await fresh.getByRole('button',{name:'처음 사용법 다시 보기',exact:true}).click();await fresh.getByText('먼저, 펜팔을 만나요',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);fs.writeFileSync('docs/onboarding-ui-verification.json',JSON.stringify({passed:true,physicalDevice:false,checks:['tutorial before login even offline','four steps and back','three languages','completion persisted','default people tab','profile visible without scrolling','send request','replay from profile','skip persisted','replay from login'],consoleErrors:errors},null,2));console.log('ONBOARDING_UI_PASS');
 } catch(e) {if(page)console.log(await page.locator('body').innerText());throw e;}
 finally {if(browser)await browser.close();await new Promise(r=>server.close(r));ctx.db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
