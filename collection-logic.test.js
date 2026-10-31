const test=require('node:test');
const assert=require('node:assert/strict');
const {words,byId}=require('./word-data.js');
const C=require('./collection-logic.js');
const S=require('./survival-logic.js');

const baseIds=['dog','cat','cow','apple','banana','car'];
const profile=(coins=0)=>C.normalizeProfile({coins,unlocked:baseIds,ownedWords:Object.fromEntries(baseIds.map(id=>[id,1]))},words,baseIds);

test('coin formulas match NORMAL and SURVIVAL settings, including run milestones',()=>{
  assert.deepEqual([2000,5000,10000,20000].map(C.calcNormalCoins),[20,50,100,200]);
  assert.deepEqual(C.calcSurvivalCoins(9999,0),{base:99,stageBonus:0,milestones:0,total:99});
  assert.deepEqual(C.calcSurvivalCoins(10001,5),{base:100,stageBonus:150,milestones:150,total:400});
  assert.equal(C.calcSurvivalCoins(0,10).total,750);
});

test('gacha prices, valid counts, and insufficient balances are enforced',()=>{
  const poor=profile(299);assert.equal(C.buyGacha(poor,words,1,()=>0).reason,'insufficient-coins');
  assert.equal(C.buyGacha(profile(3000),words,5,()=>0).reason,'invalid-count');
  const one=C.buyGacha(profile(300),words,1,()=>0);assert.equal(one.ok,true);assert.equal(one.cost,300);assert.equal(one.profile.coins,0);assert.equal(one.profile.lifetimeGachaPulls,1);
  const ten=C.buyGacha(profile(3000),words,10,()=>0);assert.equal(ten.ok,true);assert.equal(ten.cost,3000);assert.equal(ten.profile.coins,0);assert.equal(ten.profile.lifetimeGachaPulls,10);assert.equal(ten.results.length,10);
});

test('rarity rate settings sum to 100 percent and the master has exact tier counts',()=>{
  assert.equal(C.CONFIG.gacha.rarityRates.reduce((n,x)=>n+x.rate,0),1);
  const counts=words.reduce((m,w)=>(m[w.rarity]=(m[w.rarity]||0)+1,m),{});
  assert.deepEqual(counts,{Common:65,Rare:25,Epic:9,Legendary:1});
  assert.ok(words.every(w=>C.RARITIES.includes(w.rarity)));
});

test('gacha gives a first-time word permanent ownership, normal access, and 20 XP',()=>{
  const start=profile(300);let draws=0;const result=C.buyGacha(start,words,1,()=>draws++%2===0?0:.999);
  assert.equal(result.ok,true);const item=result.results[0];assert.equal(item.newlyOwned,true);assert.equal(item.rarity,'Common');
  assert.equal(result.profile.ownedWords[item.id],1);assert.ok(result.profile.unlocked.includes(item.id));assert.ok(result.profile.newWords.includes(item.id));assert.equal(result.profile.vocabularyXP,20);
  assert.equal(start.coins,300,'transaction leaves its input profile unchanged');
});

test('duplicate pulls count copies, but grant no XP or coin conversion',()=>{
  const source=profile(600);let draws=0;const random=()=>draws++%2===0?0:.999;const first=C.buyGacha(source,words,1,random).results[0].id;const owned={...source.ownedWords,[first]:1};
  draws=0;const result=C.buyGacha({...source,ownedWords:owned,unlocked:[...source.unlocked,first]},words,1,random);
  assert.equal(result.results[0].id,first);assert.equal(result.results[0].newlyOwned,false);assert.equal(result.results[0].duplicateCount,2);
  assert.equal(result.profile.vocabularyXP,0);assert.equal(result.profile.coins,300);assert.equal(result.profile.lifetimeCoinsEarned,0);
});

test('missing rarity tier falls back once to the nearest available tier',()=>{
  const pool=words.filter(w=>w.rarity!=='Legendary');const draw=C.drawWord(pool,()=>.999);
  assert.equal(draw.requestedRarity,'Legendary');assert.equal(draw.rarity,'Epic');assert.equal(draw.usedFallback,true);assert.ok(pool.includes(draw.word));
  assert.equal(C.drawWord([],()=>0),null);
});

test('Vocabulary level uses cumulative XP thresholds and supports multiple level-ups',()=>{
  assert.deepEqual(C.levelForXP(0),{level:1,xpIntoLevel:0,xpToNext:100,totalXP:0,progress:0});
  assert.equal(C.levelForXP(100).level,2);assert.equal(C.levelForXP(100).xpToNext,125);
  assert.equal(C.levelForXP(225).level,3);assert.equal(C.levelForXP(225).xpToNext,150);
  assert.equal(C.levelForXP(575).level,5);
});

test('word-clear XP is +1 per event and the +10 first-clear bonus is one-time',()=>{
  const one=C.recordWordClear(profile(), 'dog');assert.equal(one.xp,11);assert.equal(one.first,true);assert.equal(one.profile.firstClearedWords.length,1);
  const two=C.recordWordClear(one.profile,'dog');assert.equal(two.xp,1);assert.equal(two.first,false);assert.equal(two.profile.vocabularyXP,12);assert.equal(two.profile.lifetimeWordClears,2);
});

test('stage-clear XP and survival-run coins are idempotent by stable claim IDs',()=>{
  const first=C.recordStageClear(profile(),'run-a:1');assert.equal(first.xp,15);
  const again=C.recordStageClear(first.profile,'run-a:1');assert.equal(again.xp,0);assert.equal(again.profile.vocabularyXP,15);
  const payout=C.awardSurvivalCoins(first.profile,'run-a',10000,5);assert.equal(payout.coins,400);
  const duplicate=C.awardSurvivalCoins(payout.profile,'run-a',10000,5);assert.equal(duplicate.coins,0);assert.equal(duplicate.profile.coins,400);
});

test('legacy saves retain game progress and unlocked words without retroactive XP',()=>{
  const migrated=C.normalizeProfile({highScore:1200,totalScore:7000,plays:8,totalCleared:35,unlocked:[...baseIds,'lion'],deck:[...baseIds],achievements:['firstPlay'],coins:0},words,baseIds);
  assert.equal(migrated.highScore,1200);assert.equal(migrated.totalScore,7000);assert.equal(migrated.plays,8);assert.equal(migrated.totalCleared,35);
  assert.equal(migrated.ownedWords.lion,1);assert.ok(migrated.unlocked.includes('lion'));assert.equal(migrated.vocabularyXP,0);assert.equal(migrated.coins,0);
  assert.equal(C.normalizeProfile(null,words,baseIds).coins,0);
});

test('new survival runs have stable IDs and resume their XP/clear counters',()=>{
  const run=S.createRun(words,()=>.31);run.vocabularyXPStart=27;run.clearedStageIds=[1];run.clearedStages=1;
  const resumed=S.resumeRun(JSON.parse(JSON.stringify(run)),words);assert.equal(resumed.runId,run.runId);assert.deepEqual(resumed.clearedStageIds,[1]);assert.equal(resumed.clearedStages,1);
});

test('SURVIVAL gameplay scoring APIs and initial deck remain available',()=>{
  const run=S.createRun(words,()=>.31);assert.equal(run.deck.length,6);assert.equal(run.runScore,0);assert.equal(S.grade(2000,2000),1);
  assert.equal(S.scoreClear({count:5,fever:true,role:1.3}),Math.round(100*5*1.5*2*1.3));
  assert.equal(byId.dog.rarity!==undefined,true);
});
