import { Game } from "../game/Game";
import type { Developer, MapNode } from "../entities/types";

const root = document.querySelector<HTMLDivElement>("#app")!;

function pct(value: number, max: number) { return Math.max(0, Math.min(100, Math.round((value / max) * 100))); }

function equipmentSlots(dev: Developer) {
  return `<div class="equipment-slots"><strong>EQUIPAGGIAMENTO</strong><div class="slot-row">
    ${[0, 1].map(i => dev.items[i]
      ? `<div class="equip-slot filled"><span>SLOT ${i + 1}</span><b>${dev.items[i].name}</b><small>+${dev.items[i].codeBonus} COD · +${dev.items[i].debugBonus} DEBUG</small></div>`
      : `<div class="equip-slot empty"><span>SLOT ${i + 1}</span><b>VUOTO</b><small>Disponibile</small></div>`).join("")}
  </div></div>`;
}

function devCard(dev: Developer, selected = false, selectable = false, compact = false) {
  return `<button class="dev-card ${selected ? "selected" : ""} ${compact ? "compact" : ""}" ${selectable ? `data-dev="${dev.id}"` : ""}>
    <div class="dev-head"><b>${dev.name}</b><span>${dev.role}</span></div>
    <p class="dev-description">${dev.description}</p>
    <div class="stat-line"><span>HP</span><b>${dev.hp}/${dev.maxHp}</b></div><div class="bar"><i style="width:${pct(dev.hp, dev.maxHp)}%"></i></div>
    <div class="stat-line"><span>STRESS</span><b>${dev.stress}/100</b></div><div class="stress"><i style="width:${dev.stress}%"></i></div>
    <div class="stat-grid"><span>CODICE <b>${dev.code}</b></span><span>DEBUG <b>${dev.debug}</b></span></div>
    <div class="ability"><strong>ABILITÀ</strong><br>${dev.passive}</div>${equipmentSlots(dev)}
  </button>`;
}

const nodeIcon: Record<MapNode["type"], string> = { battle: "⚔", elite: "☠", event: "?", rest: "+", fullRest: "♥", reward: "◆", item: "🔧", recruit: "👤", boss: "☠" };
function nodeClass(node: MapNode, game: Game) { const available = game.availableMapNodes.some(c => c.id === node.id); const current = game.currentMapNodeId === node.id; return ["map-node", `type-${node.type}`, node.visited ? "visited" : "", available ? "available" : "", current ? "current" : ""].filter(Boolean).join(" "); }
function renderMapNode(node: MapNode, game: Game) { const available = game.availableMapNodes.some(c => c.id === node.id); return `<button class="${nodeClass(node, game)}" data-map-node="${node.id}" ${available ? "" : "disabled"} title="${node.description}"><span class="node-icon">${nodeIcon[node.type]}</span><b>${node.title}</b><small>${node.type === "boss" ? "BOSS" : node.type.toUpperCase()}</small></button>`; }

function renderMap(game: Game) {
  const width = 900, rowHeight = 100; const x = (col: number) => 150 + col * 300, y = (row: number) => 55 + row * rowHeight;
  const lines = game.mapNodes.flatMap(node => node.next.map(nextId => { const target = game.mapNodes.find(c => c.id === nextId); if (!target) return ""; const active = node.visited && (target.visited || game.availableMapNodes.some(c => c.id === target.id)); return `<line class="map-line ${active ? "active" : ""}" x1="${x(node.col)}" y1="${y(node.row)}" x2="${x(target.col)}" y2="${y(target.row)}" />`; })).join("");
  const nodes = game.mapNodes.map(node => `<div class="map-node-wrap" style="left:${(x(node.col) / width) * 100}%;top:${y(node.row)}px">${renderMapNode(node, game)}</div>`).join("");
  return `<div class="map-viewport"><div class="map-canvas" style="height:${7 * rowHeight + 120}px"><svg class="map-lines" viewBox="0 0 900 ${7 * rowHeight + 120}" preserveAspectRatio="none">${lines}</svg>${nodes}</div></div>`;
}

function teamSummary(dev: Developer, i: number) {
  return `<div class="team-summary ${i === 0 ? "main-member" : ""}"><div><b>${dev.name}</b><span>${dev.role}</span></div><small>HP ${dev.hp}/${dev.maxHp} · Stress ${dev.stress}</small>${equipmentSlots(dev)}</div>`;
}

