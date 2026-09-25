import "./style.css";
import "./extra.css";
import "./extra2.css";
import "./extra3.css";
import "./codex-fix.css";
import "./nuzlocke.css";
import "./map-ui-fix.css";
import "./map-visual-fix.css";
import "./deck-fix.css";
import "./card-view.css";
import "./team-tools-fix.css";
import "./readability.css";
import "./nuzlocke-rules-ui";
import "./nuzlocke-ui-fix.css";
import "./map-fix";
import "./map-ui-fix";
import "./balance-fix";
import { Game } from "./game/Game";
import { starterDeckForDeveloper } from "./data/cards";
import { render } from "./ui/render";
import { setupFeatures, type FeatureGame } from "./ui/features";
import { setupNuzlocke, type NuzlockeRule } from "./ui/nuzlocke";
import { setupDeckFix } from "./deck-fix";
import { setupTeamToolsFix } from "./team-tools-fix";
import { setupCardView } from "./card-view";

type NuzGame = Game & { nuzlockeActive:boolean; nuzlockeGraveyard:string[]; nuzlockeRules:NuzlockeRule[]; nuzlockeRecruitCount:number };
const game = new Game() as NuzGame & FeatureGame;
(window as Window & { __devlikeGame?: Game }).__devlikeGame = game;
game.nuzlockeActive = false;
game.nuzlockeGraveyard = [];
game.nuzlockeRules = ["permadeath"];
game.nuzlockeRecruitCount = 0;

const openEquipment = game.openEquipment.bind(game);
game.openEquipment = () => { if (game.screen !== "equipment") game.equipmentReturnScreen = game.screen; openEquipment(); };
const confirmStartingDeveloper = game.confirmStartingDeveloper.bind(game);
game.confirmStartingDeveloper = () => { confirmStartingDeveloper(); const active = game.team[0]; if (active) { game.deck = starterDeckForDeveloper(active.classId); game.cardCollection = game.deck.map(card => ({...card})); } };

function addStarterDeckPreview(){const grid=document.querySelector<HTMLElement>(".developer-choice-grid");if(!grid||document.querySelector(".starter-deck-preview"))return;const selected=grid.querySelector<HTMLElement>(".developer-choice.selected");const id=selected?.dataset.dev;if(!id)return;const cards=starterDeckForDeveloper(id);const preview=document.createElement("section");preview.className="starter-deck-preview";preview.innerHTML=`<div class="starter-deck-heading"><div><h3>PRIMO MAZZO · 5 CARTE</h3><p>Questo è il mazzo iniziale legato al Developer selezionato.</p></div><span>5 TOOL</span></div><div class="starter-deck-cards">${cards.map(card=>`<article class="starter-card"><div class="starter-card-top"><b>${card.name}</b><strong>${card.cost} ⚡</strong></div><p>${card.description}</p></article>`).join("")}</div>`;grid.insertAdjacentElement("afterend",preview);}

document.addEventListener("click",event=>{const target=event.target as HTMLElement;if(target.closest('[data-action="start"]'))game.nuzlockeActive=false;if(game.screen==="team")requestAnimationFrame(addStarterDeckPreview);});
setupFeatures(game);
setupNuzlocke(game);
setupDeckFix(game);
setupTeamToolsFix(game);
setupCardView();


render(game);

let lastScreen = game.screen;
setInterval(() => {
  if (game.screen === lastScreen) return;
  lastScreen = game.screen;
  render(game);
}, 50);
