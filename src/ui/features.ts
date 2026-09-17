import { developers } from "../data/developers";
import { enemies, boss } from "../data/enemies";
import { rewardCards, startingDeck } from "../data/cards";
import { rewardItems } from "../data/items";
import type { Card, Developer, Enemy, Item } from "../entities/types";
import { Game } from "../game/Game";

export type FeatureGame = Game & { nuzlockeActive: boolean; nuzlockeGraveyard: string[] };

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function cardEffect(card: Card) {
  const e = card.effect;
  const labels: Record<string, string> = {
    damage: "DANNI",
    heal: "CURA",
    stress: "STRESS",
    codeBoost: "CODICE",
    block: "DIFESA",
    removeStress: "RIDUZIONE STRESS"
  };
  return `${labels[e.type] ?? e.type}: ${e.amount}${e.type === "codeBoost" ? "%" : ""}`;
}

function developerDetails(d: Developer) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">DEVELOPER</span><h2>${esc(d.name)}</h2><b>${esc(d.role)}</b></div></div>
    <p class="codex-description">${esc(d.description)}</p>
    <div class="codex-stats"><span>HP <b>${d.maxHp}</b></span><span>CODICE <b>${d.code}</b></span><span>DEBUG <b>${d.debug}</b></span><span>STRESS MAX <b>100</b></span></div>
    <section class="codex-block"><h3>ABILITÀ</h3><p>${esc(d.passive)}</p></section>
    <div class="codex-two"><section class="codex-block"><h3>VANTAGGI</h3>${d.advantages.map(x => `<p>${esc(x)}</p>`).join("")}</section><section class="codex-block"><h3>DEBOLEZZE</h3>${d.weaknesses.map(x => `<p>${esc(x)}</p>`).join("")}</section></div>`;
}

function enemyDetails(e: Enemy) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">NEMICO · ${esc(e.type)}</span><h2>${esc(e.name)}</h2></div></div>
    <p class="codex-description">${esc(e.description)}</p>
    <div class="codex-stats"><span>HP <b>${e.maxHp}</b></span><span>CODICE <b>${e.code}</b></span><span>DEBUG <b>${e.debug}</b></span><span>DMG <b>${e.intent.damage}</b></span><span>STRESS <b>+${e.intent.stress}</b></span></div>
    <section class="codex-block"><h3>ABILITÀ</h3><p>${esc(e.passive)}</p></section>
    <section class="codex-block"><h3>INTENZIONE</h3><p>${esc(e.intent.label)} · ${e.intent.damage} danni · +${e.intent.stress} Stress</p></section>
    <div class="codex-two"><section class="codex-block"><h3>VANTAGGI</h3>${e.advantages.map(x => `<p>${esc(x)}</p>`).join("")}</section><section class="codex-block"><h3>DEBOLEZZE</h3>${e.weaknesses.map(x => `<p>${esc(x)}</p>`).join("")}</section></div>`;
}

function cardDetails(c: Card) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">TOOL</span><h2>${esc(c.name)}</h2></div><span class="codex-cost">${c.cost} ⚡</span></div><p class="codex-description">${esc(c.description)}</p><div class="codex-stats"><span>COSTO <b>${c.cost} ⚡</b></span><span>EFFETTO <b>${esc(cardEffect(c))}</b></span></div><section class="codex-block"><h3>EFFETTO TECNICO</h3><p>${esc(cardEffect(c))}</p></section>`;
}

function itemDetails(i: Item) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">OGGETTO</span><h2>${esc(i.name)}</h2></div></div><p class="codex-description">${esc(i.description)}</p><div class="codex-stats"><span>CODICE <b>+${i.codeBonus}</b></span><span>DEBUG <b>+${i.debugBonus}</b></span><span>SLOT <b>1</b></span></div><section class="codex-block"><h3>EFFETTO</h3><p>${i.codeBonus ? `+${i.codeBonus} CODICE` : "Nessun bonus CODICE"} · ${i.debugBonus ? `+${i.debugBonus} DEBUG` : "Nessun bonus DEBUG"}</p></section>`;
}

function dataForCategory(category: string): Array<{ id: string; name: string; subtitle: string; details: string }> {
  if (category === "developers") return developers.map(d => ({ id: d.id, name: d.name, subtitle: d.role, details: developerDetails(d) }));
  if (category === "enemies") return [...enemies, boss].map(e => ({ id: e.id, name: e.name, subtitle: e.type, details: enemyDetails(e) }));
  if (category === "cards") {
    const all = [...startingDeck, ...rewardCards].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
    return all.map(c => ({ id: c.id, name: c.name, subtitle: `${c.cost} ⚡ · ${cardEffect(c)}`, details: cardDetails(c) }));
  }
  return rewardItems.map(i => ({ id: i.id, name: i.name, subtitle: `+${i.codeBonus} COD · +${i.debugBonus} DEBUG`, details: itemDetails(i) }));
}

