import { Game } from "../game/Game";
import { renderPokerCard } from "../card-view";
import type { Developer, Enemy, MapNode } from "../entities/types";

const root = document.querySelector<HTMLDivElement>("#app")!;
const pct = (v:number,m:number) => m <= 0 ? 0 : Math.max(0,Math.min(100,Math.round(v/m*100)));
const esc = (v:string) => v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

function equipmentSlots(dev:Developer) {
  const slots = [0,1].map(i => {
    const item = dev.items[i];
    return item ? `<div class="equip-slot filled"><span>SLOT ${i+1}</span><b>${esc(item.name)}</b><small>+${item.codeBonus} COD · +${item.debugBonus} DEBUG</small></div>` : `<div class="equip-slot empty"><span>SLOT ${i+1}</span><b>VUOTO</b><small>Disponibile</small></div>`;
  }).join("");
  return `<div class="equipment-slots"><strong>EQUIPAGGIAMENTO</strong><div class="slot-row">${slots}</div></div>`;
}

function devCard(dev:Developer, selected=false, compact=false, showEquipment=true) {
  const advantages = dev.advantages.map(x=>`<span>${esc(x)}</span>`).join("");
  const weaknesses = dev.weaknesses.map(x=>`<span>${esc(x)}</span>`).join("");
  return `<div class="dev-card ${selected?"selected":""} ${compact?"compact":""}"><div class="dev-head"><b>${esc(dev.name)}</b><span>${esc(dev.role)}</span></div><p class="dev-description">${esc(dev.description)}</p><div class="stat-line"><span>HP</span><b>${dev.hp}/${dev.maxHp}</b></div><div class="bar"><i style="width:${pct(dev.hp,dev.maxHp)}%"></i></div><div class="stat-line"><span>STRESS</span><b>${dev.stress}/100</b></div><div class="stress"><i style="width:${dev.stress}%"></i></div><div class="stat-grid"><span>CODICE <b>${dev.code}</b></span><span>DEBUG <b>${dev.debug}</b></span></div><div class="ability"><strong>ABILITÀ</strong><br>${esc(dev.passive)}</div><div class="matchup-grid"><div><strong>VANTAGGI</strong>${advantages}</div><div><strong>DEBOLEZZE</strong>${weaknesses}</div></div>${showEquipment?equipmentSlots(dev):""}</div>`;
}

function enemyCard(enemy:Enemy) {
  const advantages = enemy.advantages.map(x=>`<span>${esc(x)}</span>`).join("");
  const weaknesses = enemy.weaknesses.map(x=>`<span>${esc(x)}</span>`).join("");
  return `<div class="enemy-team-card"><div class="enemy-head"><div><div class="enemy-type">${esc(enemy.type)}</div><div class="enemy-name">${esc(enemy.name)}</div></div><span class="enemy-badge">NEMICO</span></div><p class="enemy-description">${esc(enemy.description)}</p><div class="big-hp">${enemy.hp}/${enemy.maxHp} HP</div><div class="bar"><i style="width:${pct(enemy.hp,enemy.maxHp)}%"></i></div><div class="enemy-stat-grid"><span>CODICE <b>${enemy.code}</b></span><span>DEBUG <b>${enemy.debug}</b></span><span>DMG <b>${enemy.intent.damage}</b></span><span>STRESS <b>+${enemy.intent.stress}</b></span></div><div class="enemy-ability"><strong>ABILITÀ</strong><br>${esc(enemy.passive)}</div><div class="matchup-grid enemy-matchup"><div><strong>VANTAGGI</strong>${advantages}</div><div><strong>DEBOLEZZE</strong>${weaknesses}</div></div></div>`;
}

const nodeIcon:Record<MapNode["type"],string> = {battle:"⚔",elite:"☠",event:"?",rest:"+",fullRest:"♥",reward:"◆",item:"🔧",recruit:"👤",boss:"☠"};

function nodeClass(node:MapNode,game:Game){
  const available=game.availableMapNodes.some(x=>x.id===node.id);
  const current=game.currentMapNodeId===node.id;
  return ["map-node",`type-${node.type}`,node.visited?"visited":"",available?"available":"",current?"current":"",node.hiddenEncounter?"hidden-encounter":""].filter(Boolean).join(" ");
}

function renderMapNode(node:MapNode,game:Game){
  const available=game.availableMapNodes.some(x=>x.id===node.id);
  const hidden=node.hiddenEncounter&&(node.type==="battle"||node.type==="elite");
  const label=hidden?"?":node.title;
  const typeLabel=hidden?"INCONTRO":node.type==="boss"?"DEADLINE":node.type.toUpperCase();
  return `<button type="button" class="${nodeClass(node,game)}" data-map-node="${node.id}" ${available?"":"disabled"} title="${esc(node.description)}"><span class="node-icon">${nodeIcon[node.type]}</span><b>${esc(label)}</b><small>${typeLabel}</small></button>`;
}

