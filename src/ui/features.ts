import { developers } from "../data/developers";
import { enemies, boss } from "../data/enemies";
import { rewardCards, startingDeck } from "../data/cards";
import { rewardItems } from "../data/items";
import type { Card, Developer, Enemy, Item } from "../entities/types";
import { Game } from "../game/Game";
import { renderPokerCard } from "../card-view";

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
  return `<div class="codex-card-detail"><div class="codex-card-preview">${renderPokerCard(c)}</div><div class="codex-card-info"><span class="codex-kicker">DETTAGLIO TOOL</span><h2>${esc(c.name)}</h2><p class="codex-description">${esc(c.description)}</p><div class="codex-stats"><span>COSTO <b>${c.cost} ⚡</b></span><span>EFFETTO <b>${esc(cardEffect(c))}</b></span></div><section class="codex-block"><h3>EFFETTO TECNICO</h3><p>${esc(cardEffect(c))}</p></section></div></div>`;
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
  return `<div class="feature-overlay" data-feature-overlay="tutorial"><div class="feature-window tutorial-window"><div class="feature-titlebar"><div><span class="codex-kicker">MANUALE OPERATIVO</span><h2>TUTORIAL COMPLETO</h2><small>Dalla scelta del Developer alla DEADLINE.</small></div><button type="button" class="feature-close" data-feature-close>CHIUDI ×</button></div><div class="tutorial-progress"><span data-tutorial-progress>1 / 20</span><div><i data-tutorial-bar></i></div></div><aside class="tutorial-nav" data-tutorial-nav></aside><div class="tutorial-content">
    <section class="tutorial-section"><span class="tutorial-number">01</span><div><h3>OBIETTIVO DELLA RUN</h3><p>Parti con un Developer, attraversa la mappa e arriva alla DEADLINE. Sconfiggere la DEADLINE completa il progetto, ripristina il team e genera il progetto successivo con difficoltà aumentata.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">02</span><div><h3>SCELTA DEL DEVELOPER</h3><p>All'inizio vengono proposti 3 Developer casuali. Scegline uno in base a HP, CODICE, DEBUG, abilità, vantaggi e debolezze. Ogni Developer appartiene a una classe con una passiva specifica.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">03</span><div><h3>IL TEAM</h3><p>Il team può contenere fino a 3 Developer. Durante un combattimento ne hai 1 attivo e gli altri restano in panchina. I Developer possono essere cambiati quando usi CAMBIO. Un Developer ESAUSTO non può essere utilizzato finché non viene recuperato.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">04</span><div><h3>LA MAPPA</h3><p>La run è composta da una sequenza di righe e bivi. Ogni nodo rappresenta una scelta di percorso. Puoi incontrare COMBATTIMENTO, ELITE, EVENTO, RECLUTAMENTO, TOOL, EQUIPMENT, PAUSA, RECUPERO COMPLETO e nodi nascosti. Il nodo DEADLINE è lo scontro finale del progetto.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">05</span><div><h3>IL TURNO DI COMBATTIMENTO</h3><p>All'inizio del turno hai 3 Energia e peschi 3 carte. Puoi giocare i Tool compatibili con l'Energia disponibile e usare le azioni base. Quando termini il turno, la mano viene scartata e il nemico esegue l'azione indicata dalla sua intenzione. Poi inizia il turno successivo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">06</span><div><h3>AZIONI BASE</h3><p><b>CODICE</b> costa 1 Energia e infligge danni aumentando lo Stress. <b>DEBUG</b> costa 2 Energia e infligge più danni ma aumenta ulteriormente lo Stress. <b>DIFESA</b> costa 1 Energia e prepara una protezione. <b>CAMBIO</b> costa 1 Energia e permette di passare a un altro Developer disponibile.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">07</span><div><h3>TOOL, PESCA E SCARTI</h3><p>I Tool sono le carte del mazzo. Ogni carta indica costo ed effetto. Le carte giocate finiscono negli scarti; alla fine del turno anche la mano viene scartata. Quando il mazzo termina, gli scarti vengono rimescolati per creare un nuovo mazzo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">08</span><div><h3>HP ED ESAUSTO</h3><p>Gli HP rappresentano la resistenza del Developer. Quando arrivano a 0, il Developer è <b>ESAUSTO</b> e non può continuare a combattere. I nodi di recupero e alcune carte possono ripristinare HP secondo le regole della run.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">09</span><div><h3>STRESS</h3><p>Lo Stress va da 0 a 100. A <b>50–74</b> lo Stress aumenta del 10% il danno inflitto. A <b>75–99</b> aumenta del 20% il danno inflitto e del 10% il danno subito. A <b>100</b> scatta il BURNOUT.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">10</span><div><h3>BURNOUT</h3><p>Con Stress 100 il Developer va in <b>BURNOUT</b> e non può restare attivo. Se esiste un altro Developer utilizzabile, il gioco può effettuare il cambio previsto dalle regole del combattimento; se non c'è nessuno disponibile, la situazione può portare alla sconfitta.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">11</span><div><h3>CODICE, DEBUG E MATCHUP</h3><p>CODICE e DEBUG sono le statistiche principali usate dalle azioni di combattimento. Ogni Developer ha vantaggi e debolezze verso specifici tipi di nemico o condizioni. Prima di uno scontro controlla il matchup nel Codex e scegli chi mandare in campo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">12</span><div><h3>EQUIPMENT</h3><p>Gli oggetti sono equipaggiabili sui Developer e forniscono bonus a CODICE e/o DEBUG. Ogni Developer dispone di 2 slot equipaggiamento; gli oggetti non equipaggiati rimangono nello ZAINO e possono essere gestiti dalla schermata Equipment.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">13</span><div><h3>RECLUTAMENTO</h3><p>Nei nodi RECLUTAMENTO puoi scegliere un nuovo Developer tra i candidati disponibili. Se hai meno di 3 membri, il nuovo Developer entra nel team. Se hai già 3 membri, devi scegliere chi sostituire. Il nuovo membro entra fresco, con HP e Stress iniziali.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">14</span><div><h3>RICOMPENSE</h3><p>I combattimenti possono ricompensarti con Tool. I nodi TOOL permettono di aggiungere carte al mazzo, mentre i nodi EQUIPMENT forniscono oggetti. Costruire un mazzo efficace significa aggiungere strumenti utili senza perdere coerenza.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">15</span><div><h3>EVENTI E RECUPERO</h3><p>Gli EVENTI possono modificare temporaneamente o permanentemente le condizioni della run. PAUSA e RECUPERO permettono di gestire le risorse del team. Usa questi nodi per controllare HP e Stress invece di arrivare allo scontro successivo già in difficoltà.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">16</span><div><h3>ELITE E NEMICI</h3><p>Gli Elite sono combattimenti più impegnativi e possono avere ricompense migliori. I nemici appartengono a categorie diverse e hanno intenzioni, passivi, vantaggi e debolezze differenti. Osserva sempre l'intenzione mostrata in combattimento per capire cosa sta per succedere.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">17</span><div><h3>DEADLINE E NUOVO PROGETTO</h3><p>La DEADLINE è il boss del progetto. Dopo averla sconfitta, il team viene completamente ripristinato, il numero di progetto aumenta e la difficoltà cresce. Il ciclo ricomincia con una nuova mappa e nuovi scontri più impegnativi.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">18</span><div><h3>NUZLOCKE</h3><p>La modalità Nuzlocke aggiunge regole speciali selezionabili prima della run. Tra queste ci sono PERMADEATH, NIENTE GUARIGIONE, TEAM BLOCCATO, UN SOLO RECLUTAMENTO e altre restrizioni. Le regole attive vengono applicate alla singola run e rendono la gestione del team più importante.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">19</span><div><h3>ESEMPIO DI TURNO</h3><p>Hai 3 Energia e 3 Tool in mano. Puoi spendere 1 Energia per CODICE e usare l'Energia rimanente per un altro Tool, oppure conservare risorse e usare DIFESA. Se il Developer è troppo stressato, valuta CAMBIO o una carta che riduce Stress. Prima di chiudere il turno controlla sempre HP, Stress e intenzione del nemico.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">20</span><div><h3>PRIMA DI INIZIARE</h3><p>Leggi le statistiche dei 3 candidati. Controlla il Codex per conoscere matchup, carte e oggetti. Durante la run non pensare solo al danno: conserva HP, controlla lo Stress, costruisci un mazzo coerente e usa il cambio del Developer per sfruttare i matchup favorevoli.</p></div></section>
  </div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev>← INDIETRO</button><button type="button" class="primary" data-tutorial-next>AVANTI →</button></div></div></div>`;
}

