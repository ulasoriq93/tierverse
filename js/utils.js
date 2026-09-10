const uid=(p='id')=>`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const now=()=>new Date().toISOString();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const escapeAttr=escapeHtml;
const safeColor=c=>/^#[0-9a-f]{6}$/i.test(String(c||''))?c:'#8b5cf6';
const safeImageSrc=s=>/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(String(s||''))?s:'';
const formatDate=iso=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(iso));
const formatRelative=iso=>{const d=(Date.now()-new Date(iso))/1000;if(!Number.isFinite(d))return 'unknown';if(d<60)return 'just now';if(d<3600)return `${Math.floor(d/60)}m ago`;if(d<86400)return `${Math.floor(d/3600)}h ago`;if(d<604800)return `${Math.floor(d/86400)}d ago`;return formatDate(iso)};
const debounce=(fn,ms=250)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
function deepClone(v){return JSON.parse(JSON.stringify(v))}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},400)}
function slugify(s){return String(s||'tier-list').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)||'tier-list'}
function encodeShare(obj){const json=JSON.stringify(obj);const bytes=new TextEncoder().encode(json);let str='';bytes.forEach(b=>str+=String.fromCharCode(b));return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function decodeShare(s){s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);const bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));return JSON.parse(new TextDecoder().decode(bytes))}

function bytesToBase64Url(bytes){let bin='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)bin+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function base64UrlToBytes(s){s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);return Uint8Array.from(bin,c=>c.charCodeAt(0))}
async function gzipBytes(bytes){if(typeof CompressionStream==='undefined')return null;const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));return new Uint8Array(await new Response(stream).arrayBuffer())}
async function gunzipBytes(bytes){if(typeof DecompressionStream==='undefined')throw new Error('Compressed share links are not supported by this browser.');const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return new Uint8Array(await new Response(stream).arrayBuffer())}
async function encodeShareCompact(obj){const raw=new TextEncoder().encode(JSON.stringify(obj));const zipped=await gzipBytes(raw);return zipped?'z.'+bytesToBase64Url(zipped):encodeShare(obj)}
async function decodeShareAny(s){s=String(s||'');if(!s.startsWith('z.'))return decodeShare(s);const raw=await gunzipBytes(base64UrlToBytes(s.slice(2)));return JSON.parse(new TextDecoder().decode(raw))}
async function imageFileToDataURL(file,maxBytes=8*1024*1024,maxDim=720){
 if(!file||!/^image\//.test(file.type))throw new Error('Choose an image file.');
 if(file.size>maxBytes){const limit=Math.max(1,Math.round(maxBytes/1024/1024));throw new Error(`Image is too large. Choose one under ${limit} MB.`);}
 const src=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('Could not read image.'));r.readAsDataURL(file)});
 const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Could not decode image.'));i.src=src});
 const scale=Math.min(1,maxDim/Math.max(img.width,img.height));const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);
 return c.toDataURL('image/jpeg',.82);
}
async function copyText(text){
 if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true}
 const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();if(!ok)throw new Error('Copy failed');return true;
}
