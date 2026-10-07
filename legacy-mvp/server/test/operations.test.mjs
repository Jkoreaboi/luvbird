import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../app.mjs';
import { commonGround, connectionCopy } from '../../mobile/src/connection.ts';
const token = 'test-operations-secret-'.repeat(3);
const register = email => ({ email,password:'test-password-1234',adult:true,profile:{nickname:'Tester',city:'seoul',bio:'',lookingFor:'',interests:[],languages:['ko'],avatar:'dove'} });
test('operator routes require separate credentials, audit changes, reject stale changes and enforce reversible suspension',async t=>{
 const ctx=createApp({filename:':memory:',mode:'test',operationsToken:token});t.after(()=>ctx.db.close());const api=request(ctx.app);
 const a=(await api.post('/auth/register').send(register('a@example.com'))).body;
 const b=(await api.post('/auth/register').send(register('b@example.com'))).body;
 const as=(who,method,path)=>api[method](path).set('Authorization','Bearer '+who.token);
 await as(a,'post','/reports').send({target:b.profile.id,reason:'spam repeated unwanted requests'});
 assert.equal((await api.get('/ops/api/reports')).status,401);
 assert.equal((await as(a,'get','/ops/api/reports')).status,401);
 const ops=(method,path)=>api[method](path).set('Authorization','Bearer '+token);
 const report=(await ops('get','/ops/api/reports')).body.items[0];assert.ok(report);
 assert.equal((await ops('post','/ops/api/reports/'+report.id).send({action:'resolved',note:'',version:0})).status,400);
 assert.equal((await ops('post','/ops/api/reports/'+report.id).send({action:'reviewing',note:'Checking repeat reports',version:0})).status,200);
 assert.equal((await ops('post','/ops/api/reports/'+report.id).send({action:'resolved',note:'stale',version:0})).status,409);
 assert.equal((await ops('post','/ops/api/reports/'+report.id).send({action:'suspend',note:'Repeated spam confirmed',version:1})).status,200);
 assert.equal((await as(b,'get','/me')).status,401);
 assert.equal((await api.post('/auth/login').send(register('b@example.com'))).body.error,'account_suspended');
 assert.equal((await as(a,'get','/profiles')).body.length,0);
 assert.equal((await as(a,'post','/requests').send({recipient:b.profile.id})).status,400);
 assert.equal((await ops('post','/ops/api/reports/'+report.id).send({action:'restore',note:'Review completed; restriction lifted',version:2})).status,200);
 assert.equal((await api.post('/auth/login').send(register('b@example.com'))).status,200);
 assert.equal((await ops('post','/ops/api/reports/'+report.id).send({action:'resolved',note:'Resolved',version:3})).status,200);
 const result=(await ops('get','/ops/api/reports?status=resolved')).body.items[0];assert.equal(result.history.length,4);assert.equal(result.version,4);
 assert.equal(JSON.stringify(result).includes('password'),false);assert.equal(JSON.stringify(result).includes('a@example.com'),false);
});
test('operator endpoints are disabled without server configuration', async t=>{
 const ctx=createApp({filename:':memory:',mode:'test'});t.after(()=>ctx.db.close());
 assert.notEqual((await request(ctx.app).get('/ops')).status,200);
});
test('common ground normalizes user input but does not infer interests or purpose',()=>{
 assert.deepEqual(commonGround({languages:['ko'],interests:[' Books '],purpose:'letters'},{languages:['ko','en'],interests:['books','music'],purpose:'travel'}),{languages:['ko'],interests:['books'],purpose:false});
 assert.deepEqual(commonGround({languages:['ko'],interests:['독서']},{languages:['en'],interests:['books']}),{languages:[],interests:[],purpose:false});
 for(const lang of ['ko','en','ja']) {assert.deepEqual(Object.keys(connectionCopy[lang]),Object.keys(connectionCopy.ko));assert.ok(Object.values(connectionCopy[lang]).every(x=>x.trim()));}
});