function tutorialRefresh(index: number) {
  const overlay = document.querySelector<HTMLElement>('[data-feature-overlay="tutorial"]');
  if (!overlay) return;
  const sections = Array.from(overlay.querySelectorAll<HTMLElement>(".tutorial-section"));
  const current = Math.max(0, Math.min(index, sections.length - 1));
  overlay.dataset.tutorialIndex = String(current);
  sections.forEach((section, i) => section.classList.toggle("active", i === current));
  const content = overlay.querySelector<HTMLElement>(".tutorial-content");
  const progress = overlay.querySelector<HTMLElement>("[data-tutorial-progress]");
  const bar = overlay.querySelector<HTMLElement>("[data-tutorial-bar]");
  const prev = overlay.querySelector<HTMLButtonElement>("[data-tutorial-prev]");
  const next = overlay.querySelector<HTMLButtonElement>("[data-tutorial-next]");
  if (progress) progress.textContent = (current + 1) + " / " + sections.length;
  if (bar) bar.style.width = (((current + 1) / sections.length) * 100) + "%";
  if (prev) prev.disabled = current === 0;
  if (next) next.textContent = current === sections.length - 1 ? "FINE ✓" : "AVANTI →";
  sections.forEach((section, i) => {
    const number = section.querySelector<HTMLElement>(".tutorial-number");
    if (number) number.textContent = String(i + 1).padStart(2, "0");
  });
  if (content) content.scrollTop = 0;
}

