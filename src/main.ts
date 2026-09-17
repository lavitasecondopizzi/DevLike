import "./style.css";
import "./extra.css";
import "./extra2.css";
import { Game } from "./game/Game";
import { starterDeckForDeveloper } from "./data/cards";
import { render } from "./ui/render";

const game = new Game();
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
render(game);
