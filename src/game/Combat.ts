import type { BattleResult, Card, Developer, Enemy } from "../entities/types";

export class Combat {
  team: Developer[]; activeIndex = 0; enemy: Enemy; energy = 3; block = 0; codeBoost = 0; temporaryCodeBonus = 0; drawPile: Card[]; discardPile: Card[] = []; hand: Card[] = []; result: BattleResult = "ongoing"; log: string[] = []; turn = 1; architectDefenseUsed = new Set<string>(); devopsDefenseUsed = new Set<string>(); firstCardPlayed = false; toolPlayedThisTurn = false; firstCodeUsed = false; internStressPassiveUsed = new Set<string>(); lastToolDeveloperId: string | null = null; enemyScaling = 0; nuzlockeRules: string[] = []; showDeck = false; deckView: "draw" | "discard" = "draw";
  usedCards = new Set<Card>();
  private deadlinePhaseOrder: {name:string;description:string;ability:string;outgoing:number;incomingStress:number;playerDamage:number;specialDamage:number;specialStress:number;specialBlockPierce:number}[] = [];
  private deadlinePhaseIndex = 0;
  private deadlinePhaseTriggered = new Set<number>();
  constructor(team: Developer[], enemy: Enemy, deck: Card[], nuzlockeRules:string[] = []) { this.team=team.map(d=>({...d,items:d.items.map(item=>({...item}))})); this.enemy={...enemy,intent:{...enemy.intent}}; this.nuzlockeRules=[...nuzlockeRules]; this.drawPile=this.shuffle([...deck]); if(this.enemy.typeId==="deadline")this.setupDeadlinePhases(); const available=this.team.findIndex(d=>d.hp>0&&d.stress<d.maxStress); if(available>=0)this.activeIndex=available; else {this.result="defeat";this.log.push("Nessun developer disponibile all'inizio del combattimento.");return;} this.log.push(`${this.active.name} entra in campo contro ${this.enemy.name}.`); if(this.enemy.typeId==="deadline"){const phase=this.deadlinePhase();if(phase)this.log.push("DEADLINE · FASE 1: "+phase.name+" · "+phase.ability);} this.startTurn(); }
  private setupDeadlinePhases(){
    const phases=[
      {name:"SCOPE CREEP",description:"Il perimetro continua a cambiare.",ability:"+2 Stress inflitto · la DEADLINE subisce +5% danni · primo attacco della fase: +4 Stress extra.",outgoing:1,incomingStress:2,playerDamage:1.05,specialDamage:0,specialStress:4,specialBlockPierce:0},
      {name:"PRODUZIONE CRITICA",description:"Ogni secondo perso costa caro.",ability:"+15% danni inflitti · la DEADLINE subisce +5% danni · primo attacco della fase ignora 5 BLOCCO.",outgoing:1.15,incomingStress:0,playerDamage:1.05,specialDamage:0,specialStress:0,specialBlockPierce:5},
      {name:"CONTO ALLA ROVESCIA",description:"La Deadline accelera improvvisamente.",ability:"+20% danni inflitti e +1 Stress · la DEADLINE subisce +10% danni · primo attacco della fase: +5 danni e +2 Stress.",outgoing:1.2,incomingStress:1,playerDamage:1.1,specialDamage:5,specialStress:2,specialBlockPierce:0},
    ];
    this.deadlinePhaseOrder=this.shuffle(phases);
    this.deadlinePhaseIndex=0;
  }
  private updateDeadlinePhase(){
    if(this.enemy.typeId!=="deadline"||this.deadlinePhaseOrder.length<3)return;
    const threshold=this.enemy.hp<=this.enemy.maxHp/3?2:this.enemy.hp<=this.enemy.maxHp*2/3?1:0;
    const next=Math.min(this.deadlinePhaseIndex+1,threshold);
    if(next<=this.deadlinePhaseIndex)return;
    this.deadlinePhaseIndex=next;
    const phase=this.deadlinePhaseOrder[next];
    this.log.push("DEADLINE · CAMBIO IMPROVVISO: FASE "+(next+1)+" · "+phase.name+" · "+phase.ability);
  }
  get deadlinePhaseName():string{return this.enemy.typeId==="deadline"?(this.deadlinePhaseOrder[this.deadlinePhaseIndex]?.name??"FASE 1"):"";}
  get deadlinePhaseDescription():string{return this.enemy.typeId==="deadline"?(this.deadlinePhaseOrder[this.deadlinePhaseIndex]?.description??""):"";}
  get deadlinePhaseAbility():string{return this.enemy.typeId==="deadline"?(this.deadlinePhaseOrder[this.deadlinePhaseIndex]?.ability??""):"";}
  private deadlinePhase(){return this.enemy.typeId==="deadline"?(this.deadlinePhaseOrder[this.deadlinePhaseIndex]??null):null;}
  private deadlineSpecialActive(){return this.enemy.typeId==="deadline"&&!this.deadlinePhaseTriggered.has(this.deadlinePhaseIndex);}
  private markDeadlineSpecial(){if(this.enemy.typeId==="deadline")this.deadlinePhaseTriggered.add(this.deadlinePhaseIndex);}
  get active(): Developer { return this.team[this.activeIndex]; }
  get itemCodeBonus(): number { return this.active.items.reduce((total,item)=>total+item.codeBonus,0); }
  get itemDebugBonus(): number { return this.active.items.reduce((total,item)=>total+item.debugBonus,0); }
  startTurn(){if(this.result!=="ongoing")return;this.energy=this.nuzlockeRules.includes("twoEnergy")?2:3;this.block=0;this.codeBoost=0;this.temporaryCodeBonus=0;this.firstCardPlayed=false;this.toolPlayedThisTurn=false;this.firstCodeUsed=false;this.drawCards(this.nuzlockeRules.includes("smallHand")?2:3);this.autoSkipIfNoAction();}
  drawCards(count:number){for(let i=0;i<count;i++){if(this.drawPile.length===0){if(this.discardPile.length===0)break;this.drawPile=this.shuffle(this.discardPile.splice(0));}const card=this.drawPile.pop();if(card)this.hand.push(card);}}
  private teamHasClass(classId:string):boolean{return this.team.some(d=>d.classId===classId&&d.hp>0&&d.stress<d.maxStress);}
  private teamHasPassive(classId:string,passive:string):boolean{return this.team.some(d=>d.classId===classId&&d.passive.includes(passive)&&d.hp>0&&d.stress<d.maxStress);}
  private applyInternStressPassive(dev:Developer,stressBefore:number){if(this.nuzlockeRules.includes("noStressRecovery")||this.internStressPassiveUsed.has("team"))return;if(!this.teamHasClass("intern"))return;if(stressBefore<dev.maxStress*.75&&dev.stress>=dev.maxStress*.75){dev.stress=Math.max(0,dev.stress-10);this.internStressPassiveUsed.add("team");this.log.push(`Intern: ${dev.name} supera il 75% Stress · -10 Stress.`);}}
  private conditionMatches(condition:string,dev:Developer):boolean{if(condition==="lowHp")return dev.hp<dev.maxHp*.5;if(condition==="highStress")return dev.stress>=dev.maxStress*.5;if(condition==="fullHp")return dev.hp>=dev.maxHp;if(condition==="highEnergy")return this.energy>=2;if(condition==="defending")return this.block>0;if(condition==="afterTool")return this.toolPlayedThisTurn;if(condition==="everyTwoTurns")return this.turn%2===0;return false;}
  private damageMultiplier(dev:Developer,action:"code"|"debug"|"card"):number{let multiplier=1;if(dev.stress>=dev.maxStress*.75)multiplier*=1.2;else if(dev.stress>=dev.maxStress*.5)multiplier*=1.1;if(dev.advantageEnemyIds.includes(this.enemy.typeId))multiplier*=1.15;if(dev.weaknessEnemyIds.includes(this.enemy.typeId))multiplier*=.85;if(dev.advantageConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=1.1;if(dev.weaknessConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=.9;if(this.enemy.weaknessDeveloperIds.includes(dev.classId))multiplier*=1.15;if(this.enemy.advantageDeveloperIds.includes(dev.classId))multiplier*=.9;if(action==="debug"&&this.enemy.typeId==="client"&&dev.classId==="hacker")multiplier*=1.2;const phase=this.deadlinePhase();if(phase)multiplier*=phase.playerDamage;return multiplier;}
  private incomingMultiplier(dev:Developer):number{let multiplier=1;if(dev.stress>=dev.maxStress*.75)multiplier*=1.1;if(this.enemy.advantageDeveloperIds.includes(dev.classId))multiplier*=1.15;if(this.enemy.weaknessDeveloperIds.includes(dev.classId))multiplier*=.85;if(this.enemy.advantageConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=1.1;if(this.enemy.weaknessConditions.some(c=>this.conditionMatches(c,dev)))multiplier*=.9;const phase=this.deadlinePhase();if(phase)multiplier*=phase.outgoing;return multiplier;}
  private dealDamage(amount:number,action:"code"|"debug"|"card"){let adjusted=amount;if(this.enemy.typeId==="legacy"&&action==="debug")adjusted=Math.max(0,adjusted-2);adjusted=Math.max(0,Math.round(adjusted*this.damageMultiplier(this.active,action)));this.enemy.hp=Math.max(0,this.enemy.hp-adjusted);this.updateDeadlinePhase();return adjusted;}
  playCard(index:number):boolean{const card=this.hand[index];if(!card||this.result!=="ongoing")return false;if(!this.canPlayCard(card))return false;const costReduction=this.teamHasClass("designer")&&!this.firstCardPlayed?1:0;const effectiveCost=Math.max(0,card.cost-costReduction);if(effectiveCost>this.energy)return false;this.energy-=effectiveCost;this.hand.splice(index,1);if(this.nuzlockeRules.includes("battleCardLock"))this.usedCards.add(card);this.discardPile.push(card);this.firstCardPlayed=true;this.toolPlayedThisTurn=true;this.lastToolDeveloperId=this.active.id;switch(card.effect.type){case "damage":{const damage=this.dealDamage(Math.round(card.effect.amount*(1+this.codeBoost/100)),"card");this.log.push(`${card.name}: ${damage} danni.`);break;}case "heal":this.active.hp=Math.min(this.active.maxHp,this.active.hp+card.effect.amount);this.log.push(`${card.name}: +${card.effect.amount} HP.`);break;case "removeStress":this.active.stress=Math.max(0,this.active.stress-card.effect.amount);this.log.push(`${card.name}: -${card.effect.amount} Stress.`);break;case "block":this.block+=card.effect.amount;this.log.push(`${card.name}: +${card.effect.amount} Difesa.`);break;case "codeBoost":this.codeBoost+=card.effect.amount;const stressBefore=this.active.stress;this.active.stress=Math.min(this.active.maxStress,this.active.stress+10);this.applyInternStressPassive(this.active,stressBefore);this.log.push(`${card.name}: +${card.effect.amount}% Codice, +10 Stress.`);break;}this.temporaryCodeBonus=this.teamHasClass("fullstack")?1:0;this.checkBurnout();this.temporaryCodeBonus=this.teamHasClass("fullstack")?1:0;this.checkVictory();if(this.result==="ongoing")this.autoSkipIfNoAction();return true;}
  basicAction(action:"code"|"debug"|"defend"):boolean{if(this.result!=="ongoing")return false;if(action!=="defend"&&this.energy<=0)return false;if(action==="code"){if(this.nuzlockeRules.includes("noCode"))return false;this.energy-=1;let damage=this.active.code+this.itemCodeBonus+this.temporaryCodeBonus;if((this.teamHasPassive("senior","Esperienza")||this.teamHasPassive("senior","Legacy Whisperer"))|| (this.teamHasPassive("senior","Query Optimizer")&&!this.firstCodeUsed))damage+=2;damage=Math.round(damage*(1+this.codeBoost/100));const dealt=this.dealDamage(damage,"code");const stressBefore=this.active.stress;this.active.stress=Math.min(this.active.maxStress,this.active.stress+3);this.applyInternStressPassive(this.active,stressBefore);this.firstCodeUsed=true;this.log.push(`CODICE: ${dealt} danni, +3 Stress.`);}if(action==="debug"){if(this.nuzlockeRules.includes("noDebug")||this.energy<2)return false;this.energy-=2;let debug=this.active.debug+this.itemDebugBonus;if(this.active.hp<this.active.maxHp*.5&&this.teamHasClass("junior"))debug+=2;if(this.teamHasClass("hacker")&&this.enemy.typeId==="client")debug+=3;const damage=Math.round(debug*1.45*(1+this.codeBoost/100));const dealt=this.dealDamage(damage,"debug");const stressBefore=this.active.stress;this.active.stress=Math.min(this.active.maxStress,this.active.stress+5);this.applyInternStressPassive(this.active,stressBefore);this.log.push(`DEBUG: ${dealt} danni, +5 Stress.`);}if(action==="defend"){if(this.nuzlockeRules.includes("noDefense"))return false;const freeDefense=this.teamHasClass("architect")&&!this.architectDefenseUsed.has("team");if(!freeDefense)this.energy-=1;if(this.teamHasClass("architect"))this.architectDefenseUsed.add("team");const firstDevopsDefense=this.teamHasClass("devops")&&!this.devopsDefenseUsed.has("team");const defenseBonus=firstDevopsDefense?5:0;if(this.teamHasClass("devops"))this.devopsDefenseUsed.add("team");this.block+=10+defenseBonus;if(this.teamHasPassive("devops","Auto-Scaling")&&!this.nuzlockeRules.includes("noHealing"))this.active.hp=Math.min(this.active.maxHp,this.active.hp+2);if(this.nuzlockeRules.includes("noStressRecovery"))this.log.push(`DIFESA: ${this.block} danni bloccati${defenseBonus?` (+5)`:``}${this.teamHasPassive("devops","Auto-Scaling")&&!this.nuzlockeRules.includes("noHealing")?" · +2 HP":""}, nessun recupero Stress${freeDefense?" (GRATIS)":""}.`);else{this.active.stress=Math.max(0,this.active.stress-3);this.log.push(`DIFESA: ${this.block} danni bloccati${defenseBonus?` (+5)`:``}${this.teamHasPassive("devops","Auto-Scaling")&&!this.nuzlockeRules.includes("noHealing")?" · +2 HP":""}, -3 Stress${freeDefense?" (GRATIS)":""}.`);}}this.checkBurnout();this.checkVictory();if(this.result==="ongoing")this.autoSkipIfNoAction();return true;}
  canPlayCardForUi(card:Card):boolean{return this.canPlayCard(card);}
  cardPlayReasonForUi(card:Card):string{
    if(this.result!=="ongoing")return "COMBATTIMENTO TERMINATO";
    if(this.nuzlockeRules.includes("oneTool")&&this.toolPlayedThisTurn)return "1 TOOL PER TURNO";
    if(this.nuzlockeRules.includes("battleCardLock")&&this.usedCards.has(card))return "TOOL GIÀ USATO";
    const upper=card.name.toUpperCase();
    const cardId=card.id.toLowerCase();
    if(this.nuzlockeRules.includes("noCoffee")&&(cardId.includes("coffee")||upper.includes("CAFFÈ")||upper.includes("COFFEE")))return "CAFFÈ VIETATO";
    if(this.nuzlockeRules.includes("noAI")&&(cardId==="ai-slop"||cardId.startsWith("chatgpt")||upper.includes("CHATGPT")||upper.split(/[^A-Z0-9À-ÖØ-Ý]+/).includes("AI")))return "AI VIETATA";
    if(this.nuzlockeRules.includes("noGit")&&(cardId==="git"||cardId.startsWith("git-")||upper==="GIT"))return "GIT VIETATO";
    if(this.nuzlockeRules.includes("noHealing")&&card.effect.type==="heal")return "CURE VIETATE";
    if(this.nuzlockeRules.includes("noStressRecovery")&&card.effect.type==="removeStress")return "RECUPERO STRESS VIETATO";
    const costReduction=this.teamHasClass("designer")&&!this.firstCardPlayed?1:0;
    const cost=Math.max(0,card.cost-costReduction);
    if(cost>this.energy)return "SERVONO "+cost+" ⚡";
    return "";
  }
  cardPreview(card:Card):string{
    switch(card.effect.type){
      case "damage": return "~"+this.previewDamage(Math.round(card.effect.amount*(1+this.codeBoost/100)),"card")+" DMG";
      case "heal": return "+"+Math.min(card.effect.amount,this.active.maxHp-this.active.hp)+" HP";
      case "removeStress": return "-"+Math.min(card.effect.amount,this.active.stress)+" STRESS";
      case "block": return "+"+card.effect.amount+" BLOCCO";
      case "codeBoost": return "+"+card.effect.amount+"% COD · +10 STRESS";
      default: return "EFFETTO TOOL";
    }
  }
  switchPreview(index:number):string{
    const dev=this.team[index];
    if(!dev)return "Developer non disponibile";
    return "CAMBIO · 1 ⚡ · HP "+dev.hp+"/"+dev.maxHp+" · STRESS "+dev.stress+"/"+dev.maxStress;
  }
  get latestFeedback():string{return this.log[this.log.length-1]??"";}
  get turnStatus():string{
    if(this.result!=="ongoing")return "COMBATTIMENTO TERMINATO";
    if(this.hasUsableAction())return this.energy>0?"AZIONI DISPONIBILI":"TOOL DISPONIBILE";
    return "TURNO IN CHIUSURA";
  }
  get canCodeForUi():boolean{return this.result==="ongoing"&&this.energy>=1&&!this.nuzlockeRules.includes("noCode");}
  get canDebugForUi():boolean{return this.result==="ongoing"&&this.energy>=2&&!this.nuzlockeRules.includes("noDebug");}
  get canDefendForUi():boolean{
    if(this.result!=="ongoing"||this.nuzlockeRules.includes("noDefense"))return false;
    return this.energy>=1||(this.teamHasClass("architect")&&!this.architectDefenseUsed.has("team"));
  }
  get codePreview():number{
    let damage=this.active.code+this.itemCodeBonus+this.temporaryCodeBonus;
    if((this.teamHasPassive("senior","Esperienza")||this.teamHasPassive("senior","Legacy Whisperer"))|| (this.teamHasPassive("senior","Query Optimizer")&&!this.firstCodeUsed))damage+=2;
    damage=Math.round(damage*(1+this.codeBoost/100));
    return this.previewDamage(damage,"code");
  }
  get debugPreview():number{
    let debug=this.active.debug+this.itemDebugBonus;
    if(this.active.hp<this.active.maxHp*.5&&this.teamHasClass("junior"))debug+=2;
    if(this.teamHasClass("hacker")&&this.enemy.typeId==="client")debug+=3;
    return this.previewDamage(Math.round(debug*1.45*(1+this.codeBoost/100)),"debug");
  }
  get defensePreview():number{return 10+(this.teamHasClass("devops")&&!this.devopsDefenseUsed.has("team")?5:0);}
  get incomingRawPreview():number{let raw=this.enemy.intent.damage;if(this.enemy.typeId==="deadline"){const phase=this.deadlinePhase();raw+=this.turn*2+(this.deadlineSpecialActive()?(phase?.specialDamage??0):0);}return Math.max(0,Math.round(raw*this.incomingMultiplier(this.active)));}
  get incomingDamagePreview():number{const phase=this.deadlinePhase();const special=this.deadlineSpecialActive();const pierce=special?(phase?.specialBlockPierce??0):0;return Math.max(0,this.incomingRawPreview-Math.max(0,this.block-pierce));}
  get incomingStressPreview():number{
    let stress=this.enemy.intent.stress;
    if(this.enemy.typeId==="bug")stress+=this.enemyScaling+1;
    if(this.enemy.typeId==="meeting"&&this.active.stress>=this.active.maxStress*.5)stress+=3;
    if(this.enemy.typeId==="client"&&this.turn%2===0)stress+=2;
    if(this.enemy.typeId==="deadline"){const phase=this.deadlinePhase();stress+=this.turn*2+(phase?.incomingStress??0);}
    const before=this.active.stress;
    const projected=Math.min(this.active.maxStress,before+stress);
    const internTriggers=!this.nuzlockeRules.includes("noStressRecovery")
      && !this.internStressPassiveUsed.has("team")
      && this.teamHasClass("intern")
      && before<this.active.maxStress*.75
      && projected>=this.active.maxStress*.75;
    if(internTriggers)stress=Math.max(0,stress-10);
    return Math.max(0,Math.min(this.active.maxStress-before,stress));
  }
  get incomingLethalPreview():boolean{return this.incomingDamagePreview>=this.active.hp||this.active.stress+this.incomingStressPreview>=this.active.maxStress;}
  private previewDamage(amount:number,action:"code"|"debug"|"card"):number{
    let adjusted=amount;
    if(this.enemy.typeId==="legacy"&&action==="debug")adjusted=Math.max(0,adjusted-2);
    return Math.max(0,Math.round(adjusted*this.damageMultiplier(this.active,action)));
  }
  private canPlayCard(card:Card):boolean{
    if(this.nuzlockeRules.includes("oneTool")&&this.toolPlayedThisTurn)return false;
    if(this.nuzlockeRules.includes("battleCardLock")&&this.usedCards.has(card))return false;
    const upper=card.name.toUpperCase();
    const cardId=card.id.toLowerCase();
    if(this.nuzlockeRules.includes("noCoffee")&&(cardId.includes("coffee")||upper.includes("CAFFÈ")||upper.includes("COFFEE")))return false;
    if(this.nuzlockeRules.includes("noAI")&&(cardId==="ai-slop"||cardId.startsWith("chatgpt")||upper.includes("CHATGPT")||upper.split(/[^A-Z0-9À-ÖØ-Ý]+/).includes("AI")))return false;
    if(this.nuzlockeRules.includes("noGit")&&(cardId==="git"||cardId.startsWith("git-")||upper==="GIT"))return false;
    if(this.nuzlockeRules.includes("noHealing")&&card.effect.type==="heal")return false;
    if(this.nuzlockeRules.includes("noStressRecovery")&&card.effect.type==="removeStress")return false;
    const costReduction=this.teamHasClass("designer")&&!this.firstCardPlayed?1:0;
    return Math.max(0,card.cost-costReduction)<=this.energy;
  }
  private hasUsableAction():boolean{
    if(this.result!=="ongoing")return false;
    if(this.energy>=1&&!this.nuzlockeRules.includes("noCode"))return true;
    if(this.energy>=2&&!this.nuzlockeRules.includes("noDebug"))return true;
    const freeDefense=this.teamHasClass("architect")&&!this.architectDefenseUsed.has("team");
    if(!this.nuzlockeRules.includes("noDefense")&&(this.energy>=1||freeDefense))return true;
    return this.hand.some(card=>this.canPlayCard(card));
  }
  toggleDeck(){this.showDeck=!this.showDeck; if(this.showDeck)this.deckView="draw";}
  setDeckView(view:"draw"|"discard"){this.deckView=view;this.showDeck=true;}
  private autoSkipIfNoAction(){
    if(this.result!=="ongoing"||this.hasUsableAction())return;
    this.log.push("Nessuna azione disponibile: turno saltato automaticamente.");
    this.endTurn(true);
  }

  switchDeveloper(index:number):boolean{if(this.nuzlockeRules.includes("noSwitch")||this.nuzlockeRules.includes("noBattleSwitch"))return false;if(this.energy<1||index===this.activeIndex||!this.team[index]||this.team[index].hp<=0||this.team[index].stress>=this.team[index].maxStress)return false;this.energy-=1;this.activeIndex=index;this.temporaryCodeBonus=this.teamHasClass("fullstack")?1:0;this.log.push(`Cambio: entra ${this.active.name} · HP ${this.active.hp}/${this.active.maxHp} · Stress ${this.active.stress}/${this.active.maxStress}.`);this.autoSkipIfNoAction();return true;}
  endTurn(auto=false){if(this.result!=="ongoing")return;this.discardPile.push(...this.hand.splice(0));this.log.push(auto?"Fine turno automatica: nessuna azione disponibile.":"Fine turno: attacco nemico in arrivo.");this.enemyAttack();this.checkBurnout();if(this.result==="ongoing"){this.turn+=1;this.startTurn();}}
  private enemyAttack(){let raw=this.enemy.intent.damage;let stress=this.enemy.intent.stress;if(this.enemy.typeId==="bug"){this.enemyScaling+=1;stress+=this.enemyScaling;}if(this.enemy.typeId==="meeting"&&this.active.stress>=this.active.maxStress*.5)stress+=3;if(this.enemy.typeId==="client"&&this.turn%2===0)stress+=2;if(this.enemy.typeId==="deadline"){const phase=this.deadlinePhase();const special=this.deadlineSpecialActive();raw+=this.turn*2+(special?(phase?.specialDamage??0):0);stress+=this.turn*2+(phase?.incomingStress??0)+(special?(phase?.specialStress??0):0);}raw=Math.max(0,Math.round(raw*this.incomingMultiplier(this.active)));const phase=this.deadlinePhase();const special=this.deadlineSpecialActive();const blockPierce=special?(phase?.specialBlockPierce??0):0;const effectiveBlock=Math.max(0,this.block-blockPierce);const damage=Math.max(0,raw-effectiveBlock);this.block=Math.max(0,this.block-raw);this.active.hp=Math.max(0,this.active.hp-damage);const stressBefore=this.active.stress;this.active.stress=Math.min(this.active.maxStress,this.active.stress+stress);this.applyInternStressPassive(this.active,stressBefore);if(special){this.log.push(`DEADLINE · ABILITÀ FASE: ${phase?.name??""}`);this.markDeadlineSpecial();}this.log.push(`${this.enemy.name}: ${raw} danni. Subiti ${damage}. +${stress} Stress.`);}
  private checkVictory(){if(this.enemy.hp<=0){this.result="victory";this.log.push(`${this.enemy.name} è stato sconfitto.`);}}
  private checkBurnout(){if(this.active.stress>=this.active.maxStress||this.active.hp<=0){this.log.push(`${this.active.name} è andato in BURNOUT/ESAUSTO.`);const available=this.team.findIndex((d,i)=>i!==this.activeIndex&&d.hp>0&&d.stress<d.maxStress);if(available>=0){this.active.stress=this.active.maxStress;this.activeIndex=available;this.log.push(`Entra ${this.active.name}.`);}else{this.result="defeat";this.log.push("Tutti i developer sono fuori combattimento.");}}}
  private shuffle<T>(items:T[]):T[]{for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
}