function renderMap(game:Game){
  const width=900;
  const rowHeight=108;
  const topPadding=72;
  const bottomPadding=72;
  const rows=Math.max(8,...game.mapNodes.map(n=>n.row));
  const height=rows*rowHeight+topPadding+bottomPadding;
  const x=(col:number)=>150+col*300;
  const y=(row:number)=>topPadding+row*rowHeight;

  const lines=game.mapNodes.flatMap(node=>node.next.map(nextId=>{
    const target=game.mapNodes.find(n=>n.id===nextId);
    if(!target)return "";
    const unlocked=node.visited&&(target.visited||game.availableMapNodes.some(n=>n.id===target.id));
    const active=node.visited&&target.visited;
    const reachable=node.visited&&game.availableMapNodes.some(n=>n.id===target.id);
    if(!unlocked)return "";
    return `<line class="map-line ${active?"active":""} ${reachable?"reachable":""}" x1="${x(node.col)}" y1="${y(node.row)}" x2="${x(target.col)}" y2="${y(target.row)}"/>`;
  })).join("");

  const nodes=game.mapNodes.map(node=>`<div class="map-node-wrap" style="left:${x(node.col)/width*100}%;top:${y(node.row)}px">${renderMapNode(node,game)}</div>`).join("");

  return `<div class="map-viewport"><div class="map-canvas" style="height:${height}px"><svg class="map-lines" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${lines}</svg>${nodes}</div></div>`;
}
function teamSummary(dev:Developer,i:number){return `<div class="team-summary ${i===0?"main-member":""}">${devCard(dev,i===0,true)}</div>`;}
function battleSetup(game:Game){const enemy=game.pendingEnemy!;const team=game.team.map((dev,i)=>`<div class="draggable-dev ${game.selectedBattleStarterIndex===i?"selected":""} ${dev.hp<=0||dev.stress>=100?"disabled-dev":""}" draggable="${dev.hp>0&&dev.stress<100?"true":"false"}" data-battle-dev="${i}"><div class="setup-dev-card"><div class="setup-dev-inner">${devCard(dev,i===game.selectedBattleStarterIndex,true)}</div></div></div>`).join("");return `<section class="panel battle-setup"><div class="selection-heading"><div><h2>SCHIERAMENTO</h2><p>Scegli il Developer da mandare in campo. Puoi cliccarlo oppure trascinarlo nello slot centrale.</p></div><span class="random-badge">PRIMO TURNO</span></div><div class="lineup"><div class="lineup-side team-lineup"><h3>IL TUO TEAM</h3><div class="setup-team">${team}</div></div><div class="battle-drop-zone" data-battle-drop><div class="drop-label">TRASCINA QUI</div><div class="drop-icon">VS</div><div class="drop-selected">${esc(game.team[game.selectedBattleStarterIndex]?.name??"NESSUNO")}</div><small>Questo Developer inizierà il combattimento</small></div><div class="lineup-side enemy-lineup"><h3>NEMICO</h3>${enemyCard(enemy)}</div></div><div class="setup-footer"><span>Clicca un Developer oppure trascinalo al centro.</span><button type="button" class="primary" data-action="confirm-battle">INIZIA COMBATTIMENTO</button></div></section>`;}

