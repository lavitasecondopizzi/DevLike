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

function devCard(dev:Developer, selected=false, compact=false) {
  const advantages = dev.advantages.map(x=>`<span>${esc(x)}</span>`).join("");
  const weaknesses = dev.weaknesses.map(x=>`<span>${esc(x)}</span>`).join("");
  return `<div class="dev-card ${selected?"selected":""} ${compact?"compact":""}"><div class="dev-head"><b>${esc(dev.name)}</b><span>${esc(dev.role)}</span></div><p class="dev-description">${esc(dev.description)}</p><div class="stat-line"><span>HP</span><b>${dev.hp}/${dev.maxHp}</b></div><div class="bar"><i style="width:${pct(dev.hp,dev.maxHp)}%"></i></div><div class="stat-line"><span>STRESS</span><b>${dev.stress}/100</b></div><div class="stress"><i style="width:${dev.stress}%"></i></div><div class="stat-grid"><span>CODICE <b>${dev.code}</b></span><span>DEBUG <b>${dev.debug}</b></span></div><div class="ability"><strong>ABILITÀ</strong><br>${esc(dev.passive)}</div><div class="matchup-grid"><div><strong>VANTAGGI</strong>${advantages}</div><div><strong>DEBOLEZZE</strong>${weaknesses}</div></div>${equipmentSlots(dev)}</div>`;
}

function enemyCard(enemy:Enemy) {
  const advantages = enemy.advantages.map(x=>`<span>${esc(x)}</span>`).join("");
  const weaknesses = enemy.weaknesses.map(x=>`<span>${esc(x)}</span>`).join("");
  return `<div class="enemy-team-card"><div class="enemy-head"><div><div class="enemy-type">${esc(enemy.type)}</div><div class="enemy-name">${esc(enemy.name)}</div></div><span class="enemy-badge">NEMICO</span></div><p class="enemy-description">${esc(enemy.description)}</p><div class="big-hp">${enemy.hp}/${enemy.maxHp} HP</div><div class="bar"><i style="width:${pct(enemy.hp,enemy.maxHp)}%"></i></div><div class="enemy-stat-grid"><span>CODICE <b>${enemy.code}</b></span><span>DEBUG <b>${enemy.debug}</b></span><span>DMG <b>${enemy.intent.damage}</b></span><span>STRESS <b>+${enemy.intent.stress}</b></span></div><div class="enemy-ability"><strong>ABILITÀ</strong><br>${esc(enemy.passive)}</div><div class="matchup-grid enemy-matchup"><div><strong>VANTAGGI</strong>${advantages}</div><div><strong>DEBOLEZZE</strong>${weaknesses}</div></div></div>`;
}

const nodeIcon:Record<MapNode["type"],string> = {battle:"⚔",elite:"☠",event:"?",rest:"+",fullRest:"♥",reward:"◆",item:"🔧",recruit:"👤",boss:"☠"};
function nodeClass(node:MapNode,game:Game){const available=game.availableMapNodes.some(x=>x.id===node.id),current=game.currentMapNodeId===node.id;return ["map-node",`type-${node.type}`,node.visited?"visited":"",available?"available":"",current?"current":"",node.hiddenEncounter?"hidden-encounter":""].filter(Boolean).join(" ");}
function renderMapNode(node:MapNode,game:Game){const available=game.availableMapNodes.some(x=>x.id===node.id),hidden=node.hiddenEncounter&&(node.type==="battle"||node.type==="elite"),label=hidden?"?":node.title,typeLabel=hidden?"INCONTRO":node.type==="boss"?"BOSS":node.type.toUpperCase();return `<button type="button" class="${nodeClass(node,game)}" data-map-node="${node.id}" ${available?"":"disabled"} title="${esc(node.description)}"><span class="node-icon">${nodeIcon[node.type]}</span><b>${esc(label)}</b><small>${typeLabel}</small></button>`;}
function renderMap(game:Game){const width=900,rowHeight=100,x=(c:number)=>150+c*300,y=(r:number)=>55+r*rowHeight;const lines=game.mapNodes.flatMap(node=>node.next.map(nextId=>{const target=game.mapNodes.find(n=>n.id===nextId);if(!target)return "";const active=node.visited&&(target.visited||game.availableMapNodes.some(n=>n.id===target.id));return `<line class="map-line ${active?"active":""}" x1="${x(node.col)}" y1="${y(node.row)}" x2="${x(target.col)}" y2="${y(target.row)}"/>`;})).join("");const nodes=game.mapNodes.map(node=>`<div class="map-node-wrap" style="left:${x(node.col)/width*100}%;top:${y(node.row)}px">${renderMapNode(node,game)}</div>`).join("");return `<div class="map-viewport"><div class="map-canvas" style="height:${7*rowHeight+120}px"><svg class="map-lines" viewBox="0 0 900 ${7*rowHeight+120}" preserveAspectRatio="none">${lines}</svg>${nodes}</div></div>`;}
function teamSummary(dev:Developer,i:number){return `<div class="team-summary ${i===0?"main-member":""}">${devCard(dev,i===0,true)}</div>`;}

