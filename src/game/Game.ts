import { developers } from "../data/developers";
import { enemies, boss } from "../data/enemies";
import { rewardCards, startingDeck } from "../data/cards";
import { rewardItems } from "../data/items";
import type { Card, Developer, Enemy, Item, MapNode, MapNodeType } from "../entities/types";
import { Combat } from "./Combat";

export type GameScreen = "menu" | "team" | "map" | "battleSetup" | "combat" | "reward" | "itemReward" | "recruit" | "equipment" | "result";
type NormalNodeType = Exclude<MapNodeType, "boss">;
type EquipmentSource = { zone: "dev" | "bag"; devIndex: number; itemIndex: number };

const NODE_TEMPLATES: Record<NormalNodeType, Array<{ title: string; description: string }>> = {
  battle: [{ title: "BUG", description: "Qualcosa funziona. Quindi sicuramente c'è un bug." }, { title: "MEETING", description: "Poteva essere una mail." }, { title: "LEGACY", description: "Non sai chi l'ha scritto. Non sai perché esiste." }],
  elite: [{ title: "CLIENTE", description: "Una piccola modifica. Solo 47 requisiti nuovi." }, { title: "PROD", description: "È venerdì pomeriggio. La produzione ha altri piani." }],
  event: [{ title: "EVENTO", description: "Una decisione discutibile potrebbe salvare il progetto." }, { title: "IMPREVISTO", description: "Il cliente ha detto 'non tocco niente'." }],
  rest: [{ title: "PAUSA", description: "Cinque minuti di pausa. Nessuno deve saperlo." }, { title: "CAFFÈ", description: "Il compilatore non si lamenta del caffè." }],
  fullRest: [{ title: "RECUPERO TOTALE", description: "Ricarica completamente HP e Stress di tutto il team." }],
  reward: [{ title: "TOOLBOX", description: "Un nuovo Tool entra nel tuo arsenale." }, { title: "GITHUB", description: "Hai trovato una repository che non è in fiamme." }],
  item: [{ title: "EQUIPMENT", description: "Hai trovato un oggetto utile. Puoi equipaggiarlo o conservarlo nello zaino." }, { title: "SWAG", description: "Merchandising aziendale. Sorprendentemente utile." }],
  recruit: [{ title: "RECLUTAMENTO", description: "Un developer sta cercando disperatamente un progetto." }, { title: "COLLOQUIO", description: "Hai trovato qualcuno che conosce il codice legacy." }]
};
const MAP_SCHEMES: NormalNodeType[][] = [
  ["battle","event","item"],
  ["battle","reward","recruit"],
  ["battle","elite","event"],
  ["rest","reward","item"],
  ["battle","elite","recruit"],
  ["battle","elite","reward"]
];
const MAP_NODE_COST: Partial<Record<NormalNodeType, number>> = {
  battle:1, elite:2, event:1, rest:0, fullRest:0, reward:1, item:1, recruit:2
};

