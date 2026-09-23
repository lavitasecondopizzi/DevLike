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
  return `<div class="codex-detail-head"><div><span class="codex-kicker">DEVELOPER · TIER ${d.tier}</span><h2>${esc(d.name)}</h2><b>${esc(d.role)}</b></div></div>
    <p class="codex-description">${esc(d.description)}</p>
    <div class="codex-stats"><span>TIER <b>${d.tier}</b></span><span>HP <b>${d.maxHp}</b></span><span>CODICE <b>${d.code}</b></span><span>DEBUG <b>${d.debug}</b></span><span>STRESS MAX <b>${d.maxStress}</b></span></div>
    <section class="codex-block"><h3>ABILITÀ</h3><p>${esc(d.passive)}</p></section>
    <div class="codex-two"><section class="codex-block"><h3>VANTAGGI</h3>${d.advantages.map(x => `<p>${esc(x)}</p>`).join("")}</section><section class="codex-block"><h3>DEBOLEZZE</h3>${d.weaknesses.map(x => `<p>${esc(x)}</p>`).join("")}</section></div>`;
}

function enemyDetails(e: Enemy) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">NEMICO · ${esc(e.type)} · VALORI BASE</span><h2>${esc(e.name)}</h2></div></div>
    <p class="codex-description">${esc(e.description)}</p>
    <div class="codex-stats"><span>HP <b>${e.maxHp}</b></span><span>CODICE <b>${e.code}</b></span><span>DEBUG <b>${e.debug}</b></span><span>DMG <b>${e.intent.damage}</b></span><span>STRESS <b>+${e.intent.stress}</b></span></div>
    <section class="codex-block"><h3>ABILITÀ</h3><p>${esc(e.passive)}</p></section>
    <section class="codex-block"><h3>INTENZIONE</h3><p>${esc(e.intent.label)} · ${e.intent.damage} danni · +${e.intent.stress} Stress</p></section>
    <div class="codex-two"><section class="codex-block"><h3>VANTAGGI</h3>${e.advantages.map(x => `<p>${esc(x)}</p>`).join("")}</section><section class="codex-block"><h3>DEBOLEZZE</h3>${e.weaknesses.map(x => `<p>${esc(x)}</p>`).join("")}</section></div>`;
}

function cardDetails(c: Card) {
  return `<div class="codex-card-detail"><div class="codex-card-preview">${renderPokerCard(c)}</div><div class="codex-card-info"><span class="codex-kicker">DETTAGLIO TOOL · TIER ${c.tier ?? 1}</span><h2>${esc(c.name)}</h2><p class="codex-description">${esc(c.description)}</p><div class="codex-stats"><span>TIER <b>${c.tier ?? 1}</b></span><span>COSTO <b>${c.cost} ⚡</b></span><span>EFFETTO <b>${esc(cardEffect(c))}</b></span></div><section class="codex-block"><h3>EFFETTO TECNICO</h3><p>${esc(cardEffect(c))}</p></section></div></div>`;
}

function itemDetails(i: Item) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">OGGETTO · TIER ${i.tier}</span><h2>${esc(i.name)}</h2></div></div><p class="codex-description">${esc(i.description)}</p><div class="codex-stats"><span>TIER <b>${i.tier}</b></span><span>CODICE <b>+${i.codeBonus}</b></span><span>DEBUG <b>+${i.debugBonus}</b></span><span>POTENZA <b>${i.codeBonus + i.debugBonus}</b></span><span>SLOT <b>1</b></span></div><section class="codex-block"><h3>EFFETTO</h3><p>${i.codeBonus ? `+${i.codeBonus} CODICE` : "Nessun bonus CODICE"} · ${i.debugBonus ? `+${i.debugBonus} DEBUG` : "Nessun bonus DEBUG"}</p></section>`;
}

function dataForCategory(category: string): Array<{ id: string; name: string; subtitle: string; details: string; tier?: number }> {
  if (category === "developers") {
    return [...developers]
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, "it"))
      .map(d => ({ id: d.id, name: d.name, tier: d.tier, subtitle: `T${d.tier} · ${d.role} · ${d.code} COD / ${d.debug} DEBUG`, details: developerDetails(d) }));
  }
  if (category === "enemies") {
    return [...enemies, boss]
      .sort((a, b) => a.name.localeCompare(b.name, "it"))
      .map(e => ({ id: e.id, name: e.name, subtitle: e.type, details: enemyDetails(e) }));
  }
  if (category === "cards") {
    const all = [...startingDeck, ...rewardCards].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
    return all
      .sort((a, b) => (a.tier ?? 1) - (b.tier ?? 1) || a.name.localeCompare(b.name, "it"))
      .map(c => ({ id: c.id, name: c.name, tier: c.tier ?? 1, subtitle: `T${c.tier ?? 1} · ${c.cost} ⚡ · ${cardEffect(c)}`, details: cardDetails(c) }));
  }
  return [...rewardItems]
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, "it"))
    .map(i => ({ id: i.id, name: i.name, tier: i.tier, subtitle: `T${i.tier} · +${i.codeBonus} COD · +${i.debugBonus} DEBUG`, details: itemDetails(i) }));
}

