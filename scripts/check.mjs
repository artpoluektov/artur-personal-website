import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const html=readFileSync('index.html','utf8'),c=JSON.parse(readFileSync('content.json')),source=readFileSync('docs/approved-copy.md','utf8');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const norm=s=>decode(s).replace(/\s+/g,' ').trim();
const text=norm(html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<\/(p|h[1-6]|div|summary|span|details|section|figcaption|blockquote)>/g,' ').replace(/<[^>]+>/g,''));
let checked=0;function content(value,path=''){if(typeof value==='string'){if(path.endsWith('.body')||path.includes('.paragraphs.')||path.includes('.intro.')||/\.(title|headline|intro|proof|stage|closing|framework|signoff|writing|by|text)$/.test(path)){assert.ok(text.includes(norm(value)),`Missing HTML copy ${path}`);assert.ok(norm(source.replaceAll('**','').replaceAll('<u>','').replaceAll('</u>','')).includes(norm(value)),`Unapproved copy ${path}`);checked++}}else if(value&&typeof value==='object')for(const [k,v]of Object.entries(value))content(v,path+'.'+k)}
for(const id of ['hero','situations','bets','how','testimonials','about','thinking','mentoring','faq','contact'])content(c[id],id);
// Every full substantive paragraph in the approved content must survive, including collapsed text.
const approved=source.split('## Header and footer')[0].split('## Opening (hero)')[1];
for(let line of approved.split('\n')){line=line.trim();if(!line||line.startsWith('*')||line.startsWith('#')||line.startsWith('>')||line.startsWith('<')||line.startsWith('---')||line.startsWith('Required')||line.startsWith('Optional')||line.startsWith('- '))continue;if(line.length<80)continue;if(line===c.about.companies.join(' · ')){for(const company of c.about.companies)assert.ok(decode(html).includes(`alt="${company}"`),`Missing company logo ${company}`);continue;}line=line.replace(/ \*\(optional closing line, can be cut\)\*/,'');assert.ok(text.includes(norm(line)),`Dropped approved paragraph: ${line.slice(0,70)}`)}
assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/<main>/g)||[]).length,1);assert.ok(!text.includes('Block ID:'));assert.ok(!text.includes('coming soon'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate ids');
for(const [,url]of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(url.startsWith('#'))assert.ok(ids.includes(url.slice(1).split('?')[0]),`Broken anchor ${url}`);else if(!/^(https:|mailto:)/.test(url))assert.ok(existsSync(decode(url)),`Missing asset ${url}`)}
for(const [,tag]of html.matchAll(/(<a\b[^>]+target="_blank"[^>]*>)/g))assert.ok(tag.includes('rel="noopener"'));
const cfg=JSON.parse(readFileSync('config.json'));assert.equal(html.includes('type="submit" disabled'),!cfg.formEndpoint,'Form availability matches configuration');
assert.equal(c.testimonials.quotes.length,2);assert.equal(c.faq.items.length,7);assert.equal(c.situations.cards.length,5);
assert.ok(/<details open>/.test(html));assert.ok(!/<iframe/.test(html));assert.ok(!/<script[^>]+src="https:/.test(html));
JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
function lum(hex){const rgb=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722}
for(const [fg,bg]of [['ffffff','2c1e4a'],['222222','f4f4f4'],['23182f','e94f37'],['ffffff','5b3bb6'],['ffa28e','2c1e4a'],['503290','f0eafa']]){let l=[lum(fg),lum(bg)].sort((a,b)=>b-a);let ratio=(l[0]+.05)/(l[1]+.05);assert.ok(ratio>=4.5,`${fg}/${bg}: ${ratio}`);console.log(`Contrast ${fg}/${bg}: ${ratio.toFixed(2)}:1`)}
console.log(`PASS: ${checked} approved text groups, full paragraphs, assets, anchors, metadata, form availability and contrast.`);
