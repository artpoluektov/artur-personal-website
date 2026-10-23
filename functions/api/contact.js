const origins = new Set(['https://arturpoluektov.com', 'https://www.arturpoluektov.com', 'https://artur-personal-website.pages.dev']);
const reply = (status, data) => Response.json(data, {status, headers: {'Cache-Control':'no-store'}});
const attempts = new Map(); // Best-effort per-isolate throttle; not a global quota.
const encoder = new TextEncoder();
async function sign(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))), b=>b.toString(16).padStart(2,'0')).join('');
}
export async function onRequest({request, env}) {
  const origin = new URL(request.url).origin;
  if (!origins.has(origin)) return reply(403,{ok:false});
  if (!env.RESEND_API_KEY) return reply(503,{ok:false});
  if (request.method === 'GET') {
    const token = `${Date.now()}.${crypto.randomUUID()}`;
    return reply(200,{token:token+'.'+await sign(token,env.RESEND_API_KEY)});
  }
  if (request.method !== 'POST') return reply(405,{ok:false});
  if (request.headers.get('Origin') !== origin) return reply(403,{ok:false});
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415,{ok:false});
  if (Number(request.headers.get('Content-Length')) > 16000) return reply(413,{ok:false});
  let data;
  try { const raw = await request.text(); if (encoder.encode(raw).length > 16000) return reply(413,{ok:false}); data=JSON.parse(raw); } catch {return reply(400,{ok:false});}
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400,{ok:false});
  if (typeof data.token !== 'string' || data.token.length > 150) return reply(400,{ok:false});
  const [time, nonce, signature] = data.token.split('.');
  const age = Date.now()-Number(time);
  if (!nonce || !Number.isFinite(age) || age<3000 || age>1800000 || signature !== await sign(`${time}.${nonce}`,env.RESEND_API_KEY)) return reply(400,{ok:false});
  if (data.website_confirm || data.consent !== 'on') return reply(400,{ok:false});
  const required=['name','email','company','role','message'];
  for (const field of required) if (typeof data[field]!=='string' || !data[field].trim() || data[field].length>(field==='message'?6000:300)) return reply(400,{ok:false});
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) || /[\r\n]/.test(data.email)) return reply(400,{ok:false});
  const optional=['timeline','budget','source','event0','event1','event2','event3','event4'];
  for (const field of optional) if (data[field]!==undefined && (typeof data[field]!=='string' || data[field].length>300)) return reply(400,{ok:false});
  if (!Array.isArray(data.interest) || data.interest.length>7 || data.interest.some(x=>typeof x!=='string'||x.length>100)) return reply(400,{ok:false});
  const now=Date.now(), ip=request.headers.get('CF-Connecting-IP')||'unknown';
  for (const [key,value] of attempts) if (now-value.start>600000) attempts.delete(key);
  const rate=attempts.get(ip)||{start:now,count:0};
  if (rate.count>=5) return reply(429,{ok:false});
  rate.count++;attempts.set(ip,rate);
  const labels={name:'Name',email:'Email',company:'Company website',role:'Role',message:'Message',timeline:'Timeline',budget:'Budget',source:'How they found you',event0:'Event name and date',event1:'Audience and format',event2:'Event detail 3',event3:'Event detail 4',event4:'Event detail 5'};
  const text=[...required,...optional].filter(k=>data[k]).map(k=>`${labels[k]}: ${data[k].trim()}`).join('\n\n')+`\n\nInterests: ${data.interest.join(', ') || 'Not specified'}\n\nConsent to reply: yes`;
  try {
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`contact-${nonce}`},body:JSON.stringify({from:'Artur website <contact@arturpoluektov.com>',to:['art.cpm@gmail.com'],reply_to:data.email.trim(),subject:'New website enquiry',text}),signal:AbortSignal.timeout(10000)});
    const result=await response.json();
    if (!response.ok || !result.id) return reply(502,{ok:false});
    return reply(200,{ok:true});
  } catch {return reply(502,{ok:false});}
}
