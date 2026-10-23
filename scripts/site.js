'use strict';
document.documentElement.classList.add('js');
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#primary-nav');
function closeMenu(){menu.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false')}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('is-open',open)});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){closeMenu();menuButton.focus()}});
const form=document.querySelector('#contact-form');
let contactToken='';
const tokenReady=form.dataset.endpoint?fetch(form.dataset.endpoint).then(r=>r.ok?r.json():Promise.reject()).then(data=>{contactToken=data.token||''}).catch(()=>{}):Promise.resolve();
function updateInterests(){const selected=[...form.querySelectorAll('[name=interest]:checked')].map(x=>x.value);const speaking=selected.includes('Speaking');const hide=speaking||selected.includes('Mentoring');document.querySelector('#event-fields').hidden=!speaking;document.querySelectorAll('#event-fields input').forEach(x=>x.disabled=!speaking);for(const name of ['timeline','budget']){const row=form.querySelector(`[data-field=${name}]`);row.hidden=hide;row.querySelector('select').disabled=hide}}
form.addEventListener('change',updateInterests);
function routeInterest(){const [id,query]=location.hash.slice(1).split('?');if(id!=='contact'||!query)return;const interest=new URLSearchParams(query).get('interest');const input=[...form.querySelectorAll('[name=interest]')].find(x=>x.value.toLowerCase()===interest);if(input){input.checked=true;updateInterests();document.querySelector('#contact').scrollIntoView()}}
window.addEventListener('hashchange',routeInterest);routeInterest();updateInterests();
function validate(input){const valid=input.type==='checkbox'?input.checked:input.value.trim().length>0&&input.validity.valid;input.setAttribute('aria-invalid',String(!valid));const error=document.getElementById(input.getAttribute('aria-describedby'));if(error)error.hidden=valid;return valid}
form.querySelectorAll('[required]').forEach(input=>{input.addEventListener('blur',()=>validate(input));input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true')validate(input)})});
form.addEventListener('submit',async event=>{event.preventDefault();const status=document.querySelector('#form-status');if(!form.dataset.endpoint)return;const invalid=[...form.querySelectorAll('[required]')].filter(x=>!validate(x));if(invalid.length){invalid[0].focus();return}const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='';const data=new FormData(form);const payload=Object.fromEntries(data);payload.interest=data.getAll('interest');try{await tokenReady;if(!contactToken)throw Error('Unavailable');payload.token=contactToken;const response=await fetch(form.dataset.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Rejected');const result=await response.json();if(result.ok!==true)throw Error('Unconfirmed');const thanks=document.createElement('p');thanks.setAttribute('role','status');thanks.tabIndex=-1;thanks.textContent=form.dataset.thanks;form.replaceWith(thanks);thanks.focus()}catch{status.textContent=form.dataset.failed;button.disabled=false;fetch(form.dataset.endpoint).then(r=>r.json()).then(data=>{contactToken=data.token||''}).catch(()=>{})}});
const key='ap-cookie-choice',version=1;
const banner=document.querySelector('#cookie-banner'),dialog=document.querySelector('#cookie-dialog');
function readChoice(){try{const c=JSON.parse(localStorage.getItem(key));return c?.version===version&&Number.isFinite(c.timestamp)&&Date.now()-c.timestamp<365*86400000?c:null}catch{return null}}
banner.hidden=Boolean(readChoice());
function saveChoice(choice){try{localStorage.setItem(key,JSON.stringify({essential:true,analytics:false,choice,timestamp:Date.now(),version}))}catch{/* The site remains usable when storage is unavailable. */}banner.hidden=true;if(dialog.open)dialog.close()}
document.querySelectorAll('[data-consent]').forEach(b=>b.addEventListener('click',()=>saveChoice(b.dataset.consent)));
document.querySelectorAll('.cookie-open').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
document.querySelector('#save-consent').addEventListener('click',()=>saveChoice('custom'));

const logoToggle=document.querySelector('.logo-toggle');
logoToggle.addEventListener('click',()=>{const paused=logoToggle.getAttribute('aria-pressed')!=='true';logoToggle.setAttribute('aria-pressed',String(paused));logoToggle.closest('.companies').classList.toggle('is-paused',paused);logoToggle.textContent=paused?'Resume logos':'Pause logos'});
