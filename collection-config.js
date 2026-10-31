(function(root){'use strict';
  const config=Object.freeze({
    schemaVersion:2,
    coins:Object.freeze({normalScoreDivisor:100,survivalScoreDivisor:100,survivalPerStage:30,survivalMilestones:Object.freeze({5:150,10:300})}),
    gacha:Object.freeze({singleCost:300,tenCost:3000,rarityRates:Object.freeze([{rarity:'Common',rate:.65},{rarity:'Rare',rate:.25},{rarity:'Epic',rate:.09},{rarity:'Legendary',rate:.01}]),rarityRankMultiplier:37,rarityRankOffset:84}),
    vocabulary:Object.freeze({clearEventXP:1,firstClearBonusXP:10,newGachaWordXP:20,stageClearXP:15,baseXPToNextLevel:100,xpStepPerLevel:25,initialLevel:1})
  });
  if(root)root.WordChainCollectionConfig=config;
  if(typeof module!=='undefined'&&module.exports)module.exports=config;
})(typeof globalThis!=='undefined'?globalThis:this);
