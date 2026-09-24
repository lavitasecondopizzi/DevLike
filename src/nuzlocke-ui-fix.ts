import type { Game } from "./game/Game";
import type { NuzlockeRule } from "./ui/nuzlocke";

type NuzGame = Game & {
  nuzlockeActive?: boolean;
  nuzlockeRules?: NuzlockeRule[];
  nuzlockeRecruitCount?: number;
};

function getGame(): NuzGame | undefined {
  return (window as Window & { __devlikeGame?: NuzGame }).__devlikeGame;
}

function has(rule: NuzlockeRule): boolean {
  const game = getGame();
  return !!game?.nuzlockeActive && !!game.nuzlockeRules?.includes(rule);
}

function disable(el: HTMLButtonElement, reason: string) {
  el.disabled = true;
  el.classList.add("nuzlocke-disabled");
  el.title = reason;
  el.setAttribute("aria-disabled", "true");
}

function refresh() {
  const game = getGame();
  if (!game?.nuzlockeActive) return;

  document.querySelectorAll<HTMLButtonElement>(".combat-actions [data-action]").forEach(button => {
    const action = button.dataset.action;
    if (action === "code" && has("noCode")) disable(button, "NUZLOCKE: CODICE VIETATO");
    if (action === "debug" && has("noDebug")) disable(button, "NUZLOCKE: DEBUG VIETATO");
    if (action === "defend" && has("noDefense")) disable(button, "NUZLOCKE: DIFESA VIETATA");
  });

  document.querySelectorAll<HTMLButtonElement>(".bench-dev[data-switch]").forEach(button => {
    if (has("noSwitch") || has("noBattleSwitch")) disable(button, "NUZLOCKE: CAMBIO VIETATO");
  });

  document.querySelectorAll<HTMLButtonElement>("[data-map-node]").forEach(button => {
    const node = game.mapNodes.find(node => node.id === button.dataset.mapNode);
    if (!node) return;
    if (node.type === "rest" && has("noRest")) {
      disable(button, "NUZLOCKE: PAUSA/RECUPERO VIETATI");
    }
    if (node.type === "recruit") {
      if (has("noRecruit")) disable(button, "NUZLOCKE: RECLUTAMENTO VIETATO");
      if (has("limitedRecruit") && (game.nuzlockeRecruitCount ?? 0) >= 1) disable(button, "NUZLOCKE: RECLUTAMENTO GIÀ UTILIZZATO");
    }
  });

  if (has("eliteMandatory")) {
    const eliteAvailable = game.availableMapNodes.some(node => node.type === "elite");
    if (eliteAvailable) {
      document.querySelectorAll<HTMLButtonElement>("[data-map-node]").forEach(button => {
        const node = game.mapNodes.find(item => item.id === button.dataset.mapNode);
        if (node && node.type !== "elite" && game.availableMapNodes.some(item => item.id === node.id)) {
          disable(button, "NUZLOCKE: ELITE OBBLIGATORIA");
        }
      });
    }
  }

  if (has("noBackpack")) {
    document.querySelectorAll<HTMLButtonElement>(".backpack-item, .bag-drop, [data-action=\"store-item\"]").forEach(button => {
      disable(button, "NUZLOCKE: ZAINO VIETATO");
    });
  }

  if (has("noReplacement")) {
    document.querySelectorAll<HTMLButtonElement>(".replace-target, [data-action=\"confirm-recruit\"]").forEach(button => {
      disable(button, "NUZLOCKE: SOSTITUZIONE VIETATA");
    });
  }

  if (has("firstPick") && game.team.length >= 3) {
    const firstPick = document.querySelector<HTMLButtonElement>('.replace-target[data-target="0"]');
    if (firstPick) disable(firstPick, "NUZLOCKE: FIRST PICK NON SOSTITUIBILE");
  }

  if (has("oneEquipment")) {
    document.querySelectorAll<HTMLButtonElement>("[data-item-target]").forEach(button => {
      const index = Number(button.dataset.itemTarget);
      if (Number.isInteger(index) && game.team[index]?.items.length >= 1) {
        disable(button, "NUZLOCKE: UN SOLO EQUIPMENT PER DEVELOPER");
      }
    });
  }

  if (has("noCoffee") || has("noAI") || has("noGit")) {
    document.querySelectorAll<HTMLButtonElement>(".hand [data-card]").forEach(button => {
      const text = button.textContent?.toUpperCase() ?? "";
      if (has("noCoffee") && text.includes("CAFFÈ")) disable(button, "NUZLOCKE: CAFFÈ VIETATO");
      else if (has("noAI") && /(AI|CHATGPT)/.test(text)) disable(button, "NUZLOCKE: AI VIETATA");
      else if (has("noGit") && /GIT/.test(text)) disable(button, "NUZLOCKE: GIT VIETATO");
    });
  }
}

export function setupNuzlockeUi() {
  const observer = new MutationObserver(() => refresh());
  observer.observe(document.body, { childList: true, subtree: true });
  refresh();
}

setupNuzlockeUi();