function battleSetup(game:Game){const enemy=game.pendingEnemy!;const team=game.team.map((dev,i)=>`<div class="draggable-dev ${game.selectedBattleStarterIndex===i?"selected":""} ${dev.hp<=0||dev.stress>=100?"disabled-dev":""}" draggable="${dev.hp>0&&dev.stress<100?"true":"false"}" data-battle-dev="${i}"><div class="setup-dev-card"><div class="setup-dev-inner">${devCard(dev,i===game.selectedBattleStarterIndex,true)}</div></div></div>`).join("");return `<section class="panel battle-setup"><div class="selection-heading"><div><h2>SCHIERAMENTO</h2><p>Scegli il Developer da mandare in campo. Puoi cliccarlo oppure trascinarlo nello slot centrale.</p></div><span class="random-badge">PRIMO TURNO</span></div><div class="lineup"><div class="lineup-side team-lineup"><h3>IL TUO TEAM</h3><div class="setup-team">${team}</div></div><div class="battle-drop-zone" data-battle-drop><div class="drop-label">TRASCINA QUI</div><div class="drop-icon">VS</div><div class="drop-selected">${esc(game.team[game.selectedBattleStarterIndex]?.name??"NESSUNO")}</div><small>Questo Developer inizierà il combattimento</small></div><div class="lineup-side enemy-lineup"><h3>NEMICO</h3>${enemyCard(enemy)}</div></div><div class="setup-footer"><span>Clicca un Developer oppure trascinalo al centro.</span><button type="button" class="primary" data-action="confirm-battle">INIZIA COMBATTIMENTO</button></div></section>`;}

function equipmentDeveloper(game:Game,dev:Developer,index:number){const slots=[0,1].map(i=>{const item=dev.items[i],selected=game.equipmentSource?.zone==="dev"&&game.equipmentSource.devIndex===index&&game.equipmentSource.itemIndex===i;return `<button type="button" class="move-slot ${item?"filled":"empty"} ${selected?"selected":""}" data-eq-source-zone="dev" data-eq-source-dev="${index}" data-eq-source-item="${i}"><span>SLOT ${i+1}</span><b>${item?esc(item.name):"VUOTO"}</b><small>${item?`+${item.codeBonus} COD · +${item.debugBonus} DEBUG`:"Slot disponibile"}</small></button>`;}).join("");return `<div class="equipment-developer"><div class="equipment-dev-info">${devCard(dev,false,true)}</div><div class="equipment-move-slots"><h3>OGGETTI EQUIPAGGIATI</h3>${slots}</div></div>`;}
function equipmentScreen(game:Game){const bag=game.inventory.map((item,i)=>`<button type="button" class="backpack-item ${game.equipmentSource?.zone==="bag"&&game.equipmentSource.itemIndex===i?"selected":""}" data-eq-source-zone="bag" data-eq-source-item="${i}"><b>${esc(item.name)}</b><span>+${item.codeBonus} COD · +${item.debugBonus} DEBUG</span><small>${esc(item.description)}</small></button>`).join("");return `<section class="panel equipment-panel"><div class="selection-heading"><div><h2>EQUIPMENT & ZAINO</h2><p>Seleziona un oggetto e poi clicca lo slot di destinazione. Puoi spostare e scambiare gli oggetti tra tutti i developer in qualsiasi momento.</p></div><span class="random-badge">ZAINO · ${game.inventory.length}</span></div><div class="equipment-layout"><div class="equipment-team"><h3>TEAM</h3>${game.equipmentTeam.map((dev,i)=>equipmentDeveloper(game,dev,i)).join("")}</div><aside class="backpack panel"><h3>ZAINO</h3><p>Oggetti non equipaggiati e oggetti extra.</p><div class="backpack-items">${bag||"<div class=\"backpack-empty\">ZAINO VUOTO</div>"}</div><button type="button" class="bag-drop" data-eq-target-zone="bag" data-eq-target-item="-1">METTI NELLO ZAINO</button></aside></div><div class="equipment-footer"><span>${game.equipmentSource?"Oggetto selezionato: scegli ora una destinazione.":"2 slot per developer. Gli oggetti extra restano nello zaino."}</span><button type="button" class="primary" data-action="close-equipment">TORNA INDIETRO</button></div></section>`;}