function equipmentDeveloper(game:Game,dev:Developer,index:number){const slots=[0,1].map(i=>{const item=dev.items[i],selected=game.equipmentSource?.zone==="dev"&&game.equipmentSource.devIndex===index&&game.equipmentSource.itemIndex===i;return `<button type="button" class="move-slot ${item?"filled":"empty"} ${selected?"selected":""}" data-eq-source-zone="dev" data-eq-source-dev="${index}" data-eq-source-item="${i}"><span>SLOT ${i+1}</span><b>${item?esc(item.name):"VUOTO"}</b><small>${item?`+${item.codeBonus} COD · +${item.debugBonus} DEBUG`:"Slot disponibile"}</small></button>`;}).join("");return `<div class="equipment-developer"><div class="equipment-dev-info">${devCard(dev,false,true)}</div><div class="equipment-move-slots"><h3>OGGETTI EQUIPAGGIATI</h3>${slots}</div></div>`;}
function equipmentScreen(game:Game){const bag=game.inventory.map((item,i)=>`<button type="button" class="backpack-item ${game.equipmentSource?.zone==="bag"&&game.equipmentSource.itemIndex===i?"selected":""}" data-eq-source-zone="bag" data-eq-source-item="${i}"><b>${esc(item.name)}</b><span>+${item.codeBonus} COD · +${item.debugBonus} DEBUG</span><small>${esc(item.description)}</small></button>`).join("");return `<section class="panel equipment-panel"><div class="selection-heading"><div><h2>EQUIPMENT & ZAINO</h2><p>Seleziona un oggetto e poi clicca lo slot di destinazione. Puoi spostare e scambiare gli oggetti tra tutti i developer in qualsiasi momento.</p></div><span class="random-badge">ZAINO · ${game.inventory.length}</span></div><div class="equipment-layout"><div class="equipment-team"><h3>TEAM</h3>${game.equipmentTeam.map((dev,i)=>equipmentDeveloper(game,dev,i)).join("")}</div><aside class="backpack panel"><h3>ZAINO</h3><p>Oggetti non equipaggiati e oggetti extra.</p><div class="backpack-items">${bag||"<div class=\"backpack-empty\">ZAINO VUOTO</div>"}</div><button type="button" class="bag-drop" data-eq-target-zone="bag" data-eq-target-item="-1">METTI NELLO ZAINO</button></aside></div><div class="equipment-footer"><span>${game.equipmentSource?"Oggetto selezionato: scegli ora una destinazione.":"2 slot per developer. Gli oggetti extra restano nello zaino."}</span><button type="button" class="primary" data-action="close-equipment">TORNA INDIETRO</button></div></section>`;}