export class Game {
  screen:GameScreen="menu"; team:Developer[]=[]; deck:Card[]=[]; inventory:Item[]=[]; combat:Combat|null=null; pendingEnemy:Enemy|null=null; currentNode=0; tempo=8; mapNodes:MapNode[]=[]; currentMapNodeId:string|null=null; projectNumber=1; difficulty=1; reward:Card|null=null; itemReward:Item|null=null; startingCandidates:Developer[]=[]; recruitCandidates:Developer[]=[]; selectedStartingId:string|null=null; selectedRecruitIndex:number|null=null; recruitTargetIndex:number|null=null; selectedItemTargetIndex:number|null=null; selectedBattleStarterIndex=0; equipmentSource:EquipmentSource|null=null; equipmentReturnScreen:GameScreen="map"; message="";
  start(){this.screen="team";this.team=[];this.deck=[...startingDeck];this.inventory=[];this.currentNode=0;this.tempo=8;this.mapNodes=[];this.currentMapNodeId=null;this.projectNumber=1;this.difficulty=1;this.reward=null;this.itemReward=null;this.combat=null;this.pendingEnemy=null;this.selectedStartingId=null;this.recruitCandidates=[];this.selectedRecruitIndex=null;this.recruitTargetIndex=null;this.selectedItemTargetIndex=null;this.selectedBattleStarterIndex=0;this.equipmentSource=null;this.startingCandidates=this.randomDevelopers(3);this.message="Tre developer disponibili. Scegline UNO come protagonista.";}
  private cloneItem(item:Item):Item{return {...item};}
  private cloneDeveloper(dev:Developer):Developer{return {...dev,items:dev.items.map(x=>this.cloneItem(x))};}
  private randomDevelopers(count:number,excluded:string[]=[]){const pool=developers.filter(d=>!excluded.includes(d.id));return [...pool].sort(()=>Math.random()-.5).slice(0,count).map(d=>this.cloneDeveloper(d));}
  selectStartingDeveloper(index:number){const c=this.startingCandidates[index];if(c)this.selectedStartingId=c.id;}
  confirmStartingDeveloper(){if(!this.selectedStartingId)return;const c=this.startingCandidates.find(d=>d.id===this.selectedStartingId);if(!c)return;this.team=[{...this.cloneDeveloper(c),hp:c.maxHp,stress:0,items:[]}];this.generateMap();this.screen="map";this.message=`${c.name} è il developer principale. Il primo bivio offre combattimento, evento e oggetto.`;}
  private randomTemplate(type:NormalNodeType){const list=NODE_TEMPLATES[type];return list[Math.floor(Math.random()*list.length)];}
  private enemyForNode(type:"battle"|"elite"){const pool=type==="elite"?enemies.filter(e=>e.id==="client"||e.id==="legacy"):enemies;return pool[Math.floor(Math.random()*pool.length)]??enemies[0];}
  private mapNode(type:NormalNodeType,row:number,col:number):MapNode{
    const t=this.randomTemplate(type);
    const battle=type==="battle"||type==="elite";
    const source=battle?this.enemyForNode(type):undefined;
    const hidden=battle?Math.random()<.38:false;
    return {
      id:`r${row}c${col}-${Math.random().toString(36).slice(2,7)}`,
      row,col,type,
      title:source&&!hidden?`${source.type.toUpperCase()} · ${source.name}`:t.title,
      description:source&&!hidden?source.description:hidden?"L'incontro è sconosciuto. Potrebbe essere un problema grosso.":t.description,
      next:[],visited:false,hiddenEncounter:hidden,...(source?{enemyId:source.id}:{})
    };
  }

  private appendStageChoices(stage:number){
    const rows=this.mapNodes.filter(n=>n.row===stage);
    if(rows.length)return;
    const scheme=MAP_SCHEMES[stage-1]??MAP_SCHEMES[MAP_SCHEMES.length-1];
    const types=[...scheme].sort(()=>Math.random()-.5);
    types.forEach((type,col)=>this.mapNodes.push(this.mapNode(type,stage,col)));
    const from=this.mapNodes.filter(n=>n.row===stage-1);
    const to=this.mapNodes.filter(n=>n.row===stage);
    if(!from.length)return;
    from.forEach(node=>{
      const candidates=to
        .slice()
        .sort((x,y)=>Math.abs(x.col-node.col)-Math.abs(y.col-node.col)||Math.random()-.5);
      const count=Math.random()<.55?1:2;
      candidates.slice(0,count).forEach(target=>node.next.push(target.id));
    });
    // Every destination must remain reachable, while preserving crossing paths.
    to.forEach(target=>{
      if(!from.some(source=>source.next.includes(target.id))){
        const source=from
          .slice()
          .sort((x,y)=>Math.abs(x.col-target.col)-Math.abs(y.col-target.col))[0];
        if(source&&!source.next.includes(target.id))source.next.push(target.id);
      }
    });
  }

  private appendBossNode(row:number){
    const bossNode:MapNode={id:`boss-${row}-${Math.random().toString(36).slice(2,6)}`,row,col:1,type:"boss",title:"DEADLINE",description:"DOMANI È ONLINE. Naturalmente nessuno l'aveva detto prima.",next:[],visited:false,hiddenEncounter:false,enemyId:"deadline"};
    this.mapNodes.push(bossNode);
    const current=this.currentMapNode;
    if(current)current.next=[bossNode.id];
  }

