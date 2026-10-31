const test=require('node:test');
const assert=require('node:assert/strict');
const {words}=require('./word-data.js');
const C=require('./collection-logic.js');
const X=require('./cosmetic-logic.js');
const base=['dog','cat','cow','apple','banana','car'];
const profile=(coins=0,cosmetics={})=>C.normalizeProfile({coins,unlocked:base,ownedWords:Object.fromEntries(base.map(id=>[id,1])),cosmetics},words,base);

test('shop contains the six requested themes and exact prices',()=>{
  assert.deepEqual(X.SHOP.map(x=>[x.name,x.price]),[['CLASSIC',0],['FOREST',500],['OCEAN',500],['NIGHT SKY',1000],['CANDY',1000],['SPACE',1500]]);
});

test('theme purchase spends once, records ownership, and does not permit duplicate purchase',()=>{
  const start=profile(500),bought=X.buyTheme(start,'forest');assert.equal(bought.ok,true);assert.equal(bought.profile.coins,0);assert.ok(bought.profile.cosmetics.owned.includes('forest'));
  assert.equal(X.buyTheme(bought.profile,'forest').reason,'owned');assert.equal(bought.profile.coins,0);assert.equal(start.coins,500);
});

test('insufficient coins reject shop purchase and gacha without changing state',()=>{
  const poor=profile(299);assert.equal(X.buyTheme(poor,'forest').reason,'insufficient-coins');assert.equal(X.pull(poor,()=>0).reason,'insufficient-coins');assert.equal(poor.coins,299);
});

test('cosmetic gacha uniformly draws one unowned item and never duplicates',()=>{
  let p=profile(1800),ids=[];for(let i=0;i<6;i++){const r=X.pull(p,()=>0);assert.equal(r.ok,true);assert.equal(r.poolSize,6-i);assert.equal(r.probability,1/(6-i));assert.equal(r.profile.coins,1800-(i+1)*300);assert.equal(r.profile.lifetimeCosmeticPulls,i+1);ids.push(r.item.id);p=r.profile}
  assert.equal(new Set(ids).size,6);assert.equal(p.cosmetics.owned.filter(id=>X.GACHA.some(x=>x.id===id)).length,6);
  assert.equal(X.pull(p,()=>0).reason,'complete');assert.equal(p.coins,0);
});

test('the six gacha rewards are four effects and two non-gameplay titles',()=>{
  assert.deepEqual(X.GACHA.filter(x=>x.type==='effect').map(x=>x.name),['STAR BURST','SAKURA','RAINBOW','PAW PRINT']);
  assert.deepEqual(X.GACHA.filter(x=>x.type==='title').map(x=>x.name),['WORD EXPLORER','PUZZLE MASTER']);
  assert.equal(X.GACHA_COST*X.GACHA.length,1800);
});

test('cosmetic equipment is restricted to owned items and can be switched',()=>{
  let p=profile(500);assert.equal(X.equip(p,'forest').reason,'not-owned');p=X.buyTheme(p,'forest').profile;
  assert.equal(X.equip(p,'forest').profile.cosmetics.equipped.theme,'forest');const effect=X.pull(profile(300),()=>0);assert.equal(X.equip(effect.profile,effect.item.id).ok,true);
});

test('cosmetic collection reports ownership and equipped state across both item families',()=>{
  let p=profile(500);p=X.buyTheme(p,'forest').profile;p=X.equip(p,'forest').profile;const state=X.collection(p);
  assert.equal(state.total,12);assert.equal(state.owned,2);assert.equal(state.progress,2/12);assert.ok(state.items.find(x=>x.id==='forest').equipped);assert.ok(!state.items.find(x=>x.id==='star-burst').owned);
});