function battleSetup(game: Game) {
  const enemy = game.pendingEnemy!;
  return `<section class="panel battle-setup">
    <div class="selection-heading"><div><h2>SCHIERAMENTO</h2><p>Trascina il Developer che vuoi mandare in campo nello slot centrale. Gli altri restano in panchina.</p></div><span class="random-badge">PRIMO TURNO</span></div>
    <div class="lineup">
      <div class="lineup-side team-lineup"><h3>IL TUO TEAM</h3><div class="setup-team">${game.team.map((dev, i) => `<div class="draggable-dev ${game.selectedBattleStarterIndex === i ? "selected" : ""} ${dev.hp <= 0 || dev.stress >= 100 ? "disabled-dev" : ""}" draggable="${dev.hp > 0 && dev.stress < 100}" data-battle-dev="${i}">${devCard(dev, i === game.selectedBattleStarterIndex, false, true)}</div>`).join("")}</div></div>
      <div class="battle-drop-zone" data-battle-drop><div class="drop-label">TRASCINA QUI</div><div class="drop-icon">VS</div><div class="drop-selected">${game.team[game.selectedBattleStarterIndex]?.name ?? "NESSUNO"}</div><small>Questo Developer inizierà il combattimento</small></div>
      <div class="lineup-side enemy-lineup"><h3>NEMICO</h3><div class="enemy-team-card"><div class="enemy-name">${enemy.name}</div><div class="big-hp">${enemy.hp}/${enemy.maxHp} HP</div><div class="bar"><i style="width:${pct(enemy.hp, enemy.maxHp)}%"></i></div><div class="intent">INTENT: ${enemy.intent.label}<br>${enemy.intent.damage} DMG · +${enemy.intent.stress} STRESS</div><p>Il nemico attende. Naturalmente.</p></div></div>
    </div>
    <div class="setup-footer"><span>Puoi anche cliccare un Developer per selezionarlo.</span><button class="primary" data-action="confirm-battle">INIZIA COMBATTIMENTO</button></div>
  </section>`;
}

export function render(game: Game) {
  root.innerHTML = `<main class="game-shell"><header><div><div class="logo">DEV<span>LIKE</span></div><small>SHIP IT OR BURN OUT.</small></div><div class="header-stat">MISSIONE ${game.projectNumber} · NODO ${game.currentNode}/7 · DIFFICOLTÀ x${game.difficulty.toFixed(1)}</div></header>${screen(game)}</main>`;
  bind(game);
}

