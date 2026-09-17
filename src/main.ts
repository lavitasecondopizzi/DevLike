import "./style.css";
import "./extra.css";
import "./extra2.css";
import "./extra3.css";
import "./codex-fix.css";
import "./nuzlocke.css";
import { Game } from "./game/Game";
import { starterDeckForDeveloper } from "./data/cards";
import { render } from "./ui/render";
import { setupFeatures, type FeatureGame } from "./ui/features";
import { setupNuzlocke, type NuzGame } from "./ui/nuzlocke";
import { setupCodexFix } from "./codex-fix";

const game = new Game() as NuzGame & FeatureGame;
game.nuzlockeActive = false;
game.nuzlockeGraveyard = [];
game.nuzlockeRules = ["permadeath"];
game.nuzlockeRecruitCount = 0;
game.nuzlockeConsumedCards = [];

const openEquipment = game.openEquipment.bind(game);
game.openEquipment = () => { if (game.screen !== "equipment") game.equipmentReturnScreen = game.screen; openEquipment(); };
const confirmStartingDeveloper = game.confirmStartingDeveloper.bind(game);
game.confirmStartingDeveloper = () => { confirmStartingDeveloper(); const active = game.team[0]; if (active) game.deck = starterDeckForDeveloper(active.classId); };

function addStarterDeckPreview(){const grid=document.querySelector<HTMLElement>(".developer-choice-grid");if(!grid||document.querySelector(".starter-deck-preview"))return;const selected=grid.querySelector<HTMLElement>(".developer-choice.selected");const id=selected?.dataset.dev;if(!id)return;const cards=starterDeckForDeveloper(id);const preview=document.createElement("section");preview.className="starter-deck-preview";preview.innerHTML=`<div class="starter-deck-heading"><div><h3>PRIMO MAZZO · 5 CARTE</h3><p>Questo è il mazzo iniziale legato al Developer selezionato.</p></div><span>5 TOOL</span></div><div class="starter-deck-cards">${cards.map(card=>`<article class="starter-card"><div class="starter-card-top"><b>${card.name}</b><strong>${card.cost} ⚡</strong></div><p>${card.description}</p></article>`).join("")}</div>`;grid.insertAdjacentElement("afterend",preview);}

document.addEventListener("click",event=>{const target=event.target as HTMLElement;if(target.closest('[data-action="start"]'))game.nuzlockeActive=false;if(game.screen==="team")requestAnimationFrame(addStarterDeckPreview);});
setupCodexFix();
setupFeatures(game);
setupNuzlocke(game);

const originalStartBattle = game.startBattle.bind(game);
game.startBattle = (enemy) => {
  originalStartBattle(enemy);
  if (!game.nuzlockeActive || !game.combat) return;
  game.combat.nuzlockeRules = [...game.nuzlockeRules];
  if (game.nuzlockeRules.includes("twoEnergy")) game.combat.energy = 2;
  if (game.nuzlockeRules.includes("smallHand")) {
    const excess = Math.max(0, game.combat.hand.length - 2);
    if (excess) game.combat.discardPile.push(...game.combat.hand.splice(2, excess));
  }
};

render(game);