export function render(game:Game){root.innerHTML=`<main class="game-shell"><header><div><div class="logo">DEV<span>LIKE</span></div><small>SHIP IT OR BURN OUT.</small></div><div class="header-right"><div class="header-stat">COMMESSA ${game.projectNumber} · TAPPA ${Math.min(game.currentNode,6)}/6 · TEMPO ${game.tempo} · DIFFICOLTÀ x${game.difficulty.toFixed(1)}</div></div></header>${screen(game)}</main>`;bind(game);}
function screen(game:Game){
  if(game.screen==="menu")return `<section class="panel center"><div class="pixel-icon">⌨</div><h1>DEVLIKE</h1><p>Un roguelike dove il vero boss è il cliente.</p><button type="button" class="primary" data-action="start">NUOVA COMMESSA</button></section>`;
  if(game.screen==="team")return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>SCEGLI IL DEVELOPER PRINCIPALE</h2><p>Ogni commessa parte con un solo developer. Gli altri arriveranno lungo il percorso.</p></div><span class="random-badge">3 CANDIDATI CASUALI</span></div><div class="developer-choice-grid">${game.startingCandidates.map(dev=>`<button type="button" class="developer-choice ${game.selectedStartingId===dev.id?"selected":""}" data-dev="${dev.id}">${devCard(dev,game.selectedStartingId===dev.id,false,false)}</button>`).join("")}</div><div class="selection-footer"><div class="selection-hint">${game.selectedStartingId?"Developer selezionato. Controlla statistiche, abilità, vantaggi e debolezze, poi conferma.":"Clicca una scheda per selezionare il tuo protagonista."}</div><button type="button" class="primary" data-action="confirm-start" ${game.selectedStartingId?"":"disabled"}>INIZIA LA COMMESSA</button></div></section>`;
  if(game.screen==="map"){
    const choices=game.availableMapNodes;
    const progress=Math.min(6,Math.max(0,game.currentNode));
    const tempoState=game.tempo<=2?"CRITICO":game.tempo<=4?"BASSO":"OK";
    const choiceText=choices.map(node=>`${nodeIcon[node.type]} ${node.hiddenEncounter?"?":node.title} — ${esc(node.description)}`).join("<br>");
    return `<section class="panel map-panel">
      <div class="map-top">
        <div><b>COMMESSA #${game.projectNumber}</b><br><small>${esc(game.message||"Scegli il prossimo nodo.")}</small></div>
        <div class="map-status"><span class="tempo-badge ${tempoState.toLowerCase()}">TEMPO <b>${game.tempo}</b></span><span class="map-progress">TAPPA <b>${progress}/6</b></span></div>
      </div>
      <div class="map-objective"><strong>OBIETTIVO</strong><span>Segui il percorso, gestisci il Tempo e arriva alla PAUSA FINALE prima della DEADLINE.</span></div>
      <div class="roguelike-help"><span>⚔ BATTAGLIA</span><span>☠ ELITE</span><span>? EVENTO</span><span>◆ TOOL</span><span>🔧 OGGETTO</span><span>👤 RECLUTA</span><span>+ PAUSA</span><span>☠ DEADLINE</span></div>
      ${renderMap(game)}
      <div class="team-strip">${game.team.map(teamSummary).join("")}</div>
    </section>`;
  }
  if(game.screen==="battleSetup")return battleSetup(game);
  if(game.screen==="recruit"){const candidates=game.recruitCandidates.map((dev,i)=>`<button type="button" class="developer-choice" data-recruit-index="${i}">${devCard(dev,game.selectedRecruitIndex===i)}</button>`).join("");const replace=game.team.length>=3?`<div class="replacement-box"><h3>SOSTITUISCI UN MEMBRO</h3><p>Hai già 3 developer. Seleziona prima il membro da mandare via.</p><div class="replacement-team">${game.team.map((dev,i)=>`<button type="button" class="replace-target ${game.recruitTargetIndex===i?"selected":""}" data-target="${i}">${esc(dev.name)}<small>${esc(dev.role)} · HP ${dev.hp} · Oggetti ${dev.items.length}/2</small></button>`).join("")}</div><button type="button" class="primary" data-action="confirm-recruit" ${game.selectedRecruitIndex!==null&&game.recruitTargetIndex!==null?"":"disabled"}>SOSTITUISCI MEMBRO</button></div>`:`<p class="recruit-note">Scegli un candidato: entrerà immediatamente nel team.</p>`;return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>RECLUTAMENTO</h2><p>${esc(game.message)}</p></div><span class="random-badge">3 CANDIDATI</span></div><div class="developer-choice-grid">${candidates}</div>${replace}</section>`;}
  if(game.screen==="itemReward"&&game.itemReward){const targets=game.team.map((dev,i)=>{const full=dev.items.length>=2;return `<button type="button" class="assignment-card ${game.selectedItemTargetIndex===i?"selected":""}" data-item-target="${i}" ${full?"disabled":""}><div><b>${esc(dev.name)}</b><span>${esc(dev.role)}</span></div><div class="item-target-stats">HP ${dev.hp}/${dev.maxHp} · COD ${dev.code} · DEBUG ${dev.debug}</div><div class="matchup-mini"><strong>VANTAGGI</strong> ${dev.advantages.map(esc).join(" · ")}<br><strong>DEBOLEZZE</strong> ${dev.weaknesses.map(esc).join(" · ")}</div>${equipmentSlots(dev)}<em>${full?"INVENTARIO PIENO — USA LO ZAINO":"CLICCA PER SELEZIONARE"}</em></button>`;}).join("");return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>OGGETTO SBLOCCATO</h2><p>${esc(game.message)}</p></div><span class="random-badge">EQUIPAGGIAMENTO</span></div><div class="item-reward-card"><h2>${esc(game.itemReward.name)}</h2><p>${esc(game.itemReward.description)}</p><div class="item-bonus">+${game.itemReward.codeBonus} CODICE · +${game.itemReward.debugBonus} DEBUG</div></div><h3 class="assign-title">A QUALE DEVELOPER CONSEGNARLO?</h3><div class="assignment-grid">${targets}</div><div class="selection-footer"><div class="selection-hint">${game.selectedItemTargetIndex===null?"Puoi anche metterlo direttamente nello zaino.":`Consegnerai ${esc(game.itemReward.name)} a ${esc(game.team[game.selectedItemTargetIndex]?.name??"")}.`}</div><div class="reward-actions"><button type="button" class="secondary" data-action="store-item">METTI NELLO ZAINO</button><button type="button" class="primary" data-action="confirm-item" ${game.selectedItemTargetIndex!==null?"":"disabled"}>EQUIPAGGIA OGGETTO</button></div></div></section>`;}
  if(game.screen==="equipment")return equipmentScreen(game);
  if(game.screen==="combat"&&game.combat){const c=game.combat;const active=c.active;const enemy=c.enemy;
const effectiveStats=(d:Developer,isActive=false)=>{
  const codeChanges:string[]=[];
  const debugChanges:string[]=[];
  let code=d.code+(d.classId==="senior"?2:0)+(isActive?c.temporaryCodeBonus:0);
  let debug=d.debug+(d.classId==="junior"&&d.hp<d.maxHp*.5?2:0)+(d.classId==="hacker"&&enemy.typeId==="client"?3:0);

  for(const item of d.items){
    if(item.codeBonus){code+=item.codeBonus;codeChanges.push("+"+item.codeBonus+" · "+item.name+": bonus CODICE dell'oggetto");}
  }
  if(d.classId==="senior")codeChanges.push("+2 · Senior: bonus permanente a CODICE");
  if(isActive&&c.temporaryCodeBonus)codeChanges.push("+"+c.temporaryCodeBonus+" · Bonus temporaneo: potenziamento attivo a CODICE");

  for(const item of d.items){
    if(item.debugBonus){debug+=item.debugBonus;debugChanges.push("+"+item.debugBonus+" · "+item.name+": bonus DEBUG dell'oggetto");}
  }
  if(d.classId==="junior"&&d.hp<d.maxHp*.5)debugChanges.push("+2 · Junior sotto il 50% HP: bonus a DEBUG");
  if(d.classId==="hacker"&&enemy.typeId==="client")debugChanges.push("+3 · Hacker contro Client: bonus a DEBUG");

  const conditionMatches=(condition:string)=>condition==="lowHp"?d.hp<d.maxHp*.5:condition==="highStress"?d.stress>=50:condition==="fullHp"?d.hp>=d.maxHp:condition==="highEnergy"?c.energy>=2:condition==="defending"?c.block>0:condition==="afterTool"?c.toolPlayedThisTurn:condition==="everyTwoTurns"?c.turn%2===0:false;
  let multiplier=1;
  if(d.advantageEnemyIds.includes(enemy.typeId)){multiplier*=1.15;codeChanges.push("+15% · Vantaggio contro questo tipo di nemico");debugChanges.push("+15% · Vantaggio contro questo tipo di nemico");}
  if(d.weaknessEnemyIds.includes(enemy.typeId)){multiplier*=.85;codeChanges.push("-15% · Debolezza contro questo tipo di nemico");debugChanges.push("-15% · Debolezza contro questo tipo di nemico");}
  if(d.advantageConditions.some(x=>conditionMatches(x))){multiplier*=1.1;codeChanges.push("+10% · Condizione favorevole attiva");debugChanges.push("+10% · Condizione favorevole attiva");}
  if(d.weaknessConditions.some(x=>conditionMatches(x))){multiplier*=.9;codeChanges.push("-10% · Condizione sfavorevole attiva");debugChanges.push("-10% · Condizione sfavorevole attiva");}
  if(enemy.weaknessDeveloperIds.includes(d.classId)){multiplier*=1.15;codeChanges.push("+15% · Il nemico è debole contro questa classe");debugChanges.push("+15% · Il nemico è debole contro questa classe");}
  if(enemy.advantageDeveloperIds.includes(d.classId)){multiplier*=.9;codeChanges.push("-10% · Il nemico è avvantaggiato contro questa classe");debugChanges.push("-10% · Il nemico è avvantaggiato contro questa classe");}

  if(enemy.typeId==="legacy"){debug=Math.max(0,debug-2);debugChanges.push("-2 · Legacy: penalità a DEBUG");}
  code=Math.max(0,Math.round(code*multiplier));
  debug=Math.max(0,Math.round(debug*multiplier));
  if(enemy.typeId==="client"&&d.classId==="hacker"){debug=Math.max(0,Math.round(debug*1.2));debugChanges.push("+20% · Hacker contro Client: potenziamento aggiuntivo a DEBUG");}

  const tooltip=(base:number,changes:string[])=>["Base: "+base,...(changes.length?changes.map(x=>"• "+x):["Nessun modificatore attivo"])].join("\n");
  const codeTip=tooltip(d.code,codeChanges);
  const debugTip=tooltip(d.debug,debugChanges);
  return {code,debug,codeTip,debugTip,hasCodeTip:true,hasDebugTip:true};
};
const activeStats=effectiveStats(active,true);
const memberInfo=(d:Developer,i:number)=>{
  const stats=effectiveStats(d);
  const disabled=d.hp<=0||d.stress>=100;
  return `<button type="button" class="battle-team-member ${i===c.activeIndex?"active":""}" data-switch="${i}" ${i===c.activeIndex||disabled?"disabled":""}>
    <div class="battle-member-head"><strong>${esc(d.name)}</strong><span>${esc(d.role)}</span></div>
    <div class="battle-member-hp"><span>HP ${d.hp}/${d.maxHp}</span><i><em style="width:${pct(d.hp,d.maxHp)}%"></em></i></div>
    <div class="battle-member-stress"><span>STRESS ${d.stress}/100</span><i><em style="width:${d.stress}%"></em></i></div>
    <div class="battle-member-switch-cost">CAMBIO: 1 ⚡</div>
    <div class="battle-member-stats">
      <span class="stat-tooltip" ${stats.hasCodeTip?`data-tooltip="${esc(stats.codeTip)}"`:""}><b>CODICE</b><strong>${stats.code}</strong></span>
      <span class="stat-tooltip" ${stats.hasDebugTip?`data-tooltip="${esc(stats.debugTip)}"`:""}><b>DEBUG</b><strong>${stats.debug}</strong></span>
    </div>
  </button>`;
};
return `<section class="battle battle-redesign">
  <aside class="battle-side battle-team panel">
    <div class="battle-side-title"><span>IL TUO TEAM</span><b>${c.team.length}/3</b></div>
    <div class="battle-team-list">${c.team.map((d,i)=>memberInfo(d,i)).join("")}</div>
    <div class="battle-log"><div class="battle-log-title">ULTIME AZIONI</div>${c.log.slice(-5).reverse().map(x=>`<div>${esc(x)}</div>`).join("")}</div>
  </aside>
  <section class="battle-main">
    <div class="battle-active-card">
      <div class="battle-active-top">
        <div><span>DEVELOPER ATTIVO</span><h2>${esc(active.name)}</h2><small>${esc(active.role)}</small></div>
        <div class="battle-active-ability"><b>ABILITÀ</b><span>${esc(active.passive)}</span></div>
      </div>
      <div class="battle-active-health">
        <div><span>HP</span><strong>${active.hp}/${active.maxHp}</strong></div>
        <div class="battle-healthbar"><i style="width:${pct(active.hp,active.maxHp)}%"></i></div>
      </div>
      <div class="battle-active-stress">
        <div><span>STRESS</span><strong>${active.stress}/100</strong></div>
        <div class="battle-stressbar"><i style="width:${active.stress}%"></i></div>
      </div>
      <div class="battle-active-details">
        <div class="battle-effective-stat stat-tooltip" ${activeStats.hasCodeTip?`data-tooltip="${esc(activeStats.codeTip)}"`:""}><b>CODICE</b><strong>${activeStats.code}</strong></div>
        <div class="battle-effective-stat stat-tooltip" ${activeStats.hasDebugTip?`data-tooltip="${esc(activeStats.debugTip)}"`:""}><b>DEBUG</b><strong>${activeStats.debug}</strong></div>
      </div>
    </div>
    <div class="battle-energy"><span>ENERGIA</span><strong>${"⚡".repeat(c.energy)}${"·".repeat(3-c.energy)}</strong><small>3 MAX</small></div>
    <div class="battle-actions">
      <button type="button" data-action="code" ${c.energy<1?"disabled":""}><b>CODICE</b><small>COSTO: 1 ⚡ · +3 STRESS</small></button>
      <button type="button" data-action="debug" ${c.energy<2?"disabled":""}><b>DEBUG</b><small>COSTO: 2 ⚡ · +5 STRESS</small></button>
      <button type="button" data-action="defend" ${c.energy<1?"disabled":""}><b>DIFESA</b><small>COSTO: 1 ⚡ · -3 STRESS</small></button>
    </div>
    <div class="battle-hand-label"><span>TOOL IN MANO</span><b>${c.hand.length} CARTE</b><button type="button" class="deck-counter" data-action="toggle-deck">MAZZO · ${c.drawPile.length} DISPONIBILI</button></div>
    <div class="hand">${c.hand.map((card,i)=>`<button type="button" class="card combat-card" data-card="${i}" data-poker-rendered="true" ${!c.canPlayCardForUi(card)?"disabled":""}>${renderPokerCard(card)}</button>`).join("")}</div>
    ${c.showDeck?`<div class="deck-viewer">
      <div class="deck-viewer-head">
        <div class="deck-viewer-tabs">
          <button type="button" class="${c.deckView==="draw"?"active":""}" data-deck-view="draw">MAZZO · ${c.drawPile.length}</button>
          <button type="button" class="${c.deckView==="discard"?"active":""}" data-deck-view="discard">SCARTI · ${c.discardPile.length}</button>
          ${c.consumedCards.length?`<button type="button" class="${c.deckView==="consumed"?"active":""}" data-deck-view="consumed">CONSUMATE · ${c.consumedCards.length}</button>`:""}
        </div>
        <button type="button" data-action="toggle-deck">CHIUDI</button>
      </div>
      <div class="deck-viewer-grid">${(c.deckView==="draw"?c.drawPile:c.deckView==="discard"?c.discardPile:c.consumedCards).map(card=>`<div class="deck-viewer-card">${renderPokerCard(card)}</div>`).join("")||`<p class="deck-viewer-empty">${c.deckView==="draw"?"Il mazzo è vuoto.":c.deckView==="discard"?"Nessuna carta negli scarti.":"Nessuna carta consumata."}</p>`}</div>
    </div>`:""}
    <button type="button" class="end" data-action="end-turn">FINE TURNO</button>
  </section>
  <aside class="battle-side battle-enemy panel">
    <div class="battle-side-title"><span>NEMICO</span><b>INTENT</b></div>
    <div class="battle-enemy-name">${esc(enemy.name)}</div>
    <div class="battle-enemy-type">${esc(enemy.type)}</div>
    <div class="battle-hp-row"><span>HP</span><b>${enemy.hp}/${enemy.maxHp}</b></div>
    <div class="battle-healthbar battle-enemy-health"><i style="width:${pct(enemy.hp,enemy.maxHp)}%"></i></div>
    <div class="battle-intent"><strong>${esc(enemy.intent.label)}</strong><span>${enemy.intent.damage} DMG · +${enemy.intent.stress} STRESS</span></div>
    <div class="battle-ability"><strong>ABILITÀ</strong><span>${esc(enemy.passive)}</span></div>
    <div class="battle-matchups"><div><b>VANTAGGI</b>${enemy.advantages.map(x=>`<span>${esc(x)}</span>`).join("")}</div><div><b>DEBOLEZZE</b>${enemy.weaknesses.map(x=>`<span>${esc(x)}</span>`).join("")}</div></div>
  </aside>
</section>`;}  if(game.screen==="reward"){const card=game.reward!;return `<section class="panel center"><h2>RICOMPENSA</h2><p>Il percorso continua. Aggiungi un Tool al deck.</p><button type="button" class="reward-card" data-action="reward"><b>${esc(card.name)}</b><span>${card.cost} ⚡</span><small>${esc(card.description)}</small></button></section>`;}
  if(game.screen==="event"&&game.currentEvent){
    const event=game.currentEvent;
    const choices=event.choices.map((choice,i)=>{
      const effects:string[]=[];
      if(choice.effect.hp)effects.push(`${choice.effect.hp>0?"+":""}${choice.effect.hp} HP`);
      if(choice.effect.stress)effects.push(`${choice.effect.stress>0?"+":""}${choice.effect.stress} STRESS`);
      if(choice.effect.tempo)effects.push(`${choice.effect.tempo>0?"+":""}${choice.effect.tempo} TEMPO`);
      if(choice.effect.reward==="tool")effects.push("TOOL");
      if(choice.effect.reward==="item")effects.push("OGGETTO");
      return `<button type="button" class="event-choice-card" data-event-choice="${i}">
        <span class="event-choice-number">SCELTA ${i+1}</span>
        <b>${esc(choice.label)}</b>
        <small>${esc(choice.description)}</small>
        <strong>${effects.join(" · ")}</strong>
      </button>`;
    }).join("");
    return `<section class="panel selection-panel event-panel">
      <div class="selection-heading"><div><h2>${esc(event.title)}</h2><p>${esc(event.description)}</p></div><span class="random-badge">EVENTO · 1 SCELTA</span></div>
      <div class="event-choice-grid">${choices}</div>
      <div class="selection-footer"><span class="selection-hint">La scelta viene applicata immediatamente.</span></div>
    </section>`;
  }
  if(game.screen==="bossReward"){
    const options=game.bossRewardOptions.map((option,i)=>{
      if(option.kind==="item"&&option.item)return `<button type="button" class="boss-reward-card boss-item-reward" data-boss-reward="${i}"><span class="boss-reward-kind">OGGETTO · ZAINO</span><b>${esc(option.item.name)}</b><strong>+${option.item.codeBonus} COD · +${option.item.debugBonus} DEBUG</strong><small>${esc(option.item.description)}</small></button>`;
      const card=option.card!;
      return `<button type="button" class="boss-reward-card boss-tool-reward" data-boss-reward="${i}"><span class="boss-reward-kind">TOOL · MAZZO</span><b>${esc(card.name)}</b><strong>${card.cost} ⚡</strong><small>${esc(card.description)}</small></button>`;
    }).join("");
    return `<section class="panel selection-panel boss-reward-panel">
      <div class="selection-heading"><div><h2>DROP DELLA DEADLINE</h2><p>Hai completato la commessa. Scegli UNA sola ricompensa tra 3 oggetti da mettere direttamente nello ZAINO e 3 Tool da aggiungere al MAZZO.</p></div><span class="random-badge">6 DROP · 1 SCELTA</span></div>
      <div class="boss-reward-grid">${options}</div>
      <div class="selection-footer"><span class="selection-hint">La scelta è definitiva. Gli altri cinque drop vengono persi.</span></div>
    </section>`;
  }
  return `<section class="panel center result"><div class="pixel-icon">☠</div><h1>${esc(game.message)}</h1><p>La commessa è andata in produzione. Da qualche parte.</p><button type="button" class="primary" data-action="restart">NUOVA COMMESSA</button></section>`;
}

function bind(game:Game){
  root.querySelectorAll<HTMLElement>("[data-action]").forEach(el=>el.onclick=()=>{const a=el.dataset.action;if(a==="start")game.start();if(a==="confirm-start")game.confirmStartingDeveloper();if(a==="confirm-battle")game.confirmBattleStarter();if(a==="code")game.combat?.basicAction("code");if(a==="debug")game.combat?.basicAction("debug");if(a==="defend")game.combat?.basicAction("defend");if(a==="toggle-deck")game.combat?.toggleDeck();if(a==="end-turn")game.combat?.endTurn();if(a==="reward")game.chooseReward(0);if(a==="confirm-recruit")game.confirmRecruitment();if(a==="confirm-item")game.confirmItemReward();if(a==="store-item")game.storeItemReward();if(a==="open-equipment")game.openEquipment();if(a==="close-equipment")game.closeEquipment();if(a==="restart")game.restart();render(game);if(game.screen==="combat"&&game.combat?.result!=="ongoing"){game.onCombatFinished();render(game);}});
  root.querySelectorAll<HTMLElement>("[data-deck-view]").forEach(el=>el.onclick=()=>{game.combat?.setDeckView((el.dataset.deckView||"draw") as "draw"|"discard"|"consumed");render(game);});
   root.querySelectorAll<HTMLElement>("[data-event-choice]").forEach(el=>el.onclick=()=>{game.chooseEvent(Number(el.dataset.eventChoice));render(game);});
  root.querySelectorAll<HTMLElement>("[data-boss-reward]").forEach(el=>el.onclick=()=>{game.chooseBossReward(Number(el.dataset.bossReward));render(game);});
  root.querySelectorAll<HTMLElement>("[data-dev]").forEach(el=>el.onclick=e=>{e.preventDefault();if(game.screen==="team"){const index=game.startingCandidates.findIndex(d=>d.id===el.dataset.dev);if(index>=0)game.selectStartingDeveloper(index);}render(game);});
  root.querySelectorAll<HTMLElement>("[data-card]").forEach(el=>el.onclick=()=>{game.combat?.playCard(Number(el.dataset.card));render(game);if(game.combat?.result!=="ongoing"){game.onCombatFinished();render(game);}});
  root.querySelectorAll<HTMLElement>("[data-switch]").forEach(el=>el.onclick=()=>{game.combat?.switchDeveloper(Number(el.dataset.switch));render(game);});
  root.querySelectorAll<HTMLElement>("[data-map-node]").forEach(el=>el.onclick=()=>{game.selectMapNode(el.dataset.mapNode!);render(game);});
  root.querySelectorAll<HTMLElement>("[data-target]").forEach(el=>el.onclick=()=>{game.selectRecruitTarget(Number(el.dataset.target));render(game);});
  root.querySelectorAll<HTMLElement>("[data-item-target]").forEach(el=>el.onclick=()=>{game.selectItemTarget(Number(el.dataset.itemTarget));render(game);});
  root.querySelectorAll<HTMLElement>("[data-recruit-index]").forEach(el=>el.onclick=e=>{e.preventDefault();game.selectRecruitCandidate(Number(el.dataset.recruitIndex));render(game);});
  root.querySelectorAll<HTMLElement>("[data-eq-source-zone]").forEach(el=>el.onclick=()=>{const zone=el.dataset.eqSourceZone as "dev"|"bag";const item=Number(el.dataset.eqSourceItem);const dev=Number(el.dataset.eqSourceDev??-1);if(game.equipmentSource)game.moveSelectedEquipment(zone,dev,item);else game.selectEquipmentSource(zone,item,dev);render(game);});
  root.querySelectorAll<HTMLElement>("[data-eq-target-zone]").forEach(el=>el.onclick=()=>{game.moveSelectedEquipment(el.dataset.eqTargetZone as "dev"|"bag",Number(el.dataset.eqTargetDev??-1),Number(el.dataset.eqTargetItem??-1));render(game);});
  if(game.screen==="battleSetup"){let dragged:number|null=null;root.querySelectorAll<HTMLElement>("[data-battle-dev]").forEach(el=>{const index=Number(el.dataset.battleDev);el.onclick=e=>{e.preventDefault();game.selectBattleStarter(index);render(game);};el.ondragstart=e=>{dragged=index;e.dataTransfer?.setData("text/plain",String(index));if(e.dataTransfer)e.dataTransfer.effectAllowed="move";el.classList.add("dragging");};el.ondragend=()=>{dragged=null;el.classList.remove("dragging");};});const drop=root.querySelector<HTMLElement>("[data-battle-drop]");if(drop){drop.ondragover=e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect="move";drop.classList.add("drag-over");};drop.ondragleave=()=>drop.classList.remove("drag-over");drop.ondrop=e=>{e.preventDefault();drop.classList.remove("drag-over");const raw=e.dataTransfer?.getData("text/plain");const index=raw?Number(raw):dragged;if(index!==null&&Number.isInteger(index))game.moveBattleStarter(index);render(game);};}}
}