  private skipFinalRestForTimeout(){
    const current=this.currentMapNode;
    const bossNode=this.mapNodes.find(n=>n.type==="boss");
    if(current&&bossNode)current.next=[bossNode.id];
    this.message="TEMPO ESAURITO. La PAUSA FINALE salta: la DEADLINE è arrivata.";
  }

  private generateMap(){
    this.mapNodes=[{id:"start",row:0,col:1,type:"rest",title:"START",description:"Il progetto parte. Per ora non è ancora esploso.",next:[],visited:true,hiddenEncounter:false}];
    this.currentMapNodeId="start";
    this.currentNode=0;
    this.tempo=8;
    for(let stage=1;stage<=6;stage++)this.appendStageChoices(stage);
    const start=this.mapNodes.find(n=>n.id==="start");
    const first=this.mapNodes.filter(n=>n.row===1);
    if(start)start.next=first.map(n=>n.id);

    const finalRest:MapNode={id:"rest-final",row:7,col:1,type:"rest",title:"PAUSA FINALE",description:"Ultima pausa prima della Deadline. Recupera il team e preparati allo scontro.",next:["boss-final"],visited:false,hiddenEncounter:false};
    const finalBoss:MapNode={id:"boss-final",row:8,col:1,type:"boss",title:"DEADLINE",description:"DOMANI È ONLINE. Naturalmente nessuno l'aveva detto prima.",next:[],visited:false,hiddenEncounter:false,enemyId:"deadline"};
    this.mapNodes.push(finalRest,finalBoss);
    this.mapNodes.filter(n=>n.row===6).forEach(n=>n.next=[finalRest.id]);
  }

  get currentMapNode(){return this.mapNodes.find(n=>n.id===this.currentMapNodeId)??null;}
  get availableMapNodes(){
    const c=this.currentMapNode;
    if(!c)return [];
    return c.next.map(id=>this.mapNodes.find(n=>n.id===id)).filter((n):n is MapNode=>n!==undefined&&!n.visited);
  }
  selectMapNode(id:string){
    const node=this.mapNodes.find(n=>n.id===id);
    if(!node||node.visited||!this.availableMapNodes.some(n=>n.id===id))return;
    this.currentMapNodeId=id;
    node.visited=true;
    this.currentNode=Math.min(node.row,6);

    if(node.type==="boss"){
      return this.prepareBattle(this.scaleEnemy({...boss,intent:{...boss.intent}}));
    }

    const cost=MAP_NODE_COST[node.type]??1;
    this.tempo=Math.max(0,this.tempo-cost);

    if(node.type==="battle"||node.type==="elite"){
      const source=enemies.find(e=>e.id===node.enemyId)??this.enemyForNode(node.type);
      this.prepareBattle(this.scaleEnemy({...source,intent:{...source.intent}}));
    }else if(node.type==="reward"){
      this.generateReward();
    }else if(node.type==="item"){
      this.generateItemReward();
    }else if(node.type==="recruit"){
      this.openRecruitment();
    }else if(node.type==="fullRest"){
      this.team.forEach(d=>{d.hp=d.maxHp;d.stress=0;});
      this.message="RECUPERO TOTALE: tutto il team è completamente guarito e senza Stress.";
    }else if(node.type==="rest"){
      this.team.forEach(d=>{d.hp=Math.min(d.maxHp,d.hp+14);d.stress=Math.max(0,d.stress-10);});
      this.message=node.id==="rest-final"?"PAUSA FINALE: +14 HP e -10 STRESS al team. La Deadline aspetta.":"PAUSA: +14 HP e -10 STRESS al team.";
    }else{
      if(Math.random()<.5){
        this.team.forEach(d=>d.stress=Math.max(0,d.stress-8));
        this.message="EVENTO: hai trovato una soluzione su Stack Overflow. -8 STRESS.";
      }else{
        this.team.forEach(d=>d.stress=Math.min(100,d.stress+5));
        this.message="EVENTO: 'facciamo una call veloce'. +5 STRESS.";
      }
    }

    if(this.tempo<=0){
      this.skipFinalRestForTimeout();
    }else if(node.row>=6){
      this.message="Ultima tappa completata. La PAUSA FINALE è davanti a te.";
      const finalRest=this.mapNodes.find(n=>n.id==="rest-final");
      if(finalRest)node.next=[finalRest.id];
    }
  }

