(function(root){'use strict';
  const rows=[
    // Animals (basic)
    ['dog','DOG','犬','🐶','動物','basic'],['cat','CAT','猫','🐱','動物','basic'],['cow','COW','牛','🐮','動物','basic'],['lion','LION','ライオン','🦁','動物','basic'],['elephant','ELEPHANT','象','🐘','動物','basic'],['wolf','WOLF','オオカミ','🐺','動物','basic'],['eagle','EAGLE','ワシ','🦅','動物','basic'],['bear','BEAR','クマ','🐻','動物','basic'],['rabbit','RABBIT','ウサギ','🐰','動物','basic'],['dolphin','DOLPHIN','イルカ','🐬','動物','basic'],
    // Food and drink (basic)
    ['apple','APPLE','リンゴ','🍎','食べ物・飲み物','basic'],['banana','BANANA','バナナ','🍌','食べ物・飲み物','basic'],['bread','BREAD','パン','🍞','食べ物・飲み物','basic'],['cheese','CHEESE','チーズ','🧀','食べ物・飲み物','basic'],['pizza','PIZZA','ピザ','🍕','食べ物・飲み物','basic'],['grape','GRAPE','ブドウ','🍇','食べ物・飲み物','basic'],['carrot','CARROT','ニンジン','🥕','食べ物・飲み物','basic'],['egg','EGG','卵','🥚','食べ物・飲み物','basic'],['coffee','COFFEE','コーヒー','☕','食べ物・飲み物','basic'],['cake','CAKE','ケーキ','🍰','食べ物・飲み物','basic'],
    // Nature and weather (basic)
    ['rainbow','RAINBOW','虹','🌈','自然・天候','basic'],['sun','SUN','太陽','☀️','自然・天候','basic'],['moon','MOON','月','🌙','自然・天候','basic'],['star','STAR','星','⭐','自然・天候','basic'],['rain','RAIN','雨','🌧️','自然・天候','basic'],['snow','SNOW','雪','❄️','自然・天候','basic'],['tree','TREE','木','🌳','自然・天候','basic'],['flower','FLOWER','花','🌸','自然・天候','basic'],['mountain','MOUNTAIN','山','⛰️','自然・天候','basic'],['ocean','OCEAN','海洋','🌊','自然・天候','basic'],
    // Vehicles and machines (basic)
    ['car','CAR','車','🚗','乗り物・機械','basic'],['rocket','ROCKET','ロケット','🚀','乗り物・機械','basic'],['train','TRAIN','列車','🚆','乗り物・機械','basic'],['airplane','AIRPLANE','飛行機','✈️','乗り物・機械','basic'],['ship','SHIP','船','🚢','乗り物・機械','basic'],['bicycle','BICYCLE','自転車','🚲','乗り物・機械','basic'],['bus','BUS','バス','🚌','乗り物・機械','basic'],['helicopter','HELICOPTER','ヘリコプター','🚁','乗り物・機械','basic'],['robot','ROBOT','ロボット','🤖','乗り物・機械','basic'],['camera','CAMERA','カメラ','📷','乗り物・機械','basic'],
    // People and jobs (basic)
    ['king','KING','王','👑','人物・職業','basic'],['queen','QUEEN','女王','👸','人物・職業','basic'],['doctor','DOCTOR','医師','🧑‍⚕️','人物・職業','basic'],['teacher','TEACHER','教師','🧑‍🏫','人物・職業','basic'],['chef','CHEF','料理人','🧑‍🍳','人物・職業','basic'],['artist','ARTIST','芸術家','🎨','人物・職業','basic'],['detective','DETECTIVE','探偵','🕵️','人物・職業','basic'],['pilot','PILOT','操縦士','👨‍✈️','人物・職業','basic'],['astronaut','ASTRONAUT','宇宙飛行士','🧑‍🚀','人物・職業','basic'],['scientist','SCIENTIST','科学者','🔬','人物・職業','basic'],
    // Household and tools (basic)
    ['book','BOOK','本','📖','道具・日用品','basic'],['clock','CLOCK','時計','🕒','道具・日用品','basic'],['key','KEY','鍵','🔑','道具・日用品','basic'],['hammer','HAMMER','金づち','🔨','道具・日用品','basic'],['scissors','SCISSORS','はさみ','✂️','道具・日用品','basic'],['umbrella','UMBRELLA','傘','☂️','道具・日用品','basic'],['phone','PHONE','電話','📱','道具・日用品','basic'],['chair','CHAIR','椅子','🪑','道具・日用品','basic'],['guitar','GUITAR','ギター','🎸','道具・日用品','basic'],['lamp','LAMP','ランプ','💡','道具・日用品','basic'],
    // Emotion and psychology (basic)
    ['love','LOVE','愛','❤️','感情・心理','basic'],['anger','ANGER','怒り','😡','感情・心理','basic'],['fear','FEAR','恐怖','😨','感情・心理','basic'],['joy','JOY','喜び','😄','感情・心理','basic'],['sadness','SADNESS','悲しみ','😢','感情・心理','basic'],['hope','HOPE','希望','🌅','感情・心理','basic'],['surprise','SURPRISE','驚き','😲','感情・心理','basic'],['trust','TRUST','信頼','🤝','感情・心理','basic'],
    // Fantasy (basic)
    ['dragon','DRAGON','ドラゴン','🐉','魔法・ファンタジー','basic'],['ghost','GHOST','幽霊','👻','魔法・ファンタジー','basic'],['magic','MAGIC','魔法','🪄','魔法・ファンタジー','basic'],['wizard','WIZARD','魔法使い','🧙','魔法・ファンタジー','basic'],['sword','SWORD','剣','⚔️','魔法・ファンタジー','basic'],['shield','SHIELD','盾','🛡️','魔法・ファンタジー','basic'],['castle','CASTLE','城','🏰','魔法・ファンタジー','basic'],
    // Advanced and abstract (unique icons where the source list repeated icons)
    ['justice','JUSTICE','正義・公正','⚖️','社会・価値','advanced'],['freedom','FREEDOM','自由','🕊️','社会・価値','advanced'],['chaos','CHAOS','混沌','🌀','概念・現象','advanced'],['destiny','DESTINY','運命','🧵','時間・運命','advanced'],['eternity','ETERNITY','永遠','♾️','時間・運命','advanced'],['ambiguous','AMBIGUOUS','曖昧な・多義的な','🎭','認識・思考','advanced'],['ephemeral','EPHEMERAL','はかない・短命な','⌛','時間・運命','advanced'],['inevitable','INEVITABLE','避けられない','🔮','時間・運命','advanced'],['paradox','PARADOX','逆説','🔄','認識・思考','advanced'],['illusion','ILLUSION','錯覚・幻想','🪞','認識・思考','advanced'],['gravity','GRAVITY','重力','🪐','科学・現象','advanced'],['infinity','INFINITY','無限','∞','数学・概念','advanced'],['wisdom','WISDOM','知恵','🦉','認識・思考','advanced'],['courage','COURAGE','勇気','🦸','感情・心理','advanced'],['ambition','AMBITION','野心・大志','🏔️','感情・心理','advanced'],['oblivion','OBLIVION','忘却','🌫️','認識・思考','advanced'],['mystery','MYSTERY','謎・神秘','❓','認識・思考','advanced'],['dilemma','DILEMMA','板挟み・ジレンマ','🧩','認識・思考','advanced'],['serenity','SERENITY','静けさ・平穏','🧘','感情・心理','advanced'],['nostalgia','NOSTALGIA','郷愁・懐かしさ','🧳','感情・心理','advanced'],['resilience','RESILIENCE','回復力・立ち直る力','🌱','感情・心理','advanced'],['transformation','TRANSFORMATION','変容・変革','🦋','概念・現象','advanced'],['symmetry','SYMMETRY','対称性','🔷','数学・概念','advanced'],['entropy','ENTROPY','エントロピー','🧊','科学・現象','advanced'],['ubiquitous','UBIQUITOUS','至る所にある','🌐','概念・現象','advanced']
  ];
  const initialIds=['dog','cat','cow','apple','banana','car'];
  const rawWords=rows.map(([id,word,meaning,icon,category,difficulty])=>Object.freeze({id,word,name:word,meaning,icon,emoji:icon,pron:word.toLowerCase(),category,difficulty,unlockScore:0,unlock:0,image:null}));
  function roundRobinForDifficulty(difficulty){
    const queues=[...new Set(rawWords.map(w=>w.category))].map(category=>rawWords.filter(w=>w.category===category&&w.difficulty===difficulty&&!initialIds.includes(w.id)));
    const order=[];while(queues.some(queue=>queue.length))for(const queue of queues)if(queue.length)order.push(queue.shift());return order;
  }
  const basicOrder=roundRobinForDifficulty('basic'),advancedOrder=roundRobinForDifficulty('advanced'),unlockOrder=[];
  while(advancedOrder.length){for(let i=0;i<3&&basicOrder.length;i++)unlockOrder.push(basicOrder.shift().id);unlockOrder.push(advancedOrder.shift().id)}
  while(basicOrder.length)unlockOrder.push(basicOrder.shift().id);
  const thresholdById=Object.fromEntries(unlockOrder.map((id,index)=>[id,Math.ceil((index+1)*500000/94)]));
  const words=rawWords.map(w=>Object.freeze({...w,unlockScore:thresholdById[w.id]||0,unlock:thresholdById[w.id]||0}));
  const api=Object.freeze({words,unlockOrder,categories:[...new Set(words.map(w=>w.category))],byId:Object.fromEntries(words.map(w=>[w.id,w]))});
  if(root)root.WordChainWords=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