function codexMarkup() {
  return `<div class="feature-overlay codex-overlay" data-feature-overlay="codex"><div class="feature-window codex-window"><div class="feature-titlebar"><div><span class="codex-kicker">DATABASE</span><h2>CODEX DEVLIKE</h2></div><button type="button" class="feature-close" data-feature-close>CHIUDI ×</button></div><nav class="codex-tabs"><button type="button" class="active" data-codex-category="developers">DEVELOPER</button><button type="button" data-codex-category="enemies">NEMICI</button><button type="button" data-codex-category="cards">CARTE</button><button type="button" data-codex-category="items">OGGETTI</button></nav><div class="codex-layout"><aside class="codex-list" data-codex-list></aside><article class="codex-detail" data-codex-detail></article></div></div></div>`;
}

function tutorialMarkup() {
  return `<div class="feature-overlay" data-feature-overlay="tutorial"><div class="feature-window tutorial-window"><div class="feature-titlebar"><div><span class="codex-kicker">MANUALE OPERATIVO</span><h2>TUTORIAL</h2></div><button type="button" class="feature-close" data-feature-close>CHIUDI ×</button></div><div class="tutorial-content">
    <section class="tutorial-section"><span class="tutorial-number">01</span><div><h3>OBIETTIVO</h3><p>Arriva alla DEADLINE e sconfiggila. Una run è una sequenza di nodi: combattimenti, reclutamenti, ricompense, oggetti, eventi e pause.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">02</span><div><h3>TEAM</h3><p>Parti scegliendo 1 Developer tra 3 candidati. Durante la run puoi arrivare a 3 membri. Solo 1 è attivo in combattimento; gli altri sono in panchina e puoi cambiare strategia tra gli scontri.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">03</span><div><h3>ENERGIA E CARTE</h3><p>Ogni turno hai 3 Energia e peschi 3 Tool. Ogni carta ha un costo. Usa CODA per attaccare, DEBUG per gestire i problemi, DIFESA per proteggerti e CAMBIO per cambiare Developer quando previsto dal combattimento.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">04</span><div><h3>HP E STRESS</h3><p>HP a 0 significa ESAUSTO: quel Developer non può essere usato finché non viene recuperato. Lo Stress va da 0 a 100: 50–74 aumenta il danno del 10%, 75–99 aumenta il danno del 20% ma anche il danno subito del 10%, 100 provoca BURNOUT.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">05</span><div><h3>CODICE E DEBUG</h3><p>CODICE rappresenta la potenza delle azioni offensive basate sul codice; DEBUG è la capacità di affrontare e correggere i problemi. I matchup VANTAGGI/DEBOLEZZE modificano l'efficacia contro determinati nemici e condizioni.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">06</span><div><h3>EQUIPMENT</h3><p>Ogni Developer ha 2 slot. Gli oggetti forniscono bonus permanenti a CODICE e/o DEBUG. Gli oggetti extra finiscono nello ZAINO e possono essere spostati liberamente.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">07</span><div><h3>MAPPA</h3><p>Le strade si ramificano e il percorso viene generato a ogni progetto. I combattimenti possono essere nascosti: un nodo "?" rivela il nemico solo quando lo affronti.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">08</span><div><h3>RICOMPENSE E RECLUTAMENTO</h3><p>I nodi TOOL aggiungono carte al mazzo. I nodi EQUIPMENT danno oggetti. I nodi RECLUTAMENTO aggiungono un Developer; con 3 membri puoi sostituirne uno.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">09</span><div><h3>BURNOUT ED ESAUSTO</h3><p>BURNOUT significa Stress 100 e impedisce di mandare quel Developer in campo. ESAUSTO significa HP 0. Gestire la rotazione del team e lo Stress è parte fondamentale della run.</p></div></section>
  </div></div></div>`;
}

function nuzlockeMarkup() {
  return `<div class="feature-overlay" data-feature-overlay="nuzlocke"><div class="feature-window nuzlocke-window"><div class="feature-titlebar"><div><span class="codex-kicker">MODALITÀ SPECIALE</span><h2>NUZLOCKE</h2></div><button type="button" class="feature-close" data-feature-close>ANNULLA ×</button></div><div class="nuzlocke-rules"><h3>REGOLE DEL PROGETTO</h3><p><b>ESAUSTO = FUORI RUN.</b> Se un Developer arriva a 0 HP, viene rimosso definitivamente dal team quando termina il combattimento.</p><p>Un Developer perso non può essere recuperato, anche durante i nodi di cura. Il resto delle regole di DevLike rimane invariato.</p><p>Se tutto il team viene perso, il progetto termina immediatamente.</p></div><button type="button" class="primary nuzlocke-start" data-action="start-nuzlocke">INIZIA NUZLOCKE</button></div></div>`;
}