function screen(game: Game) {
  if (game.screen === "menu") return `<section class="panel center"><div class="pixel-icon">⌨</div><h1>DEVLIKE</h1><p>Un roguelike dove il vero boss è il cliente.</p><button class="primary" data-action="start">NUOVO PROGETTO</button></section>`;
  if (game.screen === "team") return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>SCEGLI IL DEVELOPER PRINCIPALE</h2><p>Ogni progetto parte con un solo developer. Gli altri arriveranno lungo il percorso.</p></div><span class="random-badge">3 CANDIDATI CASUALI</span></div><div class="developer-choice-grid">${game.startingCandidates.map(dev => devCard(dev, game.selectedStartingId === dev.id, true)).join("")}</div><div class="selection-footer"><div class="selection-hint">${game.selectedStartingId ? "Developer selezionato. Controlla statistiche e abilità, poi conferma." : "Clicca una scheda per selezionare il tuo protagonista."}</div><button class="primary" data-action="confirm-start" ${game.selectedStartingId ? "" : "disabled"}>INIZIA IL PROGETTO</button></div></section>`;
  if (game.screen === "map") { const choices = game.availableMapNodes; return `<section class="panel map-panel"><div class="map-top"><div><b>MISSIONE #${game.projectNumber}</b><br><small>${game.message || "Scegli il prossimo nodo."}</small></div><div class="map-progress">DIFFICOLTÀ x${game.difficulty.toFixed(1)}<br><b>${"█".repeat(Math.max(0, game.currentNode))}${"░".repeat(Math.max(0, 7 - game.currentNode))}</b></div></div><div class="roguelike-help"><span>● ATTUALE</span><span>⚔ COMBATTIMENTO</span><span>☠ ELITE</span><span>◆ TOOL</span><span>🔧 OGGETTO</span><span>👤 RECLUTA</span><span>+ PAUSA</span><span>♥ CURA TOTALE</span><span>? EVENTO</span></div>${renderMap(game)}<div class="choice-panel"><b>${choices.length ? `SCEGLI IL PROSSIMO NODO · ${choices.length} STRADE` : "PERCORSO CONCLUSO"}</b><small>${choices.length ? choices.map(node => `${nodeIcon[node.type]} ${node.title} — ${node.description}`).join("<br>") : "La Deadline è vicina."}</small></div><div class="team-strip">${game.team.map(teamSummary).join("")}</div></section>`; }
  if (game.screen === "battleSetup") return battleSetup(game);
  if (game.screen === "recruit") return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>RECLUTAMENTO</h2><p>${game.message}</p></div><span class="random-badge">3 CANDIDATI</span></div><div class="developer-choice-grid">${game.recruitCandidates.map((dev, i) => devCard(dev, game.selectedRecruitIndex === i, false)).join("")}</div>${game.team.length >= 3 ? `<div class="replacement-box"><h3>SOSTITUISCI UN MEMBRO</h3><p>Hai già 3 developer. Seleziona prima il membro da mandare via.</p><div class="replacement-team">${game.team.map((dev, i) => `<button class="replace-target ${game.recruitTargetIndex === i ? "selected" : ""}" data-target="${i}">${dev.name}<small>${dev.role} · HP ${dev.hp} · Oggetti ${dev.items.length}/2</small></button>`).join("")}</div><button class="primary" data-action="confirm-recruit" ${game.selectedRecruitIndex !== null && game.recruitTargetIndex !== null ? "" : "disabled"}>SOSTITUISCI MEMBRO</button></div>` : `<p class="recruit-note">Scegli un candidato: entrerà immediatamente nel team.</p>`}</section>`;
  if (game.screen === "itemReward" && game.itemReward) return `<section class="panel selection-panel"><div class="selection-heading"><div><h2>OGGETTO SBLOCCATO</h2><p>${game.itemReward.description}</p></div><span class="random-badge">EQUIPAGGIAMENTO</span></div><div class="item-reward-card"><h2>${game.itemReward.name}</h2><p>${game.itemReward.description}</p><div class="item-bonus">+${game.itemReward.codeBonus} CODICE · +${game.itemReward.debugBonus} DEBUG</div></div><h3 class="assign-title">A QUALE DEVELOPER CONSEGNARLO?</h3><div class="assignment-grid">${game.team.map((dev, i) => `<button class="assignment-card ${game.selectedItemTargetIndex === i ? "selected" : ""}" data-item-target="${i}" ${dev.items.length >= 2 ? "disabled" : ""}><b>${dev.name}</b><span>${dev.role}</span>${equipmentSlots(dev)}${dev.items.length >= 2 ? "<em>INVENTARIO PIENO</em>" : "<em>CLICCA PER SELEZIONARE</em>"}</button>`).join("")}</div><div class="selection-footer"><div class="selection-hint">${game.selectedItemTargetIndex === null ? "Ogni developer può avere massimo 2 oggetti." : `Consegnerai ${game.itemReward.name} a ${game.team[game.selectedItemTargetIndex]?.name}.`}</div><button class="primary" data-action="confirm-item" ${game.selectedItemTargetIndex !== null ? "" : "disabled"}>EQUIPAGGIA OGGETTO</button></div></section>`;
  if (game.screen === "combat" && game.combat) { const c = game.combat; return `<section class="battle"><div class="enemy panel"><div class="enemy-name">${c.enemy.name}</div><div class="big-hp">${c.enemy.hp}/${c.enemy.maxHp} HP</div><div class="bar"><i style="width:${pct(c.enemy.hp,c.enemy.maxHp)}%"></i></div><div class="intent">INTENT: ${c.enemy.intent.label} · ${c.enemy.intent.damage} DMG · +${c.enemy.intent.stress} STRESS</div></div><div class="combat-area"><div class="active-dev panel">${devCard(c.active, true)}<div class="energy">ENERGIA: ${"⚡".repeat(c.energy)}${"·".repeat(3-c.energy)}</div><div class="combat-actions"><button data-action="code">CODA<br><small>1 ⚡</small></button><button data-action="debug">DEBUG<br><small>2 ⚡</small></button><button data-action="defend">DIFESA<br><small>1 ⚡</small></button></div><div class="hand">${c.hand.map((card, i) => `<button class="card" data-card="${i}" ${card.cost > c.energy ? "disabled" : ""}><b>${card.name}</b><span>${card.cost} ⚡</span><small>${card.description}</small></button>`).join("")}</div><button class="end" data-action="end-turn">FINE TURNO</button></div><aside class="bench panel"><h3>PANCHINA</h3>${c.team.map((d,i) => `<button class="bench-dev ${i===c.activeIndex ? "active":""}" data-switch="${i}" ${i===c.activeIndex || d.hp<=0 || d.stress>=100 ? "disabled":""}>${d.name} · HP ${d.hp} · S ${d.stress} · O ${d.items.length}/2</button>`).join("")}<h3>LOG</h3><div class="log">${c.log.slice(-8).reverse().map(x => `<div>${x}</div>`).join("")}</div></aside></div></section>`; }
  if (game.screen === "reward") { const card = game.reward!; return `<section class="panel center"><h2>RICOMPENSA</h2><p>Il percorso continua. Aggiungi un Tool al deck.</p><button class="reward-card" data-action="reward"><b>${card.name}</b><span>${card.cost} ⚡</span><small>${card.description}</small></button></section>`; }
  return `<section class="panel center result"><div class="pixel-icon">☠</div><h1>${game.message}</h1><p>Il progetto è andato in produzione. Da qualche parte.</p><button class="primary" data-action="restart">NUOVO PROGETTO</button></section>`;
}

function bind(game: Game) {
  root.querySelectorAll<HTMLElement>("[data-action]").forEach(el => el.onclick = () => { const action = el.dataset.action; if (action === "start") game.start(); if (action === "confirm-start") game.confirmStartingDeveloper(); if (action === "confirm-battle") game.confirmBattleStarter(); if (action === "code") game.combat?.basicAction("code"); if (action === "debug") game.combat?.basicAction("debug"); if (action === "defend") game.combat?.basicAction("defend"); if (action === "end-turn") game.combat?.endTurn(); if (action === "reward") game.chooseReward(0); if (action === "confirm-recruit") game.confirmRecruitment(); if (action === "confirm-item") game.confirmItemReward(); if (action === "restart") game.restart(); render(game); if (game.screen === "combat" && game.combat?.result !== "ongoing") { game.onCombatFinished(); render(game); } });
  root.querySelectorAll<HTMLElement>("[data-dev]").forEach(el => el.onclick = () => { if (game.screen === "team") { const index = game.startingCandidates.findIndex(dev => dev.id === el.dataset.dev); if (index >= 0) game.selectStartingDeveloper(index); } render(game); });
  root.querySelectorAll<HTMLElement>("[data-card]").forEach(el => el.onclick = () => { game.combat?.playCard(Number(el.dataset.card)); render(game); if (game.combat?.result !== "ongoing") { game.onCombatFinished(); render(game); } });
  root.querySelectorAll<HTMLElement>("[data-switch]").forEach(el => el.onclick = () => { game.combat?.switchDeveloper(Number(el.dataset.switch)); render(game); });
  root.querySelectorAll<HTMLElement>("[data-map-node]").forEach(el => el.onclick = () => { game.selectMapNode(el.dataset.mapNode!); render(game); });
  if (game.screen === "recruit") root.querySelectorAll<HTMLElement>(".developer-choice-grid .dev-card").forEach((el, index) => el.onclick = () => { game.selectRecruitCandidate(index); render(game); });
  root.querySelectorAll<HTMLElement>("[data-target]").forEach(el => el.onclick = () => { game.selectRecruitTarget(Number(el.dataset.target)); render(game); });
  if (game.screen === "itemReward") root.querySelectorAll<HTMLElement>("[data-item-target]").forEach(el => el.onclick = () => { game.selectItemTarget(Number(el.dataset.itemTarget)); render(game); });
  if (game.screen === "battleSetup") {
    root.querySelectorAll<HTMLElement>("[data-battle-dev]").forEach(el => {
      el.onclick = () => { game.selectBattleStarter(Number(el.dataset.battleDev)); render(game); };
      el.ondragstart = event => { event.dataTransfer?.setData("text/plain", el.dataset.battleDev ?? ""); if (event.dataTransfer) event.dataTransfer.effectAllowed = "move"; };
    });
    const drop = root.querySelector<HTMLElement>("[data-battle-drop]");
    if (drop) { drop.ondragover = event => { event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = "move"; }; drop.ondrop = event => { event.preventDefault(); const index = Number(event.dataTransfer?.getData("text/plain")); if (Number.isInteger(index)) game.moveBattleStarter(index); render(game); }; }
  }
}
