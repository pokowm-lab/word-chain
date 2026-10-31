(function(root){'use strict';
  const legacyTargets=[2000,2600,3400,4400,5700,7400,9600,12500,16200,21000];
  const CAPS={global:3,fever:3,time:3,chain:3,category:3};
  const shuffle=(items,random=Math.random)=>{const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const categoryCounts=deck=>deck.reduce((m,w)=>{const c=typeof w==='string'?w:w.category;m[c]=(m[c]||0)+1;return m},{});
  function roleForDeck(deck,byId){const words=deck.map(x=>typeof x==='string'?byId[x]:x),counts=categoryCounts(words),entries=Object.entries(counts);
    const specialist=entries.filter(([,n])=>n>=4).sort((a,b)=>b[1]-a[1])[0];
    if(specialist)return{id:'specialist',name:'CATEGORY SPECIALIST',category:specialist[0],multiplier:1.2,effect:specialist[0]+'カテゴリーの消去得点 ×1.20'};
    const split=entries.filter(([,n])=>n===3);
    if(split.length===2&&entries.length===2)return{id:'half',name:'HALF & HALF',categories:split.map(x=>x[0]),multiplier:1.3,effect:'直前と異なるカテゴリーの消去得点 ×1.30'};
    if(deck.length===6&&entries.length===6)return{id:'rainbow',name:'RAINBOW',multiplier:1.15,effect:'すべての消去得点 ×1.15'};
    return{id:'none',name:'NO ROLE',multiplier:1,effect:'役なし'};
  }
  function roleMultiplier(role,category,lastCategory){if(!role||role.id==='none')return 1;if(role.id==='specialist')return category===role.category?1.2:1;if(role.id==='half')return role.categories.includes(category)&&role.categories.includes(lastCategory)&&category!==lastCategory?1.3:1;if(role.id==='rainbow')return 1.15;return 1}
  function targetForStage(stage){const n=Math.max(1,Math.floor(stage));if(n<=legacyTargets.length)return legacyTargets[n-1];return Math.round(legacyTargets[9]*Math.pow(1.3,n-10))}
  function grade(score,target){return score>=target*2?3:score>=target*1.5?2:score>=target?1:0}
  function chainMultiplier(count){return count>=10?3:count>=7?2:count>=5?1.5:1}
  function scoreClear({count,fever=false,role=1,globalStacks=0,categoryStacks=0,chainStacks=0,categoryMatches=false}){
    const chain=chainMultiplier(count),feverMultiplier=fever?2:1,category=categoryMatches?1+Math.min(CAPS.category,categoryStacks)*.15:1;
    const global=1+Math.min(CAPS.global,globalStacks)*.1,chainBonus=count>=5?1+Math.min(CAPS.chain,chainStacks)*.15:1;
    return Math.round(100*count*chain*feverMultiplier*role*global*category*chainBonus);
  }
  function createInitialDeck(words,random=Math.random){const pool=words.filter(w=>w.difficulty==='basic');for(let attempt=0;attempt<500;attempt++){const deck=shuffle(pool,random).slice(0,6),counts=categoryCounts(deck);if(Object.keys(counts).length>=3&&Math.max(...Object.values(counts))<=3)return deck.map(w=>w.id)}
    const picked=[];for(const cat of [...new Set(pool.map(w=>w.category))]){const one=pool.find(w=>w.category===cat&&!picked.includes(w));if(one)picked.push(one)}
    for(const w of shuffle(pool,random)){if(picked.length===6)break;if(picked.includes(w))continue;if((categoryCounts(picked)[w.category]||0)<3)picked.push(w)}return picked.slice(0,6).map(w=>w.id)}
  function createRun(words,random=Math.random){const deck=createInitialDeck(words,random);return{active:true,stage:1,deck,upgrades:{global:0,fever:0,time:0,chain:0,category:{}},runScore:0,clearedStages:0,encountered:[...deck],stageTarget:targetForStage(1),phase:'playing'}}
  function resumeRun(saved,words){if(!saved||saved.active!==true||!Array.isArray(saved.deck)||saved.deck.length!==6||new Set(saved.deck).size!==6)return null;const ids=new Set(words.map(w=>w.id));if(saved.deck.some(id=>!ids.has(id)))return null;const stage=Math.max(1,Math.floor(Number(saved.stage)||1)),runScore=Math.max(0,Math.floor(Number(saved.runScore)||0));return{active:true,stage,deck:saved.deck.slice(),upgrades:saved.upgrades&&typeof saved.upgrades==='object'?saved.upgrades:{global:0,fever:0,time:0,chain:0,category:{}},runScore,clearedStages:Math.max(0,Math.floor(Number(saved.clearedStages)||0)),encountered:Array.isArray(saved.encountered)?[...new Set(saved.encountered.filter(id=>ids.has(id)))]:saved.deck.slice(),stageTarget:targetForStage(stage),phase:'playing'}}
  function loadRecord(raw,words){let value=raw;if(typeof raw==='string'){try{value=JSON.parse(raw)}catch(_){value=null}}if(!value||typeof value!=='object'||Array.isArray(value))value={};const number=(v)=>Number.isFinite(v)&&v>=0?Math.floor(v):0;const ids=new Set(words.map(w=>w.id));return{bestStage:number(value.bestStage),bestRunScore:number(value.bestRunScore),plays:number(value.plays),encountered:Array.isArray(value.encountered)?[...new Set(value.encountered.filter(id=>ids.has(id)))]:[],bestCleared:number(value.bestCleared),run:resumeRun(value.run,words)}}
  function chooseExchangeCandidates(deck,allWords,random=Math.random){const excluded=new Set(deck);const pool=allWords.filter(w=>!excluded.has(w.id));if(pool.length<3)return pool.map(w=>w.id);
    const current=deck.map(id=>allWords.find(w=>w.id===id)).filter(Boolean),counts=categoryCounts(current),max=Math.max(...Object.values(counts));
    const bucket1=pool.filter(w=>counts[w.category]===max),bucket2=pool.filter(w=>!counts[w.category]);const picks=[];
    for(const bucket of [bucket1,bucket2,pool]){const options=shuffle(bucket.filter(w=>!picks.includes(w.id)),random);if(options.length)picks.push(options[0].id)}
    for(const w of shuffle(pool,random)){if(picks.length>=3)break;if(!picks.includes(w.id))picks.push(w.id)}return picks.slice(0,3)}
  function applyUpgrade(upgrades,upgrade){const next={...upgrades,category:{...(upgrades.category||{})}};if(upgrade.type==='category'){const n=next.category[upgrade.category]||0;if(n>=CAPS.category)return{ok:false,upgrades};next.category[upgrade.category]=n+1;return{ok:true,upgrades:next}}
    const key={global:'global',fever:'fever',time:'time',chain:'chain'}[upgrade.type];if(!key)return{ok:false,upgrades};const n=next[key]||0;if(n>=CAPS[key])return{ok:false,upgrades};next[key]=n+1;return{ok:true,upgrades:next}}
  const api=Object.freeze({CAPS,categoryCounts,roleForDeck,roleMultiplier,targetForStage,grade,chainMultiplier,scoreClear,createInitialDeck,createRun,resumeRun,loadRecord,chooseExchangeCandidates,applyUpgrade});
  if(root)root.WordChainSurvival=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
