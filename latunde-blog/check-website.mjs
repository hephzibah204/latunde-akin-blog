import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const dist=path.join(root,'dist');
const posts=JSON.parse(await fs.readFile(path.join(dist,'posts.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(dist,'site-manifest.json'),'utf8'));
const errors=[];
if(new Set(manifest.postIds).size!==posts.length)errors.push('Archive ID count changed');
let files=0;
async function check(file){const html=await fs.readFile(file,'utf8');files++;const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');for(const m of markup.matchAll(/(?:href|src)="([^"#]+)"/g)){const url=m[1];if(/^(https?:|data:|mailto:|tel:|javascript:)/.test(url))continue;const local=decodeURIComponent(url.split('#')[0].split('?')[0]);let target=local.startsWith('/')?path.join(dist,local.slice(1)):path.resolve(path.dirname(file),local);if(local.endsWith('/'))target=path.join(target,'index.html');try{await fs.access(target);}catch{errors.push(`${path.relative(dist,file)}: missing ${url}`);}}for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(/type="application\/ld\+json"/.test(match[1])){try{JSON.parse(match[2]);}catch{errors.push(`${file}: invalid JSON-LD`);}continue;}if(match[2].trim())try{new vm.Script(match[2]);}catch(e){errors.push(`${file}: invalid script ${e.message}`);}}}
for(const route of manifest.pages)await check(path.join(dist,route.slice(1),'index.html'));
for(const p of posts){const file=path.join(dist,'p',p.id+'.html');await check(file);const html=await fs.readFile(file,'utf8');const normalized=p.text.split('\n\n').filter(Boolean).map(para=>para.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])).replace(/\n/g,'<br>'));if(normalized.some(para=>!html.includes(para)))errors.push('Article text changed: '+p.id);}
for(const name of ['ministry.js'])new vm.Script(await fs.readFile(path.join(dist,'assets',name),'utf8'));
// Exercise the prayer handoff without contacting WhatsApp or sending a message.
const handlers={};let destination='';let validity='';let reported=false;
const fields={
  '#prayer-form':{addEventListener:(name,fn)=>handlers[name]=fn},
  '#prayer-message':{value:'Please pray for peace & strength. 🙏',addEventListener(){},setCustomValidity:value=>validity=value,reportValidity:()=>reported=true},
  '#prayer-name':{value:'Test & Example'},
  '#prayer-reply':{checked:true},
  '#prayer-submit':{disabled:true}
};
const location={hash:'',pathname:'/prayer-request/',assign:value=>destination=value};
vm.runInNewContext(await fs.readFile(path.join(dist,'assets/ministry.js'),'utf8'),{location,document:{documentElement:{classList:{add(){}}},querySelector:key=>fields[key]||null,querySelectorAll:()=>[],addEventListener(){}},encodeURIComponent});
handlers.submit({preventDefault(){}});
const url=new URL(destination);const message=url.searchParams.get('text');
if(url.origin!=='https://wa.me'||url.pathname!=='/2348123428989'||!message.includes(fields['#prayer-message'].value)||!message.includes('Test & Example')||!message.includes('reply on WhatsApp'))errors.push('Prayer request handoff failed');
destination='';fields['#prayer-message'].value='   ';handlers.submit({preventDefault(){}});
if(destination||!validity||!reported)errors.push('Whitespace-only request was accepted');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${files} HTML pages, ${posts.length} complete articles, local links/assets, and inline scripts.`);
