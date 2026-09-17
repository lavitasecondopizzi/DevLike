import "./style.css";
import "./extra.css";
import "./extra2.css";
import "./extra3.css";
import { Game } from "./game/Game";
import { starterDeckForDeveloper } from "./data/cards";
import { render } from "./ui/render";
import { setupFeatures, type FeatureGame } from "./ui/features";

const game = new Game() as FeatureGame;
game.nuzlockeActive = false;
game.nuzlockeGraveyard = [];

const openEquipment = game.openEquipment.bind(game);
game.openEquipment = () => {
  if (game.screen !== "equipment") game.equipmentReturnScreen = game.screen;
  openEquipment();
};
const confirmStartingDeveloper = game.confirmStartingDeveloper.bind(game);
game.confirmStartingDeveloper = () => {
  confirmStartingDeveloper();
  const active = game.team[0];
  if (active) game.deck = starterDeckForDeveloper(active.id);
};

function addStarterDeckPreview() {
  const grid = document.querySelector<HTMLElement>(".developer-choice-grid");
  if (!grid || document.querySelector(".starter-deck-preview")) return;
  const selected = grid.querySelector<HTMLElement>(".developer-choice.selected");
  const id = selected?.dataset.dev;
  if (!id) return;
  const cards = starterDeckForDeveloper(id);
  const preview = document.createElement("section");
  preview.className = "starter-deck-preview";
  preview.innerHTML = `<div class="starter-deck-heading"><div><h3>PRIMO MAZZO · 5 CARTE</h3><p>Questo è il mazzo iniziale legato al Developer selezionato.</p></div><span>5 TOOL</span></div><div class="starter-deck-cards">${cards.map(card => `<article class="starter-card"><div class="starter-card-top"><b>${card.name}</b><strong>${card.cost} ⚡</strong></div><p>${card.description}</p></article>`).join("")}</div>`;
  grid.insertAdjacentElement("afterend", preview);
}

document.addEventListener("click", event => {
  const target = event.target as HTMLElement;
  if (target.closest('[data-action="start"]')) game.nuzlockeActive = false;
  if (game.screen === "team") requestAnimationFrame(addStarterDeckPreview);
});

setupFeatures(game);
render(game);
