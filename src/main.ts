import "./style.css";
import "./extra.css";
import "./extra2.css";
import { Game } from "./game/Game";
import { render } from "./ui/render";

const game = new Game();
render(game);
