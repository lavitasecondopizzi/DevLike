import "./style.css";
import "./extra.css";
import "./extra2.css";
import { Game } from "./game/Game";
import { render } from "./ui/render";

const game = new Game();
const openEquipment = game.openEquipment.bind(game);
game.openEquipment = () => {
  if (game.screen !== "equipment") game.equipmentReturnScreen = game.screen;
  openEquipment();
};
render(game);
