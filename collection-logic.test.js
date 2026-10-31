const test=require('node:test');
const assert=require('node:assert/strict');
const {words}=require('./word-data.js');
const C=require('./collection-logic.js');
const baseIds=['dog','cat','cow','apple','banana','car'];
const profile=(extra={})=>C.normalizeProfile({unlocked:baseIds,ownedWords:Object.fromEntries(baseIds.map(id=>[id,1])),...extra},words,baseIds);

test('integer word thresholds unlock all 94 words by exactly 500,000 points',()=>{
  const fresh=profile();assert.equal(fresh.totalUnlockScore,0);assert.equal(fresh.unlocked.length,6);
  const result=C.awardScoreUnlocks(fresh,'normal-500k','normal',500000,words);
  assert.equal(result.profile.totalUnlockScore,500000);assert.equal(result.profile.unlocked.length,100);assert.equal(result.newlyUnlocked.length,94);assert.equal(result.profile.vocabularyXP,94*20);
  assert.ok(words.filter(w=>w.unlockScore>0).every(w=>Number.isInteger(w.unlockScore)&&w.unlockScore<=500000));
});

test('score unlocks follow the stable balanced master order and award 20 XP once per new word',()=>{
  const first=words.find(w=>w.unlockScore>0);assert.ok(first);
  const result=C.awardScoreUnlocks(profile(),'first-session','normal',first.unlockScore,words);
  assert.deepEqual(result.newlyUnlocked.map(w=>w.id),[first.id]);assert.equal(result.profile.vocabularyXP,20);assert.ok(result.profile.ownedWords[first.id]);
  const again=C.awardScoreUnlocks(result.profile,'first-session','normal',first.unlockScore,words);assert.equal(again.alreadyClaimed,true);assert.equal(again.profile.vocabularyXP,20);assert.equal(again.profile.totalUnlockScore,first.unlockScore);
});

test('legacy unlocked words and gacha ownership survive schema migration without retroactive XP',()=>{
  const migrated=C.normalizeProfile({schemaVersion:2,coins:480,lifetimeCoinsEarned:900,vocabularyXP:47,totalScore:11000,unlocked:[...baseIds,'lion','elephant','rainbow'],ownedWords:{lion:3,elephant:1},lifetimeGachaPulls:8,firstClearedWords:['dog'],achievements:['firstPlay'],deck:[...baseIds]},words,baseIds);
  assert.equal(migrated.coins,480);assert.equal(migrated.lifetimeCoinsEarned,900);assert.equal(migrated.vocabularyXP,47);assert.equal(migrated.totalUnlockScore,11000);
  for(const id of ['lion','elephant','rainbow'])assert.ok(migrated.unlocked.includes(id));assert.equal(migrated.ownedWords.lion,1);assert.equal(migrated.lifetimeCosmeticPulls,0);
  const synced=C.syncScoreUnlocks(migrated,words).profile;assert.ok(synced.unlocked.includes('lion'));assert.equal(synced.vocabularyXP,47);
});

test('each normal and survival score claim is single-claim while unlocked words are never removed',()=>{
  let state=profile({totalUnlockScore:70000,unlocked:[...baseIds,'dragon']});
  state=C.syncScoreUnlocks(state,words).profile;const before=state.unlocked.length;
  const n=C.awardScoreUnlocks(state,'normal-a','normal',10000,words);assert.equal(n.profile.totalUnlockScore,80000);assert.ok(n.profile.unlocked.length>=before);
  const duplicate=C.awardScoreUnlocks(n.profile,'normal-a','normal',10000,words);assert.equal(duplicate.profile.totalUnlockScore,80000);assert.equal(duplicate.alreadyClaimed,true);
  const s=C.awardScoreUnlocks(n.profile,'survival-a','survival',20000,words);assert.equal(s.profile.totalUnlockScore,100000);
  assert.ok(s.profile.unlocked.includes('dragon'));
});

test('normal and survival coin formulas remain unchanged and survival payout is idempotent',()=>{
  assert.deepEqual([2000,5000,10000,20000].map(C.calcNormalCoins),[20,50,100,200]);
  assert.deepEqual(C.calcSurvivalCoins(10001,5),{base:100,stageBonus:150,milestones:150,total:400});
  const one=C.awardSurvivalCoins(profile(),'run-a',10001,5);const two=C.awardSurvivalCoins(one.profile,'run-a',10001,5);assert.equal(one.coins,400);assert.equal(two.coins,0);assert.equal(two.profile.coins,400);
});

test('Vocabulary XP retains clear, first-clear and stage-clear rules',()=>{
  const first=C.recordWordClear(profile(),'dog');assert.equal(first.xp,11);const repeated=C.recordWordClear(first.profile,'dog');assert.equal(repeated.xp,1);assert.equal(repeated.profile.vocabularyXP,12);
  assert.equal(C.recordStageClear(profile(),'run:1').xp,15);assert.equal(C.recordStageClear(C.recordStageClear(profile(),'run:1').profile,'run:1').xp,0);
  assert.equal(C.levelForXP(575).level,5);assert.equal(C.levelForXP(575).xpToNext,200);
});

test('corrupt and missing save values fall back without blocking startup',()=>{
  assert.equal(C.normalizeProfile(null,words,baseIds).coins,0);const safe=C.normalizeProfile({coins:-7,vocabularyXP:'bad',unlocked:['not-a-word'],ownedWords:[]},words,baseIds);assert.equal(safe.coins,0);assert.equal(safe.vocabularyXP,0);assert.equal(safe.unlocked.length,6);
});
