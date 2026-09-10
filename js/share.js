function compactSharePayload(list,withImages=true,withCover=true){
  const tierIndex=new Map(list.tiers.map((t,i)=>[t.id,i]));
  return {v:2,l:{
    t:list.title||'Untitled ranking',
    d:list.description||'',
    c:list.category||'Other',
    g:Array.isArray(list.tags)?list.tags:[],
    a:list.accent||'#8b5cf6',
    m:list.coverMode==='fill'?'fill':'fit',
    v:withCover?(list.cover||null):null,
    r:list.tiers.map(t=>[t.name,t.color]),
    i:list.items.map(item=>[item.name,tierIndex.get(item.tierId)??0,item.icon||'spark',withImages?(item.image||null):null])
  }};
}
function expandSharePayload(payload){
  if(payload?.v!==2||!payload.l)return payload;
  const x=payload.l,tiers=(Array.isArray(x.r)?x.r:[]).map((t,idx)=>({id:`share-tier-${idx}`,name:t?.[0]||`Tier ${idx+1}`,color:t?.[1]||'#8b5cf6'}));
  if(!tiers.length)tiers.push({id:'share-tier-0',name:'S',color:'#ff5d73'});
  return {v:2,list:{
    title:x.t||'Untitled ranking',description:x.d||'',category:x.c||'Other',tags:Array.isArray(x.g)?x.g:[],favorite:false,
    accent:x.a||'#8b5cf6',cover:x.v||null,coverMode:x.m==='fill'?'fill':'fit',lockTierOrder:true,tiers,
    items:(Array.isArray(x.i)?x.i:[]).map((it,idx)=>({id:`share-item-${idx}`,name:it?.[0]||'Untitled item',tierId:tiers[Math.max(0,Math.min(tiers.length-1,Number(it?.[1])||0))].id,icon:it?.[2]||'spark',image:it?.[3]||null,moveCount:0,netMovement:0,history:[]}))
  }};
}
async function buildShareUrl(payload){const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set(APP.shareParam,await encodeShareCompact(payload));return url}
async function makeShareUrl(list){
  let omittedImages=false,omittedCover=false;
  let url=await buildShareUrl(compactSharePayload(list,true,true));
  if(url.toString().length>APP.maxShareUrl){omittedImages=true;url=await buildShareUrl(compactSharePayload(list,false,true))}
  if(url.toString().length>APP.maxShareUrl){omittedCover=true;url=await buildShareUrl(compactSharePayload(list,false,false))}
  return {url:url.toString(),omittedImages,omittedCover,tooLong:url.toString().length>APP.maxShareUrl};
}
async function shareList(list){
  if(location.protocol==='file:'){
    throw new Error('Share links need the hosted Tierverse site. Open the GitHub Pages version to share this list.');
  }
  const built=await makeShareUrl(list);
  if(built.tooLong)throw new Error('Share link is still too large.');
  const data={title:`${list.title} — Tierverse`,text:`My Tierverse ranking: ${list.title}`,url:built.url};
  const isHttp=/^https?:$/.test(location.protocol);
  const isLocal=/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(location.hostname||'');
  const canNativeShare=Boolean(isHttp&&!isLocal&&window.isSecureContext&&navigator.share&&(!navigator.canShare||navigator.canShare(data)));
  if(canNativeShare){
    try{await navigator.share(data);return {status:'shared',...built}}
    catch(err){if(err?.name==='AbortError')throw err}
  }
  await copyText(built.url);
  return {status:'copied',...built};
}
function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function wrapWords(ctx,text,maxWidth){
  const words=String(text||'').trim().split(/\s+/).filter(Boolean);if(!words.length)return [''];
  const lines=[];let line='';
  for(const word of words){const test=line?`${line} ${word}`:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test}
  if(line)lines.push(line);return lines;
}
function fitSingleWordFont(ctx,text,maxWidth,start=34,min=12){let size=start;while(size>min){ctx.font=`800 ${size}px system-ui`;if(ctx.measureText(text).width<=maxWidth)break;size-=1}return size}
async function exportPng(list){
  const W=1400,pad=70,itemW=190,itemH=102,gap=14;
  const probe=document.createElement('canvas').getContext('2d');
  probe.font='800 30px system-ui';
  let tierLabel=155;
  for(const tier of list.tiers){
    const words=String(tier.name||'').trim().split(/\s+/);
    const longest=words.sort((a,b)=>b.length-a.length)[0]||'';
    tierLabel=Math.max(tierLabel,Math.min(330,Math.ceil(probe.measureText(longest).width+48)));
  }
  const contentW=W-pad*2-tierLabel-22;const columns=Math.max(1,Math.floor((contentW+gap)/(itemW+gap)));
  const rows=list.tiers.map(t=>({tier:t,items:list.items.filter(i=>i.tierId===t.id)}));
  const labelLayouts=rows.map(({tier})=>{
    const text=String(tier.name||'');const multi=/\s/.test(text.trim());let size=30,lines;
    if(multi){probe.font=`800 ${size}px system-ui`;lines=wrapWords(probe,text,tierLabel-28);while(lines.some(l=>probe.measureText(l).width>tierLabel-28)&&size>12){size--;probe.font=`800 ${size}px system-ui`;lines=wrapWords(probe,text,tierLabel-28)}}
    else {size=fitSingleWordFont(probe,text,tierLabel-28,30,10);probe.font=`800 ${size}px system-ui`;lines=[text]}
    return {size,lines,lineH:Math.round(size*1.18)};
  });
  const rowHeights=rows.map((r,idx)=>Math.max(150,Math.ceil(Math.max(1,r.items.length)/columns)*(itemH+gap)+32,labelLayouts[idx].lines.length*labelLayouts[idx].lineH+44));
  const H=210+rowHeights.reduce((a,b)=>a+b+12,0)+70;const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#090b10';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f7f8fb';ctx.font='700 46px system-ui';ctx.fillText(list.title||'Untitled ranking',pad,82);ctx.fillStyle='#959caf';ctx.font='22px system-ui';ctx.fillText([list.category,...(list.tags||[]).map(t=>'#'+t)].filter(Boolean).join('   '),pad,122);
  let y=170;
  for(let ri=0;ri<rows.length;ri++){
    const {tier,items}=rows[ri],rh=rowHeights[ri],layout=labelLayouts[ri];ctx.fillStyle='#11151f';roundedRect(ctx,pad,y,W-pad*2,rh,20);ctx.fillStyle=tier.color;roundedRect(ctx,pad,y,tierLabel,rh,20);
    ctx.fillStyle='#080a0e';ctx.font=`800 ${layout.size}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';const total=layout.lines.length*layout.lineH;layout.lines.forEach((line,k)=>ctx.fillText(line,pad+tierLabel/2,y+rh/2-total/2+layout.lineH*(k+.5)));ctx.textAlign='left';ctx.textBaseline='alphabetic';
    for(let j=0;j<items.length;j++){const item=items[j],col=j%columns,row=Math.floor(j/columns),x=pad+tierLabel+22+col*(itemW+gap),iy=y+22+row*(itemH+gap);ctx.fillStyle='#1a2030';roundedRect(ctx,x,iy,itemW,itemH,15);if(item.image){try{const img=await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=item.image});ctx.save();ctx.beginPath();ctx.roundRect(x+10,iy+10,62,82,10);ctx.clip();ctx.drawImage(img,x+10,iy+10,62,82);ctx.restore()}catch{}}ctx.fillStyle='#eef1f7';ctx.font='650 18px system-ui';const tx=x+(item.image?82:16);wrapWords(ctx,item.name,itemW-(item.image?94:30)).slice(0,3).forEach((line,k)=>ctx.fillText(line,tx,iy+31+k*23))}y+=rh+12
  }
  ctx.fillStyle='#646d83';ctx.font='18px system-ui';ctx.fillText('Made with Tierverse • local-first personal rankings',pad,H-35);const blob=await new Promise(r=>c.toBlob(r,'image/png',.95));if(!blob)throw new Error('PNG export failed');downloadBlob(blob,`${slugify(list.title)}-tierverse.png`)
}
