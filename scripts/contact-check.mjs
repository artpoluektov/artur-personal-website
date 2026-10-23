import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/contact.js';
const url='https://artur-personal-website.pages.dev/api/contact',env={RESEND_API_KEY:'test-secret'};
const originalFetch=globalThis.fetch, originalNow=Date.now;
let now=originalNow(),calls=0,sent;
Date.now=()=>now;
const invoke=(method='GET',data,headers={})=>onRequest({request:new Request(url,{method,headers:{Origin:new URL(url).origin,'Content-Type':'application/json',...headers},...(data===undefined?{}:{body:JSON.stringify(data)})}),env});
try {
 const token=(await (await invoke()).json()).token;
 now+=5000;
 const valid={token,name:'Test',email:'sender@example.com',company:'https://example.com',role:'Other',message:'Test enquiry',interest:[],consent:'on',website_confirm:''};
 globalThis.fetch=async (_url,options)=>{calls++;sent=JSON.parse(options.body);return Response.json({id:'test-id'})};
 assert.equal((await invoke('POST',{...valid,email:'bad'})).status,400);
 assert.equal((await invoke('POST',{...valid,consent:''})).status,400);
 assert.equal((await invoke('POST',{...valid,website_confirm:'spam'})).status,400);
 assert.equal((await invoke('POST',{...valid,token:'forged'})).status,400);
 assert.equal((await invoke('POST',valid,{Origin:'https://evil.example'})).status,403);
 assert.equal(calls,0);
 assert.equal((await invoke('POST',valid)).status,200);
 assert.deepEqual(sent.to,['art.cpm@gmail.com']);assert.equal(sent.reply_to,valid.email);
 globalThis.fetch=async()=>Response.json({error:'failed'},{status:500});
 assert.equal((await invoke('POST',valid)).status,502);
 const missing=await onRequest({request:new Request(url),env:{}});assert.equal(missing.status,503);
 now+=1800001;assert.equal((await invoke('POST',valid)).status,400);
 console.log('PASS: contact validation, origin, honeypot, signed token, recipient, provider failure, missing secret and expiry');
} finally {globalThis.fetch=originalFetch;Date.now=originalNow;}