  private prepareBattle(enemy:Enemy){this.pendingEnemy=enemy;this.selectedBattleStarterIndex=this.team.findIndex(d=>d.hp>0&&d.stress<100);if(this.selectedBattleStarterIndex<0)this.selectedBattleStarterIndex=0;this.screen="battleSetup";this.message="Scegli chi manda in campo per primo. Trascinalo nello slot di combattimento.";}
  selectBattleStarter(index:number){const d=this.team[index];if(d&&d.hp>0&&d.stress<100)this.selectedBattleStarterIndex=index;}
  moveBattleStarter(fromIndex:number){const d=this.team[fromIndex];if(!d||d.hp<=0||d.stress>=100)return;const current=this.team.splice(fromIndex,1)[0];if(current)this.team.unshift(current);this.selectedBattleStarterIndex=0;}
  confirmBattleStarter(){if(!this.pendingEnemy||!this.team[this.selectedBattleStarterIndex]||this.team[this.selectedBattleStarterIndex].hp<=0||this.team[this.selectedBattleStarterIndex].stress>=100)return;const first=this.team.splice(this.selectedBattleStarterIndex,1)[0];if(first)this.team.unshift(first);this.startBattle(this.pendingEnemy);}
  private openRecruitment(){this.recruitCandidates=this.randomDevelopers(3,this.team.map(d=>d.id));this.selectedRecruitIndex=null;this.recruitTargetIndex=this.team.length>=3?null:0;this.screen="recruit";this.message=this.team.length>=3?"Hai già 3 developer. Scegli un candidato e poi chi sostituire.":"Scegli un nuovo developer da aggiungere al team.";}
  selectRecruitCandidate(index:number){if(!this.recruitCandidates[index])return;this.selectedRecruitIndex=index;if(this.team.length<3)this.confirmRecruitment();}
  selectRecruitTarget(index:number){if(this.team.length<3||!this.team[index])return;this.recruitTargetIndex=index;}
  confirmRecruitment(){if(this.selectedRecruitIndex===null)return;const c=this.recruitCandidates[this.selectedRecruitIndex];if(!c)return;const fresh={...c,hp:c.maxHp,stress:0,items:[]};if(this.team.length<3)this.team.push(fresh);else{if(this.recruitTargetIndex===null)return;this.team[this.recruitTargetIndex]=fresh;}this.selectedRecruitIndex=null;this.recruitTargetIndex=null;this.recruitCandidates=[];this.screen="map";this.message=`${c.name} entra nel team. Scegli il prossimo nodo.`;}
  private randomEnemy(elite=false):Enemy{const pool=elite?enemies.filter(e=>e.id==="client"||e.id==="legacy"):enemies;const source=pool[Math.floor(Math.random()*pool.length)]??enemies[0];return this.scaleEnemy({...source,intent:{...source.intent}});}
  private scaleEnemy(enemy:Enemy):Enemy{const m=this.difficulty;return {...enemy,hp:Math.max(1,Math.round(enemy.maxHp*m)),maxHp:Math.max(1,Math.round(enemy.maxHp*m)),intent:{...enemy.intent,damage:Math.max(1,Math.round(enemy.intent.damage*m)),stress:Math.max(1,Math.round(enemy.intent.stress*(1+(m-1)*.5)))}};}
  startBattle(enemy:Enemy){this.combat=new Combat(this.team,enemy,this.deck);this.screen="combat";this.pendingEnemy=null;}
  enterRandomBattle(){this.prepareBattle(this.randomEnemy());}
  enterBoss(){this.prepareBattle(this.scaleEnemy({...boss,intent:{...boss.intent}}));}
  chooseReward(_cardIndex:number){if(!this.reward)return;this.deck.push({...this.reward});this.reward=null;this.screen="map";this.message="Tool acquisito. Scegli il prossimo nodo.";}
  generateReward(){const reward=rewardCards[Math.floor(Math.random()*rewardCards.length)];if(reward)this.reward={...reward};this.screen="reward";}
  generateItemReward(){const item=rewardItems[Math.floor(Math.random()*rewardItems.length)];if(!item)return;this.itemReward=this.cloneItem(item);this.selectedItemTargetIndex=null;this.screen="itemReward";this.message="Oggetto sbloccato. Puoi equipaggiarlo subito oppure metterlo nello zaino.";}
  selectItemTarget(index:number){if(!this.team[index]||this.team[index].items.length>=2||!this.itemReward)return;this.selectedItemTargetIndex=index;}
  confirmItemReward(){if(!this.itemReward||this.selectedItemTargetIndex===null)return;const target=this.team[this.selectedItemTargetIndex];if(!target||target.items.length>=2)return;target.items.push(this.cloneItem(this.itemReward));const name=target.name,item=this.itemReward.name;this.itemReward=null;this.selectedItemTargetIndex=null;this.screen="map";this.message=`${item} equipaggiato su ${name}. Puoi spostarlo in seguito da EQUIPMENT.`;}
  storeItemReward(){if(!this.itemReward)return;const itemName=this.itemReward.name;this.inventory.push(this.cloneItem(this.itemReward));this.itemReward=null;this.selectedItemTargetIndex=null;this.screen="map";this.message=`${itemName} messo nello ZAINO. Puoi equipaggiarlo quando vuoi.`;}
  get equipmentTeam(){return this.combat?this.combat.team:this.team;}
  openEquipment(){if(this.screen==="equipment")return;this.equipmentReturnScreen=this.screen==="combat"?"combat":"map";this.equipmentSource=null;this.screen="equipment";}
  closeEquipment(){this.equipmentSource=null;this.screen=this.equipmentReturnScreen;}
  selectEquipmentSource(zone:"dev"|"bag",itemIndex:number,devIndex=-1){const team=this.equipmentTeam;const item=zone==="bag"?this.inventory[itemIndex]:team[devIndex]?.items[itemIndex];if(!item)return;this.equipmentSource={zone,itemIndex,devIndex};}
  moveSelectedEquipment(targetZone:"dev"|"bag",targetDevIndex=-1,targetItemIndex=-1){const source=this.equipmentSource;if(!source)return;const team=this.equipmentTeam;const sourceItems=source.zone==="bag"?this.inventory:team[source.devIndex]?.items;if(!sourceItems||!sourceItems[source.itemIndex])return;if(targetZone==="dev"){const targetItems=team[targetDevIndex]?.items;if(!targetItems||targetItemIndex<0||targetItemIndex>1)return;if(source.zone==="dev"&&source.devIndex===targetDevIndex&&source.itemIndex===targetItemIndex)return;const sourceItem=sourceItems[source.itemIndex],targetItem=targetItems[targetItemIndex];if(source.zone==="dev"&&source.devIndex===targetDevIndex){[targetItems[targetItemIndex],targetItems[source.itemIndex]]=[targetItems[source.itemIndex],targetItems[targetItemIndex]];}else{if(targetItem)sourceItems[source.itemIndex]=targetItem;else sourceItems.splice(source.itemIndex,1);targetItems[targetItemIndex]=sourceItem;}}else if(source.zone==="bag"){if(targetItemIndex>=0&&targetItemIndex<this.inventory.length)[this.inventory[source.itemIndex],this.inventory[targetItemIndex]]=[this.inventory[targetItemIndex],this.inventory[source.itemIndex]];}else{this.inventory.push(sourceItems[source.itemIndex]);sourceItems.splice(source.itemIndex,1);}this.equipmentSource=null;}
  updateTeamFromCombat(){if(this.combat)this.team=this.combat.team;}
  onCombatFinished(){this.updateTeamFromCombat();if(this.combat?.result==="victory"){if(this.combat.enemy.id==="deadline"){this.team.forEach(dev=>{dev.hp=dev.maxHp;dev.stress=0;});this.projectNumber+=1;this.difficulty+=.5;this.generateMap();this.screen="map";this.message=`MISSIONE COMPLETATA. Team completamente ripristinato: HP e STRESS azzerati. Progetto #${this.projectNumber} · difficoltà x${this.difficulty.toFixed(1)}.`;}else{const winner=this.team.find(dev=>dev.id==="freelancer");if(winner)winner.hp=Math.min(winner.maxHp,winner.hp+5);this.generateReward();}}else if(this.combat?.result==="defeat"){this.screen="result";this.message="PROJECT FAILED.";}}
  restart(){this.start();}
}
