const APP = {
  name: 'Tierverse',
  version: '1.3.6.3',
  storageKey: 'tierverse:v1',
  maxHistory: 60,
  maxImageBytes: 8 * 1024 * 1024,
  maxCoverImageBytes: 2 * 1024 * 1024,
  maxImageDimension: 960,
  maxShareUrl: 8000,
  shareParam: 'share',
  categories: ['Games','Movies & TV','Music','Sports','Food','Tech','Books','People','Places','Other'],
  tierPresets: [
    { name: 'S', color: '#ff5d73' },
    { name: 'A', color: '#ff9f43' },
    { name: 'B', color: '#ffd166' },
    { name: 'C', color: '#6ee7b7' },
    { name: 'D', color: '#60a5fa' }
  ],
  templates: [
    { id:'classic', name:'Classic S–D', description:'The familiar five-tier setup.', category:'Other', accent:'#8b5cf6', tiers:[
      {name:'S',color:'#ff5d73'},{name:'A',color:'#ff9f43'},{name:'B',color:'#ffd166'},{name:'C',color:'#6ee7b7'},{name:'D',color:'#60a5fa'}]},
    { id:'games', name:'Game Night', description:'Built for games, releases and backlogs.', category:'Games', accent:'#5b8cff', tiers:[
      {name:'Peak',color:'#ff5d73'},{name:'Great',color:'#ff9f43'},{name:'Good',color:'#ffd166'},{name:'Mixed',color:'#6ee7b7'},{name:'Skip',color:'#60a5fa'}]},
    { id:'screen', name:'Screen Test', description:'Movies, series and episodes.', category:'Movies & TV', accent:'#d45cff', tiers:[
      {name:'All-Timer',color:'#ff5d73'},{name:'Excellent',color:'#ff9f43'},{name:'Worth It',color:'#ffd166'},{name:'Fine',color:'#6ee7b7'},{name:'Not For Me',color:'#60a5fa'}]},
    { id:'music', name:'On Repeat', description:'Albums, songs and artists.', category:'Music', accent:'#ff6f91', tiers:[
      {name:'No Skips',color:'#ff5d73'},{name:'Heavy Rotation',color:'#ff9f43'},{name:'Good',color:'#ffd166'},{name:'Occasional',color:'#6ee7b7'},{name:'Pass',color:'#60a5fa'}]},
    { id:'sports', name:'Starting Five', description:'Players, teams or seasons.', category:'Sports', accent:'#36c98f', tiers:[
      {name:'GOAT',color:'#ff5d73'},{name:'Elite',color:'#ff9f43'},{name:'Starter',color:'#ffd166'},{name:'Rotation',color:'#6ee7b7'},{name:'Bench',color:'#60a5fa'}]},
    { id:'simple', name:'Love / Like / Pass', description:'A fast three-tier opinion board.', category:'Other', accent:'#f0a14a', tiers:[
      {name:'Love',color:'#ff6b81'},{name:'Like',color:'#ffd166'},{name:'Pass',color:'#60a5fa'}]}
  ],
  itemIcons: ['star','gamepad','music','film','ball','book','bolt','heart','coffee','globe','crown','spark'],
  achievements: [
    { id:'first-list', title:'First Orbit', description:'Create your first tier list.', icon:'spark', test:s=>s.lists.length>=1 },
    { id:'collector', title:'Collector', description:'Rank 50 total items.', icon:'stack', test:s=>s.lists.reduce((n,l)=>n+l.items.length,0)>=50 },
    { id:'architect', title:'Tier Architect', description:'Create a list with 7+ tiers.', icon:'layers', test:s=>s.lists.some(l=>l.tiers.length>=7) },
    { id:'critic', title:'Hard to Impress', description:'Put 15 items into the lowest tier.', icon:'down', test:s=>s.lists.reduce((n,l)=>n+l.items.filter(i=>i.tierId===l.tiers.at(-1)?.id).length,0)>=15 },
    { id:'elite', title:'Hall of Fame', description:'Put 25 items into your top tier.', icon:'crown', test:s=>s.lists.reduce((n,l)=>n+l.items.filter(i=>i.tierId===l.tiers[0]?.id).length,0)>=25 },
    { id:'revisionist', title:'Revisionist', description:'Move ranked items between tiers 25 times.', icon:'shuffle', test:s=>s.lists.reduce((n,l)=>n+l.items.reduce((m,i)=>m+(i.moveCount||0),0),0)>=25 },
    { id:'completionist', title:'Completionist', description:'Create 10 tier lists.', icon:'badge', test:s=>s.lists.length>=10 },
    { id:'deep-cut', title:'Deep Cut', description:'Build a list with 30+ items.', icon:'search', test:s=>s.lists.some(l=>l.items.length>=30) },
    { id:'identity', title:'Signature Look', description:'Give a list a custom accent or cover.', icon:'image', test:s=>s.lists.some(l=>l.cover||l.accent&&l.accent.toLowerCase()!=='#8b5cf6') },
    { id:'versus', title:'Split Decision', description:'Compare two of your rankings.', icon:'shuffle', test:s=>s.events.some(e=>e.type==='lists-compared') }
  ]
};
