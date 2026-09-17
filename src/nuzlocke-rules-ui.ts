import { Game } from "./game/Game";
import type { NuzlockeRule } from "./ui/nuzlocke";
import "./nuzlocke-rules-ui.css";

type NuzGame = Game & { nuzlockeActive?: boolean; nuzlockeRules?: NuzlockeRule[] };

const labels: Record<NuzlockeRule, string> = {
  permadeath:"PERMADEATH", noHealing:"NIENTE GUARIGIONE", noRecruit:"TEAM BLOCCATO", limitedRecruit:"UN SOLO RECLUTAMENTO",
  noBurnoutRecovery:"BURNOUT PERMANENTE", noStressRecovery:"NIENTE RECUPERO STRESS", noReplacement:"NO SOSTITUZIONI", firstPick:"FIRST PICK",
  noSwitch:"NO CAMBIO", noBackpack:"NO ZAINO", oneEquipment:"UN SOLO EQUIPMENT", noCardRemoval:"NO RIMOZIONE CARTE", deckLock:"DECK LOCK",
  noRest:"NO PAUSA", randomPath:"PERCORSO CASUALE", eliteMandatory:"ELITE OBBLIGATORIA", noCode:"NO CODICE", noDebug:"NO DEBUG", noDefense:"NO DIFESA",
  noBattleSwitch:"CAMBIO VIETATO IN COMBATTIMENTO", twoEnergy:"2 ENERGIA", smallHand:"MANO DA 2", oneTool:"UN SOLO TOOL", noDuplicates:"NO DOPPIONI",
  noCoffee:"NO CAFFÈ", noAI:"NO AI", noGit:"NO GIT", battleCardLock:"MONOUSO IN BATTAGLIA", consumableCards:"CARTE CONSUMABILI"
};

const groups: [string, NuzlockeRule[]][] = [
  ["SOPRAVVIVENZA", ["permadeath","noHealing","noBurnoutRecovery","noStressRecovery","noRest"]],
  ["TEAM", ["noRecruit","limitedRecruit","noReplacement","firstPick","noSwitch","noBattleSwitch"]],
  ["RISORSE", ["noBackpack","oneEquipment","noCardRemoval","deckLock","noDuplicates","consumableCards"]],
  ["MAPPA", ["randomPath","eliteMandatory"]],
  ["COMBATTIMENTO", ["noCode","noDebug","noDefense","twoEnergy","smallHand","oneTool","battleCardLock"]],
  ["CAOS DEVLIKE", ["noCoffee","noAI","noGit"]]
];

function game(): NuzGame | undefined {
  return (window as Window & { __devlikeGame?: NuzGame }).__devlikeGame;
}

function openRules() {
  const g = game();
  if (!g?.nuzlockeActive) return;
  document.querySelector(".nuzlocke-rules-overlay")?.remove();
  const active = new Set(g.nuzlockeRules ?? []);
  const content = groups.map(([name, rules]) => {
    const selected = rules.filter(rule => active.has(rule));
    if (!selected.length) return "";
    return `<section><h3>${name}</h3><div class="nuzlocke-active-grid">${selected.map(rule => `<div class="nuzlocke-active-rule"><b>${labels[rule]}</b></div>`).join("")}</div></section>`;
  }).join("");
  const overlay = document.createElement("div");
  overlay.className = "nuzlocke-rules-overlay";
  overlay.innerHTML = `<div class="nuzlocke-rules-window" role="dialog" aria-modal="true"><button type="button" class="nuzlocke-rules-close" data-close-nuz-rules>×</button><span class="nuzlocke-rules-kicker">MODALITÀ SPECIALE</span><h2>REGOLE NUZLOCKE</h2><p>${active.size} ${active.size === 1 ? "REGOLA ATTIVA" : "REGOLE ATTIVE"} IN QUESTA RUN</p>${content || "<div class=\"nuzlocke-no-rules\">NESSUNA REGOLA ATTIVA</div>"}</div>`;
  document.body.appendChild(overlay);
}

function ensureButton() {
  const g = game();
  const header = document.querySelector<HTMLElement>(".header-right");
  if (!header) return;
  const shouldShow = !!g?.nuzlockeActive && g.screen !== "menu" && g.screen !== "team" && g.screen !== "result";
  const existing = header.querySelector("[data-open-nuz-rules]");
  if (!shouldShow) { existing?.remove(); return; }
  if (existing) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "nuzlocke-rules-button";
  button.dataset.openNuzRules = "true";
  button.textContent = `NUZLOCKE · ${g?.nuzlockeRules?.length ?? 0} REGOLE`;
  button.addEventListener("click", openRules);
  header.prepend(button);
}

function install() {
  const observer = new MutationObserver(ensureButton);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const overlay = target.closest<HTMLElement>(".nuzlocke-rules-overlay");
    if (target.closest("[data-close-nuz-rules]") || target === overlay) overlay?.remove();
  });
  ensureButton();
}

install();
