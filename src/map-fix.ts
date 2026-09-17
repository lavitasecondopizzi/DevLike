import { enemies, boss } from "./data/enemies";
import type { Enemy, MapNode, MapNodeType } from "./entities/types";
import { Game } from "./game/Game";

const NODE_TEMPLATES: Record<Exclude<MapNodeType, "boss">, Array<{ title: string; description: string }>> = {
  battle: [
    { title: "BUG", description: "Qualcosa funziona. Quindi sicuramente c'è un bug." },
    { title: "MEETING", description: "Poteva essere una mail." },
    { title: "LEGACY", description: "Non sai chi l'ha scritto. Non sai perché esiste." }
  ],
  elite: [
    { title: "CLIENTE", description: "Una piccola modifica. Solo 47 requisiti nuovi." },
    { title: "PROD", description: "È venerdì pomeriggio. La produzione ha altri piani." }
  ],
  event: [
    { title: "EVENTO", description: "Una decisione discutibile potrebbe salvare il progetto." },
    { title: "IMPREVISTO", description: "Il cliente ha detto 'non tocco niente'." }
  ],
  rest: [
    { title: "PAUSA", description: "Cinque minuti di pausa. Nessuno deve saperlo." },
    { title: "CAFFÈ", description: "Il compilatore non si lamenta del caffè." }
  ],
  fullRest: [{ title: "RECUPERO TOTALE", description: "Ricarica completamente HP e Stress di tutto il team." }],
  reward: [
    { title: "TOOLBOX", description: "Un nuovo Tool entra nel tuo arsenale." },
    { title: "GITHUB", description: "Hai trovato una repository che non è in fiamme." }
  ],
  item: [
    { title: "EQUIPMENT", description: "Hai trovato un oggetto utile. Puoi equipaggiarlo o conservarlo nello zaino." },
    { title: "SWAG", description: "Merchandising aziendale. Sorprendentemente utile." }
  ],
  recruit: [
    { title: "RECLUTAMENTO", description: "Un developer sta cercando disperatamente un progetto." },
    { title: "COLLOQUIO", description: "Hai trovato qualcuno che conosce il codice legacy." }
  ]
};

function randomTemplate(type: Exclude<MapNodeType, "boss">) {
  const list = NODE_TEMPLATES[type];
  return list[Math.floor(Math.random() * list.length)];
}

function enemyForNode(type: "battle" | "elite"): Enemy {
  const pool = type === "elite"
    ? enemies.filter(enemy => enemy.typeId === "client" || enemy.typeId === "legacy")
    : enemies;
  return pool[Math.floor(Math.random() * pool.length)] ?? enemies[0];
}

function createNode(game: Game, row: number, col: number, type: Exclude<MapNodeType, "boss">): MapNode {
  const template = randomTemplate(type);
  const battle = type === "battle" || type === "elite";
  const source = battle ? enemyForNode(type) : undefined;
  const hidden = battle ? Math.random() < 0.38 : false;

  return {
    id: `r${row}c${col}`,
    row,
    col,
    type,
    title: source && !hidden ? `${source.type.toUpperCase()} · ${source.name}` : template.title,
    description: source && !hidden
      ? source.description
      : hidden
        ? "L'incontro è sconosciuto. Potrebbe essere un problema grosso."
        : template.description,
    next: [],
    visited: false,
    hiddenEncounter: hidden,
    ...(source ? { enemyId: source.id } : {})
  };
}

/**
 * Replaces the map generator at runtime without intersecting Game's private
 * generateMap declaration at compile time.
 */
const GamePrototype = Game.prototype as unknown as {
  generateMap: () => void;
};

GamePrototype.generateMap = function(this: Game) {
  const finalRow = 7;
  const nodes: MapNode[] = [{
    id: "start",
    row: 0,
    col: 1,
    type: "rest",
    title: "START",
    description: "Il progetto parte. Per ora non è ancora esploso.",
    next: [],
    visited: true,
    hiddenEncounter: false
  }];

  const rowNodes = (row: number) => nodes.filter(node => node.row === row);

  const firstRowTypes: Exclude<MapNodeType, "boss">[] = ["battle", "recruit", "item"];
  firstRowTypes.forEach((type, col) => nodes.push(createNode(this, 1, col, type)));

  for (let row = 2; row < finalRow; row++) {
    const previous = rowNodes(row - 1);
    const reachableCols = [...new Set(
      previous.flatMap(node => [node.col - 1, node.col, node.col + 1].filter(col => col >= 0 && col <= 2))
    )].sort(() => Math.random() - 0.5);

    const count = Math.min(1 + Math.floor(Math.random() * 3), reachableCols.length);
    const selectedCols = reachableCols.slice(0, count).sort((a, b) => a - b);

    selectedCols.forEach(col => {
      const typePool: Exclude<MapNodeType, "boss">[] = ["battle", "event", "rest", "reward", "item", "recruit"];
      if (row === 4) typePool.push("elite");
      const type = typePool[Math.floor(Math.random() * typePool.length)];
      nodes.push(createNode(this, row, col, type));
    });
  }

  nodes.push({
    id: "boss",
    row: finalRow,
    col: 1,
    type: "boss",
    title: "DEADLINE",
    description: "DOMANI È ONLINE. Naturalmente nessuno l'aveva detto prima.",
    next: [],
    visited: false,
    hiddenEncounter: false,
    enemyId: boss.id
  });

  for (let row = 0; row < finalRow; row++) {
    const from = rowNodes(row);
    const to = rowNodes(row + 1);

    from.forEach(node => {
      node.next = to
        .filter(target => Math.abs(target.col - node.col) <= 1)
        .map(target => target.id);
    });
  }

  this.mapNodes = nodes;
  this.currentMapNodeId = "start";
  this.currentNode = 0;
};