export function render(game:Game){root.innerHTML=`<main class="game-shell"><header><div><div class="logo">DEV<span>LIKE</span></div><small>SHIP IT OR BURN OUT.</small></div><div class="header-right"><div class="header-stat">MISSIONE ${game.projectNumber} · NODO ${game.currentNode}/7 · DIFFICOLTÀ x${game.difficulty.toFixed(1)}</div>${game.team.length&&game.screen!=="team"&&game.screen!=="result"?`<button type="button" class="equipment-button" data-action="open-equipment">EQUIPMENT · ZAINO ${game.inventory.length}</button>`:""}</div></header>${screen(game)}</main>`;bind(game);}
function screen(game:Game){
  if(game.screen==="menu")return `<section class="panel center"><div class="pixel-icon">⌨</div><h1>DEVLIKE</h1><p>Un roguelike dove il vero boss è il cliente.</p><button type="button" class="primary" data-action="start">NUOVO PROGETTO</button></section>`;
  if(game.screen==="team")return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>SCEGLI IL DEVELOPER PRINCIPALE</h2><p>Ogni progetto parte con un solo developer. Gli altri arriveranno lungo il percorso.</p></div><span class="random-badge">3 CANDIDATI CASUALI</span></div><div class="developer-choice-grid">${game.startingCandidates.map(dev=>`<button type="button" class="developer-choice ${game.selectedStartingId===dev.id?"selected":""}" data-dev="${dev.id}">${devCard(dev,game.selectedStartingId===dev.id)}</button>`).join("")}</div><div class="selection-footer"><div class="selection-hint">${game.selectedStartingId?"Developer selezionato. Controlla statistiche, abilità, vantaggi e debolezze, poi conferma.":"Clicca una scheda per selezionare il tuo protagonista."}</div><button type="button" class="primary" data-action="confirm-start" ${game.selectedStartingId?"":"disabled"}>INIZIA IL PROGETTO</button></div></section>`;
  if(game.screen==="map"){const choices=game.availableMapNodes;const choiceText=choices.map(node=>`${nodeIcon[node.type]} ${node.hiddenEncounter?"?":node.title} — ${esc(node.description)}`).join("<br>");return `<section class="panel map-panel"><div class="map-top"><div><b>MISSIONE #${game.projectNumber}</b><br><small>${esc(game.message||"Scegli il prossimo nodo.")}</small></div><div class="map-progress">DIFFICOLTÀ x${game.difficulty.toFixed(1)}<br><b>${"█".repeat(Math.max(0,game.currentNode))+"░".repeat(Math.max(0,7-game.currentNode))}</b></div></div><div class="roguelike-help"><span>● ATTUALE</span><span>⚔ COMBATTIMENTO</span><span>☠ ELITE</span><span>◆ TOOL</span><span>🔧 OGGETTO</span><span>👤 RECLUTA</span><span>+ PAUSA</span><span>♥ CURA TOTALE</span><span>? IGNOTO/EVENTO</span><span>☠ DEADLINE</span></div>${renderMap(game)}<div class="choice-panel"><b>${choices.length?`SCEGLI IL PROSSIMO NODO · ${choices.length} STRADE`:"PERCORSO CONCLUSO"}</b><small>${choices.length?choiceText:"La Deadline è vicina."}</small></div><div class="team-strip">${game.team.map(teamSummary).join("")}</div></section>`;}
  if(game.screen==="battleSetup")return battleSetup(game);
  if(game.screen==="recruit"){const candidates=game.recruitCandidates.map((dev,i)=>`<button type="button" class="developer-choice" data-recruit-index="${i}">${devCard(dev,game.selectedRecruitIndex===i)}</button>`).join("");const replace=game.team.length>=3?`<div class="replacement-box"><h3>SOSTITUISCI UN MEMBRO</h3><p>Hai già 3 developer. Seleziona prima il membro da mandare via.</p><div class="replacement-team">${game.team.map((dev,i)=>`<button type="button" class="replace-target ${game.recruitTargetIndex===i?"selected":""}" data-target="${i}">${esc(dev.name)}<small>${esc(dev.role)} · HP ${dev.hp} · Oggetti ${dev.items.length}/2</small></button>`).join("")}</div><button type="button" class="primary" data-action="confirm-recruit" ${game.selectedRecruitIndex!==null&&game.recruitTargetIndex!==null?"":"disabled"}>SOSTITUISCI MEMBRO</button></div>`:`<p class="recruit-note">Scegli un candidato: entrerà immediatamente nel team.</p>`;return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>RECLUTAMENTO</h2><p>${esc(game.message)}</p></div><span class="random-badge">3 CANDIDATI</span></div><div class="developer-choice-grid">${candidates}</div>${replace}</section>`;}
  if(game.screen==="itemReward"&&game.itemReward){const targets=game.team.map((dev,i)=>{const full=dev.items.length>=2;return `<button type="button" class="assignment-card ${game.selectedItemTargetIndex===i?"selected":""}" data-item-target="${i}" ${full?"disabled":""}><div><b>${esc(dev.name)}</b><span>${esc(dev.role)}</span></div><div class="item-target-stats">HP ${dev.hp}/${dev.maxHp} · COD ${dev.code} · DEBUG ${dev.debug}</div><div class="matchup-mini"><strong>VANTAGGI</strong> ${dev.advantages.map(esc).join(" · ")}<br><strong>DEBOLEZZE</strong> ${dev.weaknesses.map(esc).join(" · ")}</div>${equipmentSlots(dev)}<em>${full?"INVENTARIO PIENO — USA LO ZAINO":"CLICCA PER SELEZIONARE"}</em></button>`;}).join("");return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>OGGETTO SBLOCCATO</h2><p>${esc(game.message)}</p></div><span class="random-badge">EQUIPAGGIAMENTO</span></div><div class="item-reward-card"><h2>${esc(game.itemReward.name)}</h2><p>${esc(game.itemReward.description)}</p><div class="item-bonus">+${game.itemReward.codeBonus} CODICE · +${game.itemReward.debugBonus} DEBUG</div></div><h3 class="assign-title">A QUALE DEVELOPER CONSEGNARLO?</h3><div class="assignment-grid">${targets}</div><div class="selection-footer"><div class="selection-hint">${game.selectedItemTargetIndex===null?"Puoi anche metterlo direttamente nello zaino.":`Consegnerai ${esc(game.itemReward.name)} a ${esc(game.team[game.selectedItemTargetIndex]?.name??"")}.`}</div><div class="reward-actions"><button type="button" class="secondary" data-action="store-item">METTI NELLO ZAINO</button><button type="button" class="primary" data-action="confirm-item" ${game.selectedItemTargetIndex!==null?"":"disabled"}>EQUIPAGGIA OGGETTO</button></div></div></section>`;}
  if(game.screen==="equipment")return equipmentScreen(game);
  if(game.screen==="combat"&&game.combat){const c=game.combat;const active=c.active;const enemy=c.enemy;
const memberInfo=(d:Developer, i:number, activeMember=false)=>{
  const items=d.items.length?d.items.map(x=>esc(x.name)).join(" · "):"Nessun oggetto";
  const adv=d.advantages.length?d.advantages.map(x=>esc(x)).join(" · "):"—";
  const weak=d.weaknesses.length?d.weaknesses.map(x=>esc(x)).join(" · "):"—";
  return `<button type="button" class="battle-team-member ${activeMember?"active":""}" data-switch="${i}" ${activeMember||d.hp<=0||d.stress>=100?"disabled":""}>
    <div class="battle-member-head"><strong>${esc(d.name)}</strong><span>${esc(d.role)}</span></div>
    <div class="battle-member-hp"><span>HP ${d.hp}/${d.maxHp}</span><i><em style="width:${pct(d.hp,d.maxHp)}%"></em></i></div>
    <div class="battle-member-stress"><span>STRESS ${d.stress}/100</span><i><em style="width:${d.stress}%"></em></i></div>
    <div class="battle-member-stats"><span>CODICE <b>${d.code}</b></span><span>DEBUG <b>${d.debug}</b></span></div>
    <div class="battle-member-ability"><b>ABILITÀ</b> ${esc(d.passive)}</div>
    <div class="battle-member-matchups"><span><b>+</b> ${adv}</span><span><b>−</b> ${weak}</span></div>
    <div class="battle-member-items"><b>OGGETTI</b> ${items}</div>
  </button>`;
};
return `<section class="battle battle-redesign">
  <aside class="battle-side battle-team panel">
    <div class="battle-side-title"><span>IL TUO TEAM</span><b>${c.team.length}/3</b></div>
    <div class="battle-team-list">${c.team.map((d,i)=>memberInfo(d,i,i===c.activeIndex)).join("")}</div>
    <div class="battle-switch-hint">Seleziona un Developer disponibile per cambiarlo. Qui vedi statistiche, abilità, vantaggi, debolezze e oggetti.</div>
    <div class="battle-log"><div class="battle-log-title">ULTIME AZIONI</div>${c.log.slice(-5).reverse().map(x=>`<div>${esc(x)}</div>`).join("")}</div>
  </aside>
  <section class="battle-main">
    <div class="battle-turnbar"><div><strong>${esc(active.name)}</strong><span>${esc(active.role)}</span></div><b>TURNO ${c.turn}</b></div>
    <div class="battle-active-card">
      <div class="battle-active-top">
        <div><span>DEVELOPER ATTIVO</span><h2>${esc(active.name)}</h2><small>${esc(active.description)}</small></div>
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
        <div><b>CODICE</b><strong>${active.code}</strong></div><div><b>DEBUG</b><strong>${active.debug}</strong></div>
        <div><b>VANTAGGI</b><span>${active.advantages.length?active.advantages.map(x=>esc(x)).join(" · "):"—"}</span></div>
        <div><b>DEBOLEZZE</b><span>${active.weaknesses.length?active.weaknesses.map(x=>esc(x)).join(" · "):"—"}</span></div>
        <div class="battle-active-items"><b>OGGETTI</b><span>${active.items.length?active.items.map(x=>`${esc(x.name)} (+${x.codeBonus} COD · +${x.debugBonus} DEBUG)`).join(" · "):"Nessun oggetto equipaggiato"}</span></div>
      </div>
    </div>
    <div class="battle-energy"><span>ENERGIA</span><strong>${"⚡".repeat(c.energy)}${"·".repeat(3-c.energy)}</strong></div>
    <div class="battle-actions">
      <button type="button" data-action="code" ${c.energy<1?"disabled":""}><b>CODICE</b><small>1 ⚡ · attacco base</small></button>
      <button type="button" data-action="debug" ${c.energy<2?"disabled":""}><b>DEBUG</b><small>2 ⚡ · attacco potente</small></button>
      <button type="button" data-action="defend" ${c.energy<1?"disabled":""}><b>DIFESA</b><small>1 ⚡ · riduce danni</small></button>
    </div>
    <div class="battle-hand-label"><span>TOOL IN MANO</span><b>${c.hand.length} CARTE</b></div>
    <div class="hand">${c.hand.map((card,i)=>`<button type="button" class="card combat-card" data-card="${i}" data-poker-rendered="true" ${card.cost>c.energy?"disabled":""}>${renderPokerCard(card)}</button>`).join("")}</div>
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
</section>`;}
  if(game.screen==="reward"){const card=game.reward!;return `<section class="panel center"><h2>RICOMPENSA</h2><p>Il percorso continua. Aggiungi un Tool al deck.</p><button type="button" class="reward-card" data-action="reward"><b>${esc(card.name)}</b><span>${card.cost} ⚡</span><small>${esc(card.description)}</small></button></section>`;}
  return `<section class="panel center result"><div class="pixel-icon">☠</div><h1>${esc(game.message)}</h1><p>Il progetto è andato in produzione. Da qualche parte.</p><button type="button" class="primary" data-action="restart">NUOVO PROGETTO</button></section>`;
}

function bind(game:Game){
  root.querySelectorAll<HTMLElement>("[data-action]").forEach(el=>el.onclick=()=>{const a=el.dataset.action;if(a==="start")game.start();if(a==="confirm-start")game.confirmStartingDeveloper();if(a==="confirm-battle")game.confirmBattleStarter();if(a==="code")game.combat?.basicAction("code");if(a==="debug")game.combat?.basicAction("debug");if(a==="defend")game.combat?.basicAction("defend");if(a==="end-turn")game.combat?.endTurn();if(a==="reward")game.chooseReward(0);if(a==="confirm-recruit")game.confirmRecruitment();if(a==="confirm-item")game.confirmItemReward();if(a==="store-item")game.storeItemReward();if(a==="open-equipment")game.openEquipment();if(a==="close-equipment")game.closeEquipment();if(a==="restart")game.restart();render(game);if(game.screen==="combat"&&game.combat?.result!=="ongoing"){game.onCombatFinished();render(game);}});
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