function tutorialInit() {
  const overlay = document.querySelector<HTMLElement>('[data-feature-overlay="tutorial"]');
  if (!overlay) return;
  const sections = Array.from(overlay.querySelectorAll<HTMLElement>(".tutorial-section"));
  const nav = overlay.querySelector<HTMLElement>("[data-tutorial-nav]");
  if (nav) nav.innerHTML = sections.map((section, i) => {
    const title = section.querySelector("h3")?.textContent ?? "";
    return '<button type="button" class="tutorial-step" data-tutorial-step="' + i + '"><span>' + String(i + 1).padStart(2, "0") + '</span><b>' + esc(title) + '</b></button>';
  }).join("");
  tutorialRefresh(0);
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
      if (kind === "tutorial") { document.querySelector<HTMLElement>(".game-shell")?.insertAdjacentHTML("beforeend", tutorialMarkup()); tutorialInit(); }
      return;
    }
    if (close) { event.preventDefault(); event.stopPropagation(); overlay?.remove(); return; }
    const tutorialStep = target.closest<HTMLButtonElement>("[data-tutorial-step]");
    if (tutorialStep) { event.preventDefault(); event.stopPropagation(); tutorialRefresh(Number(tutorialStep.dataset.tutorialStep ?? 0)); return; }
    if (target.closest("[data-tutorial-prev]")) { event.preventDefault(); event.stopPropagation(); tutorialRefresh(Number(overlay?.dataset.tutorialIndex ?? 0) - 1); return; }
    if (target.closest("[data-tutorial-next]")) { event.preventDefault(); event.stopPropagation(); const current = Number(overlay?.dataset.tutorialIndex ?? 0); if (current >= document.querySelectorAll("[data-feature-overlay=\"tutorial\"] .tutorial-section").length - 1) overlay?.remove(); else tutorialRefresh(current + 1); return; }
    const category = target.closest<HTMLButtonElement>("[data-codex-category]");
    if (category) { event.preventDefault(); event.stopPropagation(); codexRefresh(category.dataset.codexCategory ?? "developers"); return; }
    const entry = target.closest<HTMLButtonElement>("[data-codex-entry]");
    if (entry) { event.preventDefault(); event.stopPropagation(); const current = document.querySelector<HTMLButtonElement>("[data-codex-category].active")?.dataset.codexCategory ?? "developers"; codexRefresh(current, entry.dataset.codexEntry); return; }
  }, true);

  injectMenuButtons(game);
}
