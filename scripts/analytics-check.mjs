import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('./analytics.js',import.meta.url),'utf8');
function setup(saved,host='arturpoluektov.com'){
 const handlers={},elements={},scripts=[],cookies=[],events={};let stored=saved,reloads=0;
 function el(key){return elements[key]??={checked:false,hidden:false,open:false,dataset:{consent:key},addEventListener:(type,fn)=>handlers[key+':'+type]=fn,close(){this.open=false},showModal(){this.open=true}}}
 const document={referrer:'https://example.com/?email=private@example.com',head:{append:x=>scripts.push(x)},createElement:()=>({}),querySelector:s=>s.startsWith('meta')?{content:'G-MJN0TCR2MT'}:el(s),querySelectorAll:s=>s==='[data-consent]'?['accept','reject'].map(el):[el('settings')],addEventListener:(type,fn)=>events[type]=fn};
 Object.defineProperty(document,'cookie',{get:()=> '_ga=abc; _ga_MJN0TCR2MT=xyz; essential=yes',set:x=>cookies.push(x)});
 const window={addEventListener:(type,fn)=>events[type]=fn};const context={document,window,localStorage:{getItem:()=>stored,setItem:(k,v)=>stored=v},location:{hostname:host,href:'https://'+host+'/?email=private@example.com#contact',reload:()=>reloads++},URL,Date};vm.runInNewContext(source,context);
 return {scripts,cookies,window,elements,events,click:k=>handlers[k+':click'](),stored:()=>JSON.parse(stored),reloads:()=>reloads};
}
let t=setup(null);assert.equal(t.scripts.length,0);assert.equal(t.elements['#cookie-banner'].hidden,false);t.click('reject');assert.equal(t.scripts.length,0);assert.equal(t.stored().analytics,false);
t=setup(null);t.click('accept');assert.equal(t.scripts.length,1);const commands=t.window.dataLayer.map(x=>Array.from(x));const config=commands.find(x=>x[0]==='config')[2];assert.equal(config.page_location,'https://arturpoluektov.com/');assert.equal(config.page_referrer,'https://example.com/');assert.equal(config.allow_google_signals,false);assert.equal(commands[0][2].ad_storage,'denied');t.click('accept');assert.equal(t.scripts.length,1);
t.events['contact-success']();assert.equal(t.window.dataLayer.at(-1)[1],'generate_lead');t.elements['#analytics-choice'].checked=false;t.click('#save-consent');assert.equal(t.window['ga-disable-G-MJN0TCR2MT'],true);assert.equal(t.reloads(),1);const count=t.window.dataLayer.length;t.events['contact-success']();assert.equal(t.window.dataLayer.length,count);assert.ok(t.cookies.every(x=>!x.startsWith('essential=')));
t=setup(JSON.stringify({version:2,timestamp:Date.now(),analytics:true}));assert.equal(t.scripts.length,1);
t=setup(JSON.stringify({version:1,timestamp:Date.now(),analytics:false}));assert.equal(t.scripts.length,0);assert.equal(t.elements['#cookie-banner'].hidden,false);
t=setup(JSON.stringify({version:2,timestamp:Date.now()-181*86400000,analytics:true}));assert.equal(t.scripts.length,0);
t=setup(null,'localhost');t.click('accept');assert.equal(t.scripts.length,0);
console.log('PASS: consent, rejection, remembered choice, expiry, legacy choice, withdrawal, clean URLs, fixed events and preview exclusion');