function codexRefresh(category: string, selectedId?: string) {
  const overlay = document.querySelector<HTMLElement>('[data-feature-overlay="codex"]');
  if (!overlay) return;
  const list = overlay.querySelector<HTMLElement>("[data-codex-list]");
  const detail = overlay.querySelector<HTMLElement>("[data-codex-detail]");
  const tabs = overlay.querySelectorAll<HTMLButtonElement>("[data-codex-category]");
  const data = dataForCategory(category);
  const selected = data.find(x => x.id === selectedId) ?? data[0];
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.codexCategory === category));
  if (list) list.innerHTML = data.map(x => `<button type="button" class="codex-entry ${x.id === selected?.id ? "selected" : ""}" data-codex-entry="${esc(x.id)}"><b>${esc(x.name)}</b><small>${esc(x.subtitle)}</small></button>`).join("");
  if (detail) detail.innerHTML = selected?.details ?? `<div class="codex-empty">NESSUN RECORD</div>`;
}

function injectMenuButtons(game: FeatureGame) {
  if (game.screen !== "menu") return;
  const center = document.querySelector<HTMLElement>(".game-shell .center");
  if (!center || center.querySelector(".feature-menu")) return;
  const active = game.nuzlockeActive;
  center.insertAdjacentHTML("beforeend", `<div class="feature-menu"><button type="button" class="secondary" data-feature-open="tutorial">TUTORIAL</button><button type="button" class="secondary" data-feature-open="codex">CODEX</button><button type="button" class="secondary nuzlocke-menu" data-feature-open="nuzlocke">NUZLOCKE</button>${active ? `<small class="mode-chip">NUZLOCKE ATTIVA</small>` : ""}</div>`);
}

export function setupFeatures(game: FeatureGame) {
  const originalStart = game.start.bind(game);
  game.start = () => { originalStart(); game.nuzlockeGraveyard = []; };
  const originalCombatFinished = game.onCombatFinished.bind(game);
  game.onCombatFinished = () => {
    originalCombatFinished();
    if (!game.nuzlockeActive) return;
    const lost = game.team.filter(d => d.hp <= 0);
    lost.forEach(d => { if (!game.nuzlockeGraveyard.includes(d.id)) game.nuzlockeGraveyard.push(d.id); });
    if (lost.length) game.team = game.team.filter(d => d.hp > 0);
    if (!game.team.length) { game.screen = "result"; game.message = "NUZLOCKE FAILED · TUTTO IL TEAM È ESAUSTO."; }
  };

  const observer = new MutationObserver(() => injectMenuButtons(game));
  observer.observe(document.getElementById("app")!, { childList: true, subtree: true });

  document.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const open = target.closest<HTMLElement>("[data-feature-open]");
    const close = target.closest<HTMLElement>("[data-feature-close]");
    const overlay = target.closest<HTMLElement>("[data-feature-overlay]");
    if (open) {
      event.preventDefault();
      event.stopPropagation();
      const kind = open.dataset.featureOpen;
      if (kind === "codex") { document.querySelector<HTMLElement>(".game-shell")?.insertAdjacentHTML("beforeend", codexMarkup()); codexRefresh("developers"); }
      if (kind === "tutorial") document.querySelector<HTMLElement>(".game-shell")?.insertAdjacentHTML("beforeend", tutorialMarkup());
      if (kind === "nuzlocke") document.querySelector<HTMLElement>(".game-shell")?.insertAdjacentHTML("beforeend", nuzlockeMarkup());
      return;
    }
    if (close) { event.preventDefault(); event.stopPropagation(); overlay?.remove(); return; }
    const category = target.closest<HTMLButtonElement>("[data-codex-category]");
    if (category) { event.preventDefault(); event.stopPropagation(); codexRefresh(category.dataset.codexCategory ?? "developers"); return; }
    const entry = target.closest<HTMLButtonElement>("[data-codex-entry]");
    if (entry) { event.preventDefault(); event.stopPropagation(); const current = document.querySelector<HTMLButtonElement>("[data-codex-category].active")?.dataset.codexCategory ?? "developers"; codexRefresh(current, entry.dataset.codexEntry); return; }
    if (target.closest("[data-action=\"start-nuzlocke\"]")) {
      event.preventDefault(); event.stopPropagation();
      game.nuzlockeActive = true;
      game.nuzlockeGraveyard = [];
      originalStart();
      return;
    }
  }, true);

  injectMenuButtons(game);
}
