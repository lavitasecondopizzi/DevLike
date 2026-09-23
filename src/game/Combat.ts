import type { BattleResult, Card, Developer, Enemy } from "../entities/types";

export class Combat {
  team: Developer[]; activeIndex = 0; enemy: Enemy; energy = 3; block = 0; codeBoost = 0; temporaryCodeBonus = 0; drawPile: Card[]; discardPile: Card[] = []; hand: Card[] = []; result: BattleResult = "ongoing"; log: string[] = []; turn = 1; firstDefenseUsed = false; firstCardPlayed = false; toolPlayedThisTurn = false; enemyScaling = 0; nuzlockeRules: string[] = []; showDeck = false; deckView: "draw" | "discard" | "consumed" = "draw";
  usedCards = new Set<Card>();
  consumedCards: Card[] = [];
  constructor(team: Developer[], enemy: Enemy, deck: Card[]) { this.team=team.map(d=>({...d,items:d.items.map(item=>({...item}))})); this.enemy={...enemy,intent:{...enemy.intent}}; this.drawPile=this.shuffle([...deck]); this.log.push(`${this.active.name} entra in campo contro ${this.enemy.name}.`); this.startTurn(); }
  get active(): Developer { return this.team[this.activeIndex]; }
  get itemCodeBonus(): number { return this.active.items.reduce((total,item)=>total+item.codeBonus,0); }
  get itemDebugBonus(): number { return this.active.items.reduce((total,item)=>total+item.debugBonus,0); }
  startTurn(){if(this.result!=="ongoing")return;this.energy=this.nuzlockeRules.includes("twoEnergy")?2:3;this.block=0;this.codeBoost=0;this.temporaryCodeBonus=0;this.firstCardPlayed=false;this.toolPlayedThisTurn=false;this.drawCards(this.nuzlockeRules.includes("smallHand")?2:3);this.autoSkipIfNoAction();}
  drawCards(count:number){for(let i=0;i<count;i++){if(this.drawPile.length===0){if(this.discardPile.length===0)break;this.drawPile=this.shuffle(this.discardPile.splice(0));}const card=this.drawPile.pop();if(card)this.hand.push(card);}}
  private conditionMatches(condition:string,dev:Developer):boolean{if(condition==="lowHp")return dev.hp<dev.maxHp*.5;if(condition==="highStress")return dev.stress>=50;if(condition==="fullHp")return dev.hp>=dev.maxHp;if(condition==="highEnergy")return this.energy>=2;if(condition==="defending")return this.block>0;if(condition==="afterTool")return this.toolPlayedThisTurn;if(condition==="everyTwoTurns")return this.turn%2===0;return false;}
  private damageMultiplier(dev:Developer,action:"code"|"debug"|"card"):number{let multiplier=1;if(dev.advantageEnemyIds.includes(this.enemy.typeId))multiplier*=1.15;if(dev.weaknessEnemyIds.includes(this.enemy.typeId))multiplier*=.85;if(dev.advantageConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=1.1;if(dev.weaknessConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=.9;if(this.enemy.weaknessDeveloperIds.includes(dev.classId))multiplier*=1.15;if(this.enemy.advantageDeveloperIds.includes(dev.classId))multiplier*=.9;if(action==="debug"&&this.enemy.typeId==="client"&&dev.classId==="hacker")multiplier*=1.2;return multiplier;}
  private incomingMultiplier(dev:Developer):number{let multiplier=1;if(this.enemy.advantageDeveloperIds.includes(dev.classId))multiplier*=1.15;if(this.enemy.weaknessDeveloperIds.includes(dev.classId))multiplier*=.85;if(this.enemy.advantageConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=1.1;if(this.enemy.weaknessConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=.9;return multiplier;}
  private dealDamage(amount:number,action:"code"|"debug"|"card"){let adjusted=amount;if(this.enemy.typeId==="legacy"&&action==="debug")adjusted=Math.max(0,adjusted-2);adjusted=Math.max(0,Math.round(adjusted*this.damageMultiplier(this.active,action)));this.enemy.hp=Math.max(0,this.enemy.hp-adjusted);return adjusted;}
  playCard(index:number):boolean{const card=this.hand[index];if(!card||this.result!=="ongoing")return false;if(!this.canPlayCard(card))return false;const costReduction=this.active.classId==="designer"&&!this.firstCardPlayed?1:0;const effectiveCost=Math.max(0,card.cost-costReduction);if(effectiveCost>this.energy)return false;this.energy-=effectiveCost;this.hand.splice(index,1);if(this.nuzlockeRules.includes("battleCardLock"))this.usedCards.add(card);if(this.nuzlockeRules.includes("consumableCards")){this.consumedCards.push(card);}else{this.discardPile.push(card);}this.firstCardPlayed=true;this.toolPlayedThisTurn=true;switch(card.effect.type){case "damage":{const damage=this.dealDamage(Math.round(card.effect.amount*(1+this.codeBoost/100)),"card");this.log.push(`${card.name}: ${damage} danni.`);break;}case "heal":this.active.hp=Math.min(this.active.maxHp,this.active.hp+card.effect.amount);this.log.push(`${card.name}: +${card.effect.amount} HP.`);break;case "removeStress":this.active.stress=Math.max(0,this.active.stress-card.effect.amount);this.log.push(`${card.name}: -${card.effect.amount} Stress.`);break;case "block":this.block+=card.effect.amount;this.log.push(`${card.name}: +${card.effect.amount} Difesa.`);break;case "codeBoost":this.codeBoost+=card.effect.amount;this.active.stress=Math.min(100,this.active.stress+10);this.log.push(`${card.name}: +${card.effect.amount}% Codice, +10 Stress.`);break;}this.temporaryCodeBonus=this.active.classId==="fullstack"?1:0;this.checkBurnout();this.checkVictory();if(this.result==="ongoing")this.autoSkipIfNoAction();return true;}
  basicAction(action:"code"|"debug"|"defend"):boolean{if(this.result!=="ongoing")return false;if(action!=="defend"&&this.energy<=0)return false;if(action==="code"){if(this.nuzlockeRules.includes("noCode"))return false;this.energy-=1;let damage=this.active.code+this.itemCodeBonus+this.temporaryCodeBonus;if(this.active.classId==="senior")damage+=2;damage=Math.round(damage*(1+this.codeBoost/100));const dealt=this.dealDamage(damage,"code");this.active.stress=Math.min(100,this.active.stress+3);this.log.push(`CODICE: ${dealt} danni, +3 Stress.`);}if(action==="debug"){if(this.nuzlockeRules.includes("noDebug")||this.energy<2)return false;this.energy-=2;let debug=this.active.debug+this.itemDebugBonus;if(this.active.hp<this.active.maxHp*.5&&this.active.classId==="junior")debug+=2;if(this.active.classId==="hacker"&&this.enemy.typeId==="client")debug+=3;const damage=Math.round(debug*1.5*(1+this.codeBoost/100));const dealt=this.dealDamage(damage,"debug");this.active.stress=Math.min(100,this.active.stress+5);this.log.push(`DEBUG: ${dealt} danni, +5 Stress.`);}if(action==="defend"){if(this.nuzlockeRules.includes("noDefense"))return false;const freeDefense=this.active.classId==="architect"&&!this.firstDefenseUsed;if(!freeDefense)this.energy-=1;this.firstDefenseUsed=true;this.block+=this.active.classId==="devops"?15:10;this.active.stress=Math.max(0,this.active.stress-3);this.log.push(`DIFESA: ${this.block} danni bloccati, -3 Stress${freeDefense?" (GRATIS)":""}.`);}this.checkBurnout();this.checkVictory();return true;}
  canPlayCardForUi(card:Card):boolean{return this.canPlayCard(card);}
  get latestFeedback():string{return this.log[this.log.length-1]??"";}
  get codePreview():number{
    let damage=this.active.code+this.itemCodeBonus+this.temporaryCodeBonus;
    if(this.active.classId==="senior")damage+=2;
    damage=Math.round(damage*(1+this.codeBoost/100));
    return this.previewDamage(damage,"code");
  }
  get debugPreview():number{
    let debug=this.active.debug+this.itemDebugBonus;
    if(this.active.hp<this.active.maxHp*.5&&this.active.classId==="junior")debug+=2;
    if(this.active.classId==="hacker"&&this.enemy.typeId==="client")debug+=3;
    return this.previewDamage(Math.round(debug*1.5*(1+this.codeBoost/100)),"debug");
  }
  get defensePreview():number{return this.active.classId==="devops"?15:10;}
  get incomingDamagePreview():number{
    const raw=Math.max(0,Math.round(this.enemy.intent.damage*this.incomingMultiplier(this.active)));
    return Math.max(0,raw-this.block);
  }
  private previewDamage(amount:number,action:"code"|"debug"|"card"):number{
    let adjusted=amount;
    if(this.enemy.typeId==="legacy"&&action==="debug")adjusted=Math.max(0,adjusted-2);
    return Math.max(0,Math.round(adjusted*this.damageMultiplier(this.active,action)));
  }
  private canPlayCard(card:Card):boolean{
    if(this.nuzlockeRules.includes("oneTool")&&this.toolPlayedThisTurn)return false;
    if(this.nuzlockeRules.includes("battleCardLock")&&this.usedCards.has(card))return false;
    const upper=card.name.toUpperCase();
    if(this.nuzlockeRules.includes("noCoffee")&&upper.includes("CAFFÈ"))return false;
    if(this.nuzlockeRules.includes("noAI")&&(upper.includes("AI")||upper.includes("CHATGPT")))return false;
    if(this.nuzlockeRules.includes("noGit")&&upper.includes("GIT"))return false;
    if(this.nuzlockeRules.includes("noHealing")&&card.effect.type==="heal")return false;
    if(this.nuzlockeRules.includes("noStressRecovery")&&card.effect.type==="removeStress")return false;
    const costReduction=this.active.classId==="designer"&&!this.firstCardPlayed?1:0;
    return Math.max(0,card.cost-costReduction)<=this.energy;
  }
  private hasUsableAction():boolean{
    if(this.result!=="ongoing")return false;
    if(this.energy>=1&&!this.nuzlockeRules.includes("noCode"))return true;
    if(this.energy>=2&&!this.nuzlockeRules.includes("noDebug"))return true;
    const freeDefense=this.active.classId==="architect"&&!this.firstDefenseUsed;
    if(!this.nuzlockeRules.includes("noDefense")&&(this.energy>=1||freeDefense))return true;
    return this.hand.some(card=>this.canPlayCard(card));
  }
  toggleDeck(){this.showDeck=!this.showDeck; if(this.showDeck)this.deckView="draw";}
  setDeckView(view:"draw"|"discard"|"consumed"){this.deckView=view;this.showDeck=true;}
  private autoSkipIfNoAction(){
    if(this.result!=="ongoing"||this.hasUsableAction())return;
    this.log.push("Nessuna azione disponibile: turno saltato automaticamente.");
    this.endTurn();
  }

  switchDeveloper(index:number):boolean{if(this.nuzlockeRules.includes("noSwitch")||this.nuzlockeRules.includes("noBattleSwitch"))return false;if(this.energy<1||index===this.activeIndex||!this.team[index]||this.team[index].hp<=0||this.team[index].stress>=100)return false;this.energy-=1;this.activeIndex=index;this.log.push(`Cambio: entra ${this.active.name}.`);this.autoSkipIfNoAction();return true;}
  endTurn(){if(this.result!=="ongoing")return;this.discardPile.push(...this.hand.splice(0));this.enemyAttack();this.checkBurnout();if(this.result==="ongoing"){this.turn+=1;this.startTurn();}}
  private enemyAttack(){let raw=this.enemy.intent.damage;let stress=this.enemy.intent.stress;if(this.enemy.typeId==="bug"){this.enemyScaling+=1;stress+=this.enemyScaling;}if(this.enemy.typeId==="meeting"&&this.active.stress>=50)stress+=3;if(this.enemy.typeId==="client"&&this.turn%2===0)stress+=2;if(this.enemy.typeId==="deadline"){raw+=this.turn*2;stress+=this.turn*2;}raw=Math.max(0,Math.round(raw*this.incomingMultiplier(this.active)));const damage=Math.max(0,raw-this.block);this.block=Math.max(0,this.block-raw);this.active.hp=Math.max(0,this.active.hp-damage);const stressBefore=this.active.stress;this.active.stress=Math.min(100,this.active.stress+stress);if(this.active.classId==="intern"&&stressBefore<75&&this.active.stress>=75)this.active.stress=Math.max(0,this.active.stress-10);this.log.push(`${this.enemy.name}: ${raw} danni. Subiti ${damage}. +${stress} Stress.`);}
  private checkVictory(){if(this.enemy.hp<=0){this.result="victory";this.log.push(`${this.enemy.name} è stato sconfitto.`);}}
  private checkBurnout(){if(this.active.stress>=100||this.active.hp<=0){this.log.push(`${this.active.name} è andato in BURNOUT/ESAUSTO.`);const available=this.team.findIndex((d,i)=>i!==this.activeIndex&&d.hp>0&&d.stress<100);if(available>=0){this.active.stress=100;this.activeIndex=available;this.log.push(`Entra ${this.active.name}.`);}else{this.result="defeat";this.log.push("Tutti i developer sono fuori combattimento.");}}}
  private shuffle<T>(items:T[]):T[]{for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
}
