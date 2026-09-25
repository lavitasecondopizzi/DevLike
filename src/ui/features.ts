import { Game } from "../game/Game";
import { setupCodex } from "./codex";

export type FeatureGame = Game & { nuzlockeActive: boolean; nuzlockeGraveyard: string[] };

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function tutorialMarkup() {
  return `<div class="feature-overlay" data-feature-overlay="tutorial"><div class="feature-window tutorial-window"><div class="feature-titlebar"><div><span class="codex-kicker">MANUALE OPERATIVO</span><h2>TUTORIAL COMPLETO</h2><small>Dalla scelta del Developer alla DEADLINE.</small></div><button type="button" class="feature-close" data-feature-close>SALTA TUTORIAL ×</button></div><div class="tutorial-layout"><aside class="tutorial-nav" data-tutorial-nav></aside><section class="tutorial-main"><div class="tutorial-progress"><span data-tutorial-progress>1 / 23</span><div><i data-tutorial-bar></i></div></div><div class="tutorial-content">
    <section class="tutorial-section"><span class="tutorial-number">01</span><div><h3>OBIETTIVO DELLA RUN</h3><p>Parti con un Developer, attraversa la mappa e arriva alla DEADLINE. Sconfiggere la DEADLINE completa la COMMESSA, ripristina completamente il team, aumenta il numero di COMMESSA e genera una nuova mappa con difficoltà aumentata.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">02</span><div><h3>SCELTA DEL DEVELOPER</h3><p>All'inizio vengono proposti 3 Developer casuali. Scegline uno in base a HP, CODICE, DEBUG, abilità, vantaggi e debolezze. Ogni Developer appartiene a una classe con una passiva specifica.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">03</span><div><h3>IL TEAM</h3><p>Il team può contenere fino a 3 Developer. Prima di ogni combattimento puoi <b>riordinare il team trascinando i membri</b>: il Developer in prima posizione entra per primo, poi gli altri seguono automaticamente in caso di KO o BURNOUT. I Developer possono essere cambiati durante il combattimento quando CAMBIO è disponibile. <b>Le abilità passive dei Developer sono abilità di squadra:</b> quando un membro disponibile possiede una passiva, il suo effetto può beneficiare anche il Developer attivo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">04</span><div><h3>LA MAPPA</h3><p>La mappa è composta da <b>6 tappe</b>, ciascuna con nodi tra BATTAGLIA, TOOL, EQUIPAGGIAMENTO, EVENTO, ELITE, RECLUTAMENTO e PAUSA. Le combinazioni cambiano a ogni run e i collegamenti mostrano solo i percorsi validi. Dopo la sesta tappa puoi raggiungere la <b>PAUSA FINALE</b>, poi affronti la DEADLINE; se il TEMPO arriva a 0, la pausa finale viene saltata.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">05</span><div><h3>IL TURNO DI COMBATTIMENTO</h3><p>All'inizio del turno hai normalmente <b>3 Energia</b> e peschi 3 carte. In Nuzlocke alcune regole possono ridurre Energia o mano. Puoi usare CODICE, DEBUG, DIFESA, CAMBIO e Tool finché hai Energia disponibile. Quando termini il turno, il nemico esegue l'INTENZIONE mostrata; poi la mano viene scartata e inizia il turno successivo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">06</span><div><h3>AZIONI BASE</h3><p><b>CODICE</b> costa 1 Energia e infligge danni aumentando lo Stress. <b>DEBUG</b> costa 2 Energia e infligge più danni ma aumenta ulteriormente lo Stress. <b>DIFESA</b> costa 1 Energia e prepara una protezione. <b>CAMBIO</b> costa 1 Energia e permette di passare a un altro Developer disponibile.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">07</span><div><h3>TOOL, TIER, PESCA E SCARTI</h3><p>I Tool sono le carte del MAZZO. Ogni carta indica costo, TIER ed effetto. Il TIER segue la COMMESSA: <b>1–5 = TIER 1</b>, <b>6–10 = TIER 2</b>, <b>11–15 = TIER 3</b>, <b>16+ = TIER 4</b>. Le carte giocate finiscono negli SCARTI; a fine turno anche quelle rimaste in mano vengono scartate. Quando il MAZZO termina, gli SCARTI vengono rimescolati per creare un nuovo MAZZO.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">08</span><div><h3>HP ED ESAUSTO</h3><p>Gli HP rappresentano la resistenza del Developer. Quando arrivano a 0, il Developer è <b>ESAUSTO</b> e non può continuare a combattere. I nodi di recupero e alcune carte possono ripristinare HP secondo le regole della run.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">09</span><div><h3>STRESS</h3><p>Lo Stress ha un limite specifico per ogni Developer. Dal <b>50%</b> il danno inflitto aumenta del 10%; dal <b>75%</b> aumenta del 20% e anche il danno subito aumenta del 10%. Raggiunto il limite, il Developer va in BURNOUT.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">10</span><div><h3>BURNOUT</h3><p>Quando lo Stress raggiunge il limite personale, il Developer va in <b>BURNOUT</b> e non può restare attivo. Se esiste un altro Developer utilizzabile, il gioco può effettuare il cambio previsto dalle regole del combattimento; se non c'è nessuno disponibile, la situazione può portare alla sconfitta.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">11</span><div><h3>CODICE, DEBUG E MATCHUP</h3><p>CODICE e DEBUG sono le statistiche principali usate dalle azioni di combattimento. Ogni Developer ha vantaggi e debolezze verso specifici tipi di nemico o condizioni. Prima di uno scontro controlla il matchup nel Codex e scegli chi mandare in campo.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">12</span><div><h3>EQUIPAGGIAMENTO E TIER</h3><p>Gli oggetti forniscono bonus a CODICE e/o DEBUG. Ogni Developer dispone di <b>2 slot Equipment</b> (1 in alcune regole Nuzlocke). Gli oggetti non equipaggiati restano nello ZAINO e possono essere spostati tra ZAINO e Developer dalla schermata EQUIPMENT. Gli oggetti sono divisi in <b>TIER 1–4</b> e il loro Tier segue la progressione della COMMESSA.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">13</span><div><h3>RECLUTAMENTO</h3><p>Nei nodi RECLUTAMENTO puoi scegliere un nuovo Developer tra i candidati disponibili. Se hai meno di 3 membri, il nuovo Developer entra nel team. Se hai già 3 membri, devi scegliere chi sostituire. Il nuovo membro entra fresco, con HP e Stress iniziali.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">14</span><div><h3>RICOMPENSE E SCALATA DEI TIER</h3><p>Le ricompense aggiungono Tool alle CARTE POSSEDUTE e, se il MAZZO ha meno di 20 carte, anche direttamente al MAZZO. Il MAZZO ha un limite di <b>20 carte</b>. I nodi TOOL danno una carta, mentre i nodi EQUIPAGGIAMENTO danno un oggetto; gli ELITE possono offrire ricompense di un Tier superiore. Il Tier delle ricompense segue la COMMESSA: ogni <b>5 COMMESSE</b> si sale di Tier.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">15</span><div><h3>EVENTI E RECUPERO</h3><p>Gli EVENTI presentano tre scelte con conseguenze immediate su HP, Stress, Tempo e talvolta ricompense. La PAUSA recupera HP e riduce Stress. Gestire il TEMPO è importante perché ogni nodo, salvo le pause, può consumarne una quantità.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">16</span><div><h3>ELITE, TIER E NEMICI</h3><p>Gli Elite sono combattimenti più impegnativi e pescano nemici di <b>un Tier superiore</b> rispetto a quello attuale della COMMESSA, fino al TIER 4. I nemici normali seguono il Tier della COMMESSA. Nemici, Developer e condizioni possono avere vantaggi e debolezze differenti. Osserva sempre l'INTENZIONE mostrata in combattimento per capire danni e Stress previsti.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">17</span><div><h3>DEADLINE E NUOVA COMMESSA</h3><p>La DEADLINE è il boss della COMMESSA. Lo scontro è diviso in <b>3 fasi casuali</b>: la fase cambia quando la DEADLINE scende sotto circa il 66% e il 33% degli HP. Ogni fase modifica i modificatori dello scontro e possiede una <b>abilità speciale</b> che si attiva una sola volta, al primo attacco di quella fase. Dopo averla sconfitta, il team viene completamente ripristinato, la COMMESSA aumenta di 1, la difficoltà aumenta e scegli <b>1 ricompensa su 6</b>: 3 oggetti o 3 Tool del Tier appena completato. La run riparte con una nuova mappa e TEMPO riportato a 8. Il Tier aumenta ogni 5 COMMESSE.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">18</span><div><h3>NUZLOCKE</h3><p>La modalità Nuzlocke permette di combinare regole speciali prima della run. Puoi limitare guarigione, reclutamento, sostituzioni e cambi, bloccare ZAINO o MAZZO, vietare azioni o categorie di Tool, ridurre Energia o mano, imporre percorsi casuali o ELITE obbligatoria e attivare PERMADEATH. Alcune combinazioni incompatibili vengono bloccate automaticamente. Quando una Nuzlocke è attiva, il pulsante <b>NUZLOCKE</b> nell’header mostra il numero di regole e permette di aprire in qualsiasi momento l’elenco completo con le relative descrizioni.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">19</span><div><h3>ESEMPIO DI TURNO</h3><p>Hai 3 Energia e 3 Tool in mano. Puoi spendere 1 Energia per CODICE, 2 per DEBUG, 1 per DIFESA o usare un Tool compatibile. Prima di FINE TURNO controlla il danno e lo Stress previsti dell'INTENZIONE nemica, oltre all'eventuale rischio di KO. Se non hai azioni disponibili, il turno può essere chiuso automaticamente.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">20</span><div><h3>PRIMA DI INIZIARE</h3><p>Leggi i 3 candidati e scegli il Developer iniziale in base a statistiche, passiva, vantaggi e debolezze. Il MAZZO iniziale è condiviso e parte dalla dotazione base; durante la COMMESSA costruiscilo con le ricompense. Controlla il Codex per matchup, Tool, oggetti e nemici. Gestisci HP, Stress e TEMPO e scegli il Developer iniziale di ogni combattimento in base alla situazione.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">21</span><div><h3>PUNTEGGIO E MOLTIPLICATORI</h3><p>La run accumula punti durante la progressione: <b>+300</b> per ogni tappa raggiunta, <b>+100</b> per una vittoria normale, <b>+250</b> per una vittoria ELITE e <b>+1000</b> per ogni COMMESSA completata, più il bonus finale legato allo stato dei Developer. I punti ottenuti vengono moltiplicati dal moltiplicatore attivo: <b>DIFFICOLTÀ × NUZLOCKE</b>. Il moltiplicatore Nuzlocke aumenta del 10% per ogni regola attiva, fino a x2.00. Il punteggio totale è visibile nell’header e viene registrato nella classifica.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">22</span><div><h3>CLASSIFICA E DETTAGLI DELLA RUN</h3><p>Dal menu puoi aprire la <b>CLASSIFICA</b> e vedere le run registrate online ordinate per punteggio. Ogni riga mostra nickname, <b>punteggio totale</b> e <b>causa della fine della run</b>. Cliccando una run puoi aprire i dettagli con COMMESSA, TAPPA, DIFFICOLTÀ, DATA, TEAM, MAZZO e regole NUZLOCKE utilizzate.</p></div></section>
    <section class="tutorial-section"><span class="tutorial-number">23</span><div><h3>SALVATAGGIO E MENU</h3><p>Durante una run il gioco salva automaticamente i progressi. Il pulsante <b>MENU</b> nell’header permette di tornare al menu senza perdere la partita. Dal menu puoi scegliere <b>CONTINUA COMMESSA</b> per riprendere il salvataggio oppure <b>NUOVA COMMESSA</b> per cancellare la sessione attuale e iniziare una nuova run. Quando una run termina, il salvataggio viene rimosso.</p></div></section>
  </div><div class="tutorial-actions"><button type="button" class="secondary" data-tutorial-prev>← INDIETRO</button><button type="button" class="primary" data-tutorial-next>AVANTI →</button></div></section></div></div></div>`;
}

