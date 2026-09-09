const countBy=(arr,keyFn)=>arr.reduce((m,x)=>{const k=keyFn(x);if(k!=null&&k!=='')m[k]=(m[k]||0)+1;return m},{});
const topEntry=obj=>Object.entries(obj).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]||null;
function analytics(state){
 const lists=state.lists||[],items=lists.flatMap(l=>(l.items||[]).map(i=>({...i,_list:l})));const catTop=topEntry(countBy(lists,l=>l.category));const tierTop=topEntry(countBy(items,i=>i._list.tiers.find(t=>t.id===i.tierId)?.name));const topItems=items.filter(i=>i.tierId===i._list.tiers[0]?.id);const topCats=topEntry(countBy(topItems,i=>i._list.category));const movers=items.filter(i=>(i.moveCount||0)>0);
 const promoted=[...movers].filter(i=>(i.netMovement||0)>0).sort((a,b)=>(b.netMovement||0)-(a.netMovement||0)||(b.moveCount||0)-(a.moveCount||0))[0]||null;
 const demoted=[...movers].filter(i=>(i.netMovement||0)<0).sort((a,b)=>(a.netMovement||0)-(b.netMovement||0)||(b.moveCount||0)-(a.moveCount||0))[0]||null;
 const stable=[...items].sort((a,b)=>(a.moveCount||0)-(b.moveCount||0)||new Date(a.createdAt)-new Date(b.createdAt))[0]||null;
 const unlocked=APP.achievements.filter(a=>{try{return a.test(state)}catch{return false}});const totalMoves=items.reduce((n,i)=>n+(i.moveCount||0),0);const sShare=items.length?Math.round(topItems.length/items.length*100):0;const taste=[];
 if(items.length>=5){if(sShare>=30)taste.push(`Generous grader — ${sShare}% of ranked items live at the top.`);else if(sShare<=10)taste.push(`Selective taste — only ${sShare}% make it to your top tier.`);else taste.push('Balanced curator — your top tier stays special without being impossible.');}
 if(totalMoves>=15)taste.push(`You revise your opinions often: ${totalMoves} tier changes recorded.`);else if(items.length>=10)taste.push('Your rankings are unusually stable so far.');if(catTop)taste.push(`${catTop[0]} is your most explored category with ${catTop[1]} list${catTop[1]===1?'':'s'}.`);
 const traits=[];
 if(items.length>=5){if(sShare<=10)traits.push({name:'Velvet Rope',copy:'Your top tier has a strict guest list.',icon:'crown'});else if(sShare>=30)traits.push({name:'Open Arms',copy:'You are generous with top-tier praise.',icon:'heart'});else traits.push({name:'Balanced Curator',copy:'You keep the top special without starving it.',icon:'layers'});}
 if(totalMoves>=20)traits.push({name:'Revisionist',copy:'Changing your mind is part of the process.',icon:'shuffle'});else if(items.length>=12&&totalMoves<=2)traits.push({name:'Locked In',copy:'First impressions tend to stick.',icon:'badge'});
 if(lists.length>=4&&new Set(lists.map(l=>l.category)).size>=4)traits.push({name:'Omnivore',copy:'Your rankings roam across very different categories.',icon:'globe'});else if(lists.length>=3&&catTop&&catTop[1]/lists.length>=.67)traits.push({name:'Specialist',copy:`${catTop[0]} is clearly your home turf.`,icon:'star'});
 if(lists.some(l=>l.items.length>=30))traits.push({name:'Deep Diver',copy:'You do not stop at the obvious picks.',icon:'search'});
 if(lists.some(l=>l.tiers.length>=7))traits.push({name:'Taxonomist',copy:'Five tiers are simply not enough for you.',icon:'stack'});
 return {listCount:lists.length,itemCount:items.length,category:catTop?.[0]||'—',categoryCount:catTop?.[1]||0,tier:tierTop?.[0]||'—',tierCount:tierTop?.[1]||0,topCategory:topCats?.[0]||'—',promoted,demoted,stable,totalMoves,unlocked,taste,traits:traits.slice(0,4),recent:state.events.slice(0,10)};
}
