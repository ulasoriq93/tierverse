const freshState=()=>({version:APP.version,createdAt:now(),updatedAt:now(),lists:[],events:[],settings:{theme:'dark',compact:false,font:'modern'},achievements:[]});
let state=load();let listeners=[];let histories=new Map();let lastSaveError=null;

const cleanText=(v,max=180)=>String(v??'').trim().slice(0,max);
const cleanId=(v,prefix)=>/^[a-z0-9_-]{1,120}$/i.test(String(v||''))?String(v):uid(prefix);
function normalizeList(input={}){
 const listId=cleanId(input.id,'list');const srcTiers=Array.isArray(input.tiers)&&input.tiers.length?input.tiers:APP.tierPresets;
 const seen=new Set(),tierMap=new Map();const tiers=srcTiers.slice(0,30).map((t,idx)=>{let id=cleanId(t.id,'tier');while(seen.has(id))id=uid('tier');seen.add(id);if(t.id!=null)tierMap.set(String(t.id),id);return {id,name:cleanText(t.name||`Tier ${idx+1}`,40)||`Tier ${idx+1}`,color:safeColor(t.color)}});
 const validTierIds=new Set(tiers.map(t=>t.id));const fallback=tiers[0].id;const itemSeen=new Set();
 const items=(Array.isArray(input.items)?input.items:[]).slice(0,1000).map(raw=>{let id=cleanId(raw.id,'item');while(itemSeen.has(id))id=uid('item');itemSeen.add(id);const mapped=tierMap.get(String(raw.tierId));const tierId=validTierIds.has(mapped)?mapped:(validTierIds.has(raw.tierId)?raw.tierId:fallback);return {id,name:cleanText(raw.name,120)||'Untitled item',tierId,icon:APP.itemIcons.includes(raw.icon)?raw.icon:'spark',image:safeImageSrc(raw.image)||null,createdAt:raw.createdAt||now(),moveCount:Math.max(0,Number(raw.moveCount)||0),netMovement:Number(raw.netMovement)||0,history:Array.isArray(raw.history)?raw.history.slice(-200):[]}});
 return {id:listId,title:cleanText(input.title,160)||'Untitled ranking',description:String(input.description??'').slice(0,2000),category:APP.categories.includes(input.category)?input.category:'Other',tags:(Array.isArray(input.tags)?input.tags:[]).map(t=>cleanText(t,32)).filter(Boolean).slice(0,8),favorite:!!input.favorite,accent:safeColor(input.accent||'#8b5cf6'),cover:safeImageSrc(input.cover)||null,coverMode:['fit','fill'].includes(input.coverMode)?input.coverMode:'fit',coverOrientation:['portrait','landscape'].includes(input.coverOrientation)?input.coverOrientation:'portrait',lockTierOrder:input.lockTierOrder!==false,createdAt:input.createdAt||now(),updatedAt:input.updatedAt||now(),tiers,items};
}
function normalizeState(input={}){const base=freshState();const incoming=input.settings&&typeof input.settings==='object'?input.settings:{};const theme=['dark','light','system'].includes(incoming.theme)?incoming.theme:base.settings.theme;const compact=!!incoming.compact;const font=['modern','rounded','tech'].includes(incoming.font)?incoming.font:base.settings.font;return {...base,createdAt:input.createdAt||base.createdAt,updatedAt:now(),lists:(Array.isArray(input.lists)?input.lists:[]).slice(0,250).map(normalizeList),events:(Array.isArray(input.events)?input.events:[]).slice(0,500).map(e=>({id:cleanId(e.id,'event'),type:cleanText(e.type,50),listId:cleanText(e.listId,120),itemId:e.itemId?cleanText(e.itemId,120):null,meta:e.meta&&typeof e.meta==='object'?e.meta:{},at:e.at||now()})),settings:{theme,compact,font},version:APP.version}}
function load(){try{const raw=localStorage.getItem(APP.storageKey);if(!raw)return freshState();return normalizeState(JSON.parse(raw))}catch{return freshState()}}
function save(){state.updatedAt=now();state.version=APP.version;try{localStorage.setItem(APP.storageKey,JSON.stringify(state));lastSaveError=null}catch(err){lastSaveError=err;return false}listeners.forEach(fn=>fn(getState()));return true}
const getState=()=>state;
const getStorageHealth=()=>({ok:!lastSaveError,error:lastSaveError?.name||null,bytes:new Blob([JSON.stringify(state)]).size});
const subscribe=fn=>{listeners.push(fn);return()=>listeners=listeners.filter(x=>x!==fn)};
const commit=(mutator)=>{mutator(state);return save()};
function updateSettings(patch={}){const next={...state.settings,...patch};state.settings={theme:['dark','light','system'].includes(next.theme)?next.theme:'dark',compact:!!next.compact,font:['modern','rounded','tech'].includes(next.font)?next.font:'modern'};return save()}
const replaceState=(next)=>{state=normalizeState(next);histories.clear();return save()};
const resetState=()=>replaceState(freshState());
function createList(overrides={}){const list=normalizeList({id:uid('list'),title:'Untitled ranking',description:'',category:'Other',tags:[],favorite:false,createdAt:now(),updatedAt:now(),tiers:APP.tierPresets.map(t=>({id:uid('tier'),...t})),items:[],...overrides});state.lists.unshift(list);recordEvent('list-created',list.id,null,{title:list.title},false);save();return list}
const findList=id=>state.lists.find(l=>l.id===id);
function updateList(id,patch,{history=true,event='list-updated'}={}){const list=findList(id);if(!list)return false;if(history)pushHistory(id);Object.assign(list,patch,{updatedAt:now()});trimFuture(id);recordEvent(event,id,null,patch,false);return save()}
function deleteList(id){state.lists=state.lists.filter(l=>l.id!==id);state.events=state.events.filter(e=>e.listId!==id);histories.delete(id);return save()}
function duplicateList(id){const src=findList(id);if(!src)return;const copy=deepClone(src);copy.id=uid('list');copy.title=`${copy.title} Copy`.slice(0,160);copy.favorite=false;copy.createdAt=copy.updatedAt=now();copy.tiers.forEach(t=>t.id=uid('tier'));const map=new Map(src.tiers.map((t,i)=>[t.id,copy.tiers[i].id]));copy.items.forEach(i=>{i.id=uid('item');i.tierId=map.get(i.tierId)||copy.tiers[0]?.id;i.moveCount=0;i.netMovement=0;i.history=[]});state.lists.unshift(copy);recordEvent('list-duplicated',copy.id,null,{sourceId:id},false);save();return copy}
function historyFor(id){if(!histories.has(id))histories.set(id,{past:[],future:[]});return histories.get(id)}
function pushHistory(id){const list=findList(id);if(!list)return;const h=historyFor(id);h.past.push(deepClone(list));if(h.past.length>APP.maxHistory)h.past.shift();h.future=[]}
function trimFuture(id){historyFor(id).future=[]}
function canUndo(id){return historyFor(id).past.length>0}function canRedo(id){return historyFor(id).future.length>0}
function undo(id){const list=findList(id),h=historyFor(id);if(!list||!h.past.length)return;h.future.push(deepClone(list));state.lists[state.lists.findIndex(x=>x.id===id)]=h.past.pop();recordEvent('undo',id,null,{},false);save()}
function redo(id){const list=findList(id),h=historyFor(id);if(!list||!h.future.length)return;h.past.push(deepClone(list));state.lists[state.lists.findIndex(x=>x.id===id)]=h.future.pop();recordEvent('redo',id,null,{},false);save()}
function mutateList(id,mutator,event='list-updated',meta={}){const list=findList(id);if(!list)return false;pushHistory(id);mutator(list);list.updatedAt=now();recordEvent(event,id,meta.itemId||null,meta,false);return save()}
function recordEvent(type,listId,itemId=null,meta={},persist=true){state.events.unshift({id:uid('event'),type,listId,itemId,meta,at:now()});state.events=state.events.slice(0,500);if(persist)save()}
function exportState(){return JSON.stringify(state,null,2)}