function tutorialRefresh(index: number) {
  const overlay = document.querySelector<HTMLElement>('[data-feature-overlay="tutorial"]');
  if (!overlay) return;
  const sections = Array.from(overlay.querySelectorAll<HTMLElement>(".tutorial-section"));
  const current = Math.max(0, Math.min(index, sections.length - 1));
  overlay.dataset.tutorialIndex = String(current);
  sections.forEach((section, i) => section.classList.toggle("active", i === current));
  overlay.querySelectorAll<HTMLButtonElement>("[data-tutorial-step]").forEach((step, i) => step.classList.toggle("active", i === current));
  const content = overlay.querySelector<HTMLElement>(".tutorial-content");
  const progress = overlay.querySelector<HTMLElement>("[data-tutorial-progress]");
  const bar = overlay.querySelector<HTMLElement>("[data-tutorial-bar]");
  const prev = overlay.querySelector<HTMLButtonElement>("[data-tutorial-prev]");
  const next = overlay.querySelector<HTMLButtonElement>("[data-tutorial-next]");
  if (progress) progress.textContent = (current + 1) + " / " + sections.length;
  if (bar) bar.style.setProperty("--tutorial-progress", (((current + 1) / sections.length) * 100) + "%");
  if (prev) prev.disabled = current === 0;
  if (next) next.textContent = current === sections.length - 1 ? "FINE ✓" : "AVANTI →";
  sections.forEach((section, i) => {
    const number = section.querySelector<HTMLElement>(".tutorial-number");
    if (number) number.textContent = String(i + 1).padStart(2, "0");
  });
  if (content) content.scrollTop = 0;
}