function codexMarkup() {
  return `<div class="feature-overlay codex-overlay" data-feature-overlay="codex"><div class="feature-window codex-window"><div class="feature-titlebar"><div><span class="codex-kicker">DATABASE</span><h2>CODEX DEVLIKE</h2></div><button type="button" class="feature-close" data-feature-close>CHIUDI ×</button></div><nav class="codex-tabs"><button type="button" class="active" data-codex-category="developers">DEVELOPER</button><button type="button" data-codex-category="enemies">NEMICI</button><button type="button" data-codex-category="cards">TOOL</button><button type="button" data-codex-category="items">OGGETTI</button></nav><div class="codex-layout"><aside class="codex-list" data-codex-list></aside><article class="codex-detail" data-codex-detail></article></div></div></div>`;
}

function tutorialMarkup() {
  return `<div class="feature-overlay" data-feature-overlay="tutorial"><div class="feature-window tutorial-window"><div class="feature-titlebar"><div><span class="codex-kicker">MANUALE OPERATIVO</span><h2>TUTORIAL COMPLETO</h2><small>Dalla scelta del Developer alla DEADLINE.</small></div><button type="button" class="feature-close" data-feature-close>CHIUDI ×</button></div><div class="tutorial-layout"><aside class="tutorial-nav" data-tutorial-nav></aside><section class="tutorial-main"><div class="tutorial-progress"><span data-tutorial-progress>1 / 20</span><div><i data-tutorial-bar></i></div></div><div class="tutorial-content">
    <section class="tutorial-section"><span class="tutorial-number">01</span><div><h3>OBIETTIVO DELLA RUN</h3><p>Parti con un Developer, attraversa la mappa e arriva alla DEADLINE. Sconfiggere la DEADLINE completa la COMMESSA, ripristina completamente il team, aumenta il numero di COMMESSA e genera una nuova mappa con difficoltà aumentata.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">02</span><div><h3>SCELTA DEL DEVELOPER</h3><p>All'inizio vengono proposti 3 Developer casuali. Scegline uno in base a HP, CODICE, DEBUG, abilità, vantaggi e debolezze. Ogni Developer appartiene a una classe con una passiva specifica.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">03</span><div><h3>IL TEAM</h3><p>Il team può contenere fino a 3 Developer. Durante un combattimento ne hai 1 attivo e gli altri restano in panchina. I Developer possono essere cambiati quando usi CAMBIO. Un Developer ESAUSTO non può essere utilizzato finché non viene recuperato.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">04</span><div><h3>LA MAPPA</h3><p>La mappa è composta da 6 fasi, ciascuna con 3 nodi tra cui scegliere: BATTAGLIA, TOOL, EQUIPAGGIAMENTO, EVENTO, ELITE, RECLUTAMENTO e PAUSA. I percorsi mostrano solo i collegamenti disponibili dal nodo corrente. Dopo l'ULTIMO SPRINT raggiungi la PAUSA FINALE e poi la DEADLINE.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">05</span><div><h3>IL TURNO DI COMBATTIMENTO</h3><p>All'inizio del turno hai 3 Energia e peschi 3 carte. Puoi usare CODICE, DEBUG, DIFESA, CAMBIO e Tool finché hai Energia disponibile. Quando termini il turno, il nemico esegue l'INTENZIONE mostrata. La mano viene poi scartata e inizia il turno successivo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">06</span><div><h3>AZIONI BASE</h3><p><b>CODICE</b> costa 1 Energia e infligge danni aumentando lo Stress. <b>DEBUG</b> costa 2 Energia e infligge più danni ma aumenta ulteriormente lo Stress. <b>DIFESA</b> costa 1 Energia e prepara una protezione. <b>CAMBIO</b> costa 1 Energia e permette di passare a un altro Developer disponibile.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">07</span><div><h3>TOOL, PESCA E SCARTI</h3><p>I Tool sono le carte del MAZZO. Ogni carta indica costo, TIER ed effetto. Le carte giocate finiscono negli SCARTI; a fine turno anche le carte rimaste in mano vengono scartate. Quando il MAZZO termina, gli SCARTI vengono rimescolati per creare un nuovo MAZZO.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">08</span><div><h3>HP ED ESAUSTO</h3><p>Gli HP rappresentano la resistenza del Developer. Quando arrivano a 0, il Developer è <b>ESAUSTO</b> e non può continuare a combattere. I nodi di recupero e alcune carte possono ripristinare HP secondo le regole della run.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">09</span><div><h3>STRESS</h3><p>Lo Stress ha un limite specifico per ogni Developer. Al <b>50%</b> del limite, il danno inflitto aumenta del 10%; al <b>75%</b> aumenta del 20% e il danno subito del 10%. Al raggiungimento del limite scatta il BURNOUT.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">10</span><div><h3>BURNOUT</h3><p>Quando lo Stress raggiunge il limite personale, il Developer va in <b>BURNOUT</b> e non può restare attivo. Se esiste un altro Developer utilizzabile, il gioco può effettuare il cambio previsto dalle regole del combattimento; se non c'è nessuno disponibile, la situazione può portare alla sconfitta.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">11</span><div><h3>CODICE, DEBUG E MATCHUP</h3><p>CODICE e DEBUG sono le statistiche principali usate dalle azioni di combattimento. Ogni Developer ha vantaggi e debolezze verso specifici tipi di nemico o condizioni. Prima di uno scontro controlla il matchup nel Codex e scegli chi mandare in campo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">12</span><div><h3>EQUIPMENT</h3><p>Gli oggetti forniscono bonus a CODICE e/o DEBUG. Ogni Developer dispone di 2 slot. Gli oggetti non equipaggiati restano nello ZAINO e possono essere spostati tra ZAINO e Developer dalla schermata EQUIPMENT.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">13</span><div><h3>RECLUTAMENTO</h3><p>Nei nodi RECLUTAMENTO puoi scegliere un nuovo Developer tra i candidati disponibili. Se hai meno di 3 membri, il nuovo Developer entra nel team. Se hai già 3 membri, devi scegliere chi sostituire. Il nuovo membro entra fresco, con HP e Stress iniziali.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">14</span><div><h3>RICOMPENSE</h3><p>Le ricompense possono aggiungere Tool alle CARTE POSSEDUTE e, se il MAZZO ha meno di 20 carte, anche direttamente al MAZZO. Il MAZZO contiene da 5 a 20 carte; le carte rimosse restano possedute e possono essere reinserite. I nodi TOOL danno una carta, mentre i nodi EQUIPAGGIAMENTO danno un oggetto.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">15</span><div><h3>EVENTI E RECUPERO</h3><p>Gli EVENTI presentano tre scelte con conseguenze immediate su HP, Stress, Tempo e talvolta ricompense. La PAUSA recupera HP e riduce Stress. Gestire il TEMPO è importante perché ogni nodo, salvo le pause, può consumarne una quantità.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">16</span><div><h3>ELITE E NEMICI</h3><p>Gli Elite sono combattimenti più impegnativi e possono avere ricompense migliori. I nemici appartengono a categorie diverse e hanno intenzioni, passivi, vantaggi e debolezze differenti. Osserva sempre l'intenzione mostrata in combattimento per capire cosa sta per succedere.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">17</span><div><h3>DEADLINE E NUOVO PROGETTO</h3><p>La DEADLINE è il boss della COMMESSA. Dopo averla sconfitta, il team viene completamente ripristinato, il numero di COMMESSA aumenta, la difficoltà cresce e ricevi una scelta tra 6 ricompense: 3 oggetti e 3 Tool. La run riparte con una nuova mappa e TEMPO riportato a 8.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">18</span><div><h3>NUZLOCKE</h3><p>La modalità Nuzlocke aggiunge regole speciali selezionabili prima della run. Tra queste ci sono PERMADEATH, NIENTE GUARIGIONE, TEAM BLOCCATO, UN SOLO RECLUTAMENTO e altre restrizioni. Le regole attive vengono applicate alla singola run e rendono la gestione del team più importante.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">19</span><div><h3>ESEMPIO DI TURNO</h3><p>Hai 3 Energia e 3 Tool in mano. Puoi spendere 1 Energia per CODICE, 2 per DEBUG, 1 per DIFESA o usare un Tool compatibile. Prima di FINE TURNO controlla il danno e lo Stress previsti dell'INTENZIONE nemica, oltre all'eventuale rischio di KO. Se non hai azioni disponibili, il turno può essere chiuso automaticamente.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">20</span><div><h3>PRIMA DI INIZIARE</h3><p>Leggi i 3 candidati e il loro eventuale mazzo iniziale. Controlla il Codex per matchup, Tool, oggetti e nemici. Durante la COMMESSA gestisci HP, Stress e TEMPO, costruisci un MAZZO coerente e scegli il Developer iniziale di ogni combattimento in base alla situazione.</p></div></section>
  </div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev>← INDIETRO</button><button type="button" class="primary" data-tutorial-next>AVANTI →</button></div></section></div></div></div>`;
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
  if (list) {
    let lastTier: number | undefined;
    const markup: string[] = [];
    data.forEach(x => {
      if (x.tier !== undefined && x.tier !== lastTier) {
        lastTier = x.tier;
        markup.push(`<div class="codex-tier-divider"><span>TIER ${x.tier}</span></div>`);
      }
      markup.push(`<button type="button" class="codex-entry ${x.id === selected?.id ? "selected" : ""}" data-codex-entry="${esc(x.id)}"><b>${esc(x.name)}</b><small>${esc(x.subtitle)}</small></button>`);
    });
    list.innerHTML = markup.join("");
  }
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
