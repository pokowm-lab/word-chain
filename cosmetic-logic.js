(function(root){'use strict';
  const CONFIG=root.WordChainCollectionConfig||(typeof require==='function'?require('./collection-config.js'):null);
  const SHOP=[
    {id:'classic',name:'CLASSIC',type:'theme',price:CONFIG.cosmetics.shop.classic,preview:'linear-gradient(145deg,#444284,#111329)'},
    {id:'forest',name:'FOREST',type:'theme',price:CONFIG.cosmetics.shop.forest,preview:'linear-gradient(145deg,#468b69,#102c2b)'},
    {id:'ocean',name:'OCEAN',type:'theme',price:CONFIG.cosmetics.shop.ocean,preview:'linear-gradient(145deg,#347dad,#102842)'},
    {id:'night-sky',name:'NIGHT SKY',type:'theme',price:CONFIG.cosmetics.shop['night-sky'],preview:'linear-gradient(145deg,#514b8e,#101329)'},
    {id:'candy',name:'CANDY',type:'theme',price:CONFIG.cosmetics.shop.candy,preview:'linear-gradient(145deg,#df78b2,#50306f)'},
    {id:'space',name:'SPACE',type:'theme',price:CONFIG.cosmetics.shop.space,preview:'linear-gradient(145deg,#27204c,#050912)'}
  ];
  const GACHA=[
    {id:'star-burst',name:'STAR BURST',type:'effect',icon:'✦',color:'#ffe16d'},
    {id:'sakura',name:'SAKURA',type:'effect',icon:'🌸',color:'#ff9bc9'},
    {id:'rainbow',name:'RAINBOW',type:'effect',icon:'🌈',color:'#94f4ff'},
    {id:'paw-print',name:'PAW PRINT',type:'effect',icon:'🐾',color:'#d5b5ff'},
    {id:'word-explorer',name:'WORD EXPLORER',type:'title',icon:'📚'},
    {id:'puzzle-master',name:'PUZZLE MASTER',type:'title',icon:'🧩'}
  ];
  const GACHA_COST=CONFIG.cosmetics.gachaCost;
  const clone=p=>({...p,cosmetics:{owned:[...(p.cosmetics?.owned||['classic'])],equipped:{theme:p.cosmetics?.equipped?.theme||'classic',effect:p.cosmetics?.equipped?.effect||null,title:p.cosmetics?.equipped?.title||null}},newCosmetics:[...(p.newCosmetics||[])]});
  function buyTheme(profile,id){const item=SHOP.find(x=>x.id===id);if(!item)return{ok:false,reason:'unknown-item'};const next=clone(profile);if(next.cosmetics.owned.includes(id))return{ok:false,reason:'owned',profile:next};if(next.coins<item.price)return{ok:false,reason:'insufficient-coins',required:item.price,profile:next};next.coins-=item.price;next.cosmetics.owned.push(id);next.cosmetics.equipped.theme=id;return{ok:true,profile:next,item}}
  function equip(profile,id){const item=[...SHOP,...GACHA].find(x=>x.id===id);if(!item)return{ok:false,reason:'unknown-item'};const next=clone(profile);if(!next.cosmetics.owned.includes(id))return{ok:false,reason:'not-owned'};const slot=item.type==='theme'?'theme':item.type;next.cosmetics.equipped[slot]=id;return{ok:true,profile:next,item}}
  function pull(profile,random=Math.random){const next=clone(profile),pool=GACHA.filter(x=>!next.cosmetics.owned.includes(x.id));if(!pool.length)return{ok:false,reason:'complete',profile:next};if(next.coins<GACHA_COST)return{ok:false,reason:'insufficient-coins',required:GACHA_COST,profile:next};const index=Math.min(pool.length-1,Math.floor(Math.max(0,Math.min(.999999999,Number(random())||0))*pool.length)),item=pool[index];next.coins-=GACHA_COST;next.lifetimeCosmeticPulls=(next.lifetimeCosmeticPulls||0)+1;next.cosmetics.owned.push(item.id);next.cosmetics.equipped[item.type]=item.id;next.newCosmetics=[...new Set([...next.newCosmetics,item.id])];return{ok:true,profile:next,item,poolSize:pool.length,probability:1/pool.length}}
  function collection(profile){const owned=new Set(profile.cosmetics?.owned||[]),items=[...SHOP,...GACHA].map(item=>({...item,owned:owned.has(item.id),equipped:profile.cosmetics?.equipped?.[item.type==='theme'?'theme':item.type]===item.id}));return{items,owned:items.filter(x=>x.owned).length,total:items.length,progress:items.length?items.filter(x=>x.owned).length/items.length:1}}
  const api=Object.freeze({SHOP,GACHA,GACHA_COST,buyTheme,equip,pull,collection});
  if(root)root.WordChainCosmetics=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