const TUTORIAL_SEEN_KEY = "devlike-tutorial-seen-v1";

function openTutorial() {
  if (document.querySelector('[data-feature-overlay="tutorial"]')) return;
  const shell = document.querySelector<HTMLElement>(".game-shell");
  if (!shell) return;
  shell.insertAdjacentHTML("beforeend", tutorialMarkup());
  tutorialInit();
}

function markTutorialSeen() {
  localStorage.setItem(TUTORIAL_SEEN_KEY, "1");
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

export function setupFeatures(game: FeatureGame) {
  const originalStart = game.start.bind(game);
  game.start = () => { originalStart(); game.nuzlockeGraveyard = []; };

  document.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const open = target.closest<HTMLElement>("[data-feature-open]");
    const close = target.closest<HTMLElement>("[data-feature-close]");
    const overlay = target.closest<HTMLElement>("[data-feature-overlay]");
    if (open) {
      event.preventDefault();
      event.stopPropagation();
      const kind = open.dataset.featureOpen;
            if (kind === "tutorial") { openTutorial(); }
      return;
    }
    if (close) { event.preventDefault(); event.stopPropagation(); if (overlay?.dataset.featureOverlay === "tutorial") markTutorialSeen(); overlay?.remove(); return; }
    const tutorialStep = target.closest<HTMLButtonElement>("[data-tutorial-step]");
    if (tutorialStep) { event.preventDefault(); event.stopPropagation(); tutorialRefresh(Number(tutorialStep.dataset.tutorialStep ?? 0)); return; }
    if (target.closest("[data-tutorial-prev]")) { event.preventDefault(); event.stopPropagation(); tutorialRefresh(Number(overlay?.dataset.tutorialIndex ?? 0) - 1); return; }
    if (target.closest("[data-tutorial-next]")) { event.preventDefault(); event.stopPropagation(); const current = Number(overlay?.dataset.tutorialIndex ?? 0); if (current >= document.querySelectorAll("[data-feature-overlay=\"tutorial\"] .tutorial-section").length - 1) { markTutorialSeen(); overlay?.remove(); } else tutorialRefresh(current + 1); return; }
  }, true);

  setupCodex();

  if (localStorage.getItem(TUTORIAL_SEEN_KEY) !== "1") {
    window.setTimeout(() => openTutorial(), 0);
  }
}
