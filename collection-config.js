(function(root){'use strict';
  const config=Object.freeze({
    schemaVersion:3,
    coins:Object.freeze({normalScoreDivisor:100,survivalScoreDivisor:100,survivalPerStage:30,survivalMilestones:Object.freeze({5:150,10:300})}),
    unlocks:Object.freeze({targetScore:500000,initialWords:6,scoreUnlockXP:20}),
    vocabulary:Object.freeze({clearEventXP:1,firstClearBonusXP:10,stageClearXP:15,baseXPToNextLevel:100,xpStepPerLevel:25,initialLevel:1}),
    cosmetics:Object.freeze({shop:Object.freeze({classic:0,forest:500,ocean:500,'night-sky':1000,candy:1000,space:1500}),gachaCost:300})
  });
  if(root)root.WordChainCollectionConfig=config;
  if(typeof module!=='undefined'&&module.exports)module.exports=config;
})(typeof globalThis!=='undefined'?globalThis:this);
