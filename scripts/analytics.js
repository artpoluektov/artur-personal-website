'use strict';
// Basic consent mode: Google receives no request until analytics is accepted.
(()=>{
  const id=document.querySelector('meta[name="ga-measurement-id"]')?.content||'';
  const enabled=/^G-[A-Z0-9]+$/.test(id)&&location.hostname==='arturpoluektov.com';
  const key='ap-cookie-choice',version=2;
  const banner=document.querySelector('#cookie-banner'),dialog=document.querySelector('#cookie-dialog'),choice=document.querySelector('#analytics-choice');
  let started=false,allowed=false;
  function readChoice(){try{const c=JSON.parse(localStorage.getItem(key));const age=Date.now()-c.timestamp;return c.version===version&&Number.isFinite(age)&&age>=0&&age<180*86400000?c:null}catch{return null}}
  function cleanURL(value){try{const url=new URL(value);return url.origin+url.pathname}catch{return ''}}
  function clearCookies(){for(const cookie of document.cookie.split(';')){const name=cookie.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=`${name}=; Max-Age=0; Path=/;${domain?' Domain='+domain+';':''} SameSite=Lax; Secure`}}
  function start(){if(started||!allowed||!enabled)return;started=true;window['ga-disable-'+id]=false;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',id,{page_location:cleanURL(location.href),page_referrer:cleanURL(document.referrer),allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,cookie_update:false});
    const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;script.id='google-analytics';document.head.append(script);
  }
  function apply(value){allowed=value===true;if(allowed)start();else{window['ga-disable-'+id]=true;clearCookies()}}
  const saved=readChoice();banner.hidden=Boolean(saved);choice.checked=saved?.analytics===true;apply(choice.checked);
  function save(kind){const accepted=kind==='accept'||(kind==='custom'&&choice.checked);const reload=started&&!accepted;try{localStorage.setItem(key,JSON.stringify({version,essential:true,analytics:accepted,choice:kind,timestamp:Date.now()}))}catch{}choice.checked=accepted;apply(accepted);banner.hidden=true;if(dialog.open)dialog.close();if(reload)location.reload()}
  document.querySelectorAll('[data-consent]').forEach(b=>b.addEventListener('click',()=>save(b.dataset.consent)));
  document.querySelectorAll('.cookie-open').forEach(b=>b.addEventListener('click',()=>{choice.checked=allowed;dialog.showModal()}));
  document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  document.querySelector('#save-consent').addEventListener('click',()=>save('custom'));
  window.addEventListener('storage',event=>{if(event.key===key){const c=readChoice();const reload=started&&c?.analytics!==true;apply(c?.analytics===true);choice.checked=allowed;banner.hidden=Boolean(c);if(reload)location.reload()}});
  // Only fixed event names: no names, email addresses, messages or form values.
  function track(name){if(allowed&&enabled&&started)window.gtag('event',name)}
  document.addEventListener('contact-success',()=>track('generate_lead'));
  document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;try{if(new URL(link.href).hostname==='cal.com')track('clarity_call_click')}catch{}});
})();
