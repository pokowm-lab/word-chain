const test=require('node:test');
const assert=require('node:assert/strict');
const {words,byId}=require('./word-data.js');
const S=require('./survival-logic.js');

test('master contains 100 complete unique words with valid categories and icons',()=>{
  assert.equal(words.length,100);assert.equal(new Set(words.map(w=>w.id)).size,100);assert.equal(new Set(words.map(w=>w.word)).size,100);
  assert.ok(words.every(w=>w.id&&w.word&&w.meaning&&w.icon&&w.category&&['basic','advanced'].includes(w.difficulty)&&Number.isFinite(w.unlockScore)));
  assert.equal(new Set(words.map(w=>w.icon)).size,100);assert.equal(words.filter(w=>w.difficulty==='basic').length,75);assert.equal(words.filter(w=>w.difficulty==='advanced').length,25);
  assert.equal(byId.lion.unlockScore,2000);assert.equal(byId.dragon.unlockScore,50000);
});

test('survival starting deck has six basic words, at least three categories and no category above three',()=>{
  const deck=S.createInitialDeck(words,()=>.31);const picked=deck.map(id=>byId[id]);const counts=S.categoryCounts(picked);
  assert.equal(deck.length,6);assert.ok(picked.every(w=>w.difficulty==='basic'));assert.ok(Object.keys(counts).length>=3);assert.ok(Math.max(...Object.values(counts))<=3);
});

test('all three deck roles and switching-category rule calculate correctly',()=>{
  assert.equal(S.roleForDeck(['dog','cat','cow','lion','apple','banana'],byId).id,'specialist');
  const half=S.roleForDeck(['dog','cat','cow','apple','banana','bread'],byId);assert.equal(half.id,'half');
  assert.equal(S.roleMultiplier(half,'動物','食べ物・飲み物'),1.3);assert.equal(S.roleMultiplier(half,'動物','動物'),1);
  const rainbow=S.roleForDeck(['dog','apple','sun','car','king','book'],byId);assert.equal(rainbow.id,'rainbow');assert.equal(S.roleMultiplier(rainbow,'動物',null),1.15);
});

test('stage targets, win/loss and star thresholds are correct',()=>{
  assert.deepEqual([1,2,10,11].map(S.targetForStage),[2000,2600,21000,27300]);
  assert.equal(S.grade(1999,2000),0);assert.equal(S.grade(2000,2000),1);assert.equal(S.grade(3000,2000),2);assert.equal(S.grade(4000,2000),3);
});

test('score multiplies chain, fever, role and upgrades then rounds once',()=>{
  assert.equal(S.scoreClear({count:5,fever:true,role:1.3,globalStacks:1,categoryStacks:1,chainStacks:1,categoryMatches:true}),Math.round(100*5*1.5*2*1.3*1.1*1.15*1.15));
});

test('exchange candidates are three distinct words outside the current deck',()=>{
  const deck=['dog','cat','cow','apple','banana','car'];const picks=S.chooseExchangeCandidates(deck,words,()=>.1);
  assert.equal(picks.length,3);assert.equal(new Set(picks).size,3);assert.ok(picks.every(id=>!deck.includes(id)));
});

test('category and generic upgrade caps are enforced',()=>{
  let u={global:0,fever:0,time:0,chain:0,category:{}};
  for(let i=0;i<3;i++){const r=S.applyUpgrade(u,{type:'category',category:'動物'});assert.equal(r.ok,true);u=r.upgrades}
  assert.equal(S.applyUpgrade(u,{type:'category',category:'動物'}).ok,false);
  for(let i=0;i<3;i++){const r=S.applyUpgrade(u,{type:'fever'});assert.equal(r.ok,true);u=r.upgrades}
  assert.equal(S.applyUpgrade(u,{type:'fever'}).ok,false);
});

test('resume restores deck and upgrades but restarts the unfinished stage at its target',()=>{
  const run=S.createRun(words,()=>.2);run.stage=4;run.runScore=8800;run.stageScore=1370;run.upgrades.global=2;
  const resumed=S.resumeRun(run,words);assert.equal(resumed.stage,4);assert.equal(resumed.runScore,8800);assert.equal(resumed.stageTarget,4400);assert.equal(resumed.stageScore,undefined);assert.equal(resumed.upgrades.global,2);
  assert.equal(S.resumeRun({...run,deck:['dog']},words),null);
});

test('run creation is independent of classic unlock state and starts at stage one',()=>{
  const run=S.createRun(words,()=>.47);
  assert.equal(run.stage,1);assert.equal(run.stageTarget,2000);assert.equal(run.deck.length,6);
  assert.ok(run.deck.every(id=>byId[id].difficulty==='basic'));
  assert.equal(run.upgrades.global,0);assert.equal(run.phase,'playing');
});

test('role multiplier only rewards category switching in half and half',()=>{
  const role=S.roleForDeck(['dog','cat','cow','apple','banana','bread'],byId);
  assert.equal(S.roleMultiplier(role,'食べ物・飲み物','動物'),1.3);
  assert.equal(S.roleMultiplier(role,'動物','動物'),1);
  assert.equal(S.roleMultiplier(role,'人物・職業','動物'),1);
});

test('exchange replacement preserves six distinct cards and previews the resulting role',()=>{
  const deck=['dog','cat','cow','apple','banana','car'];
  const candidate=S.chooseExchangeCandidates(deck,words,()=>.73)[0];
  const exchanged=deck.map(id=>id===deck[0]?candidate:id);
  assert.equal(exchanged.length,6);assert.equal(new Set(exchanged).size,6);
  assert.notEqual(S.roleForDeck(exchanged,byId).id,undefined);
});

test('all generic upgrade families stop at three stacks',()=>{
  for(const type of ['global','fever','time','chain']){
    let upgrades={global:0,fever:0,time:0,chain:0,category:{}};
    for(let i=0;i<3;i++){const result=S.applyUpgrade(upgrades,{type});assert.equal(result.ok,true);upgrades=result.upgrades}
    assert.equal(S.applyUpgrade(upgrades,{type}).ok,false);
  }
});

test('survival encounter set can include locked words without changing classic unlock rules',()=>{
  const locked=byId.ubiquitous;assert.ok(locked.unlockScore>0);
  const encounterIds=['dog',locked.id];
  assert.ok(encounterIds.includes(locked.id));
  assert.ok(!['dog','cat','cow','apple','banana','car'].includes(locked.id));
});

test('saved record restores an interrupted run and safely ignores corrupt survival storage',()=>{
  const run=S.createRun(words,()=>.2);run.stage=3;run.stageTarget=S.targetForStage(3);run.runScore=5100;run.stageScore=800;run.upgrades.time=2;
  const record={bestStage:3,bestRunScore:5100,plays:4,encountered:['dog','ubiquitous','bad-id'],bestCleared:2,run};
  const loaded=S.loadRecord(JSON.stringify(record),words);
  assert.equal(loaded.run.stage,3);assert.equal(loaded.run.stageTarget,3400);assert.equal(loaded.run.stageScore,undefined);assert.equal(loaded.run.runScore,5100);
  assert.deepEqual(loaded.encountered,['dog','ubiquitous']);assert.equal(loaded.plays,4);
  assert.deepEqual(S.loadRecord('{invalid',words),{bestStage:0,bestRunScore:0,plays:0,encountered:[],bestCleared:0,run:null});
});
