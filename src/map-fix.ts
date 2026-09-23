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
    { title: "IMPREVISTO", description: "Il cliente ha detto 'non tocco niente'." },
    { title: "DECISIONE", description: "Una scelta rischiosa potrebbe salvare la commessa." }
  ],
  rest: [
    { title: "PAUSA", description: "Cinque minuti di pausa. Nessuno deve saperlo." },
    { title: "CAFFÈ", description: "Il compilatore non si lamenta del caffè." }
  ],
  fullRest: [
    { title: "RECUPERO TOTALE", description: "Ricarica completamente HP e Stress di tutto il team." }
  ],
  reward: [
    { title: "TOOL", description: "Hai trovato un nuovo Tool per il tuo mazzo." },
    { title: "GITHUB", description: "Hai trovato una repository che non è in fiamme." }
  ],
  item: [
    { title: "EQUIPAGGIAMENTO", description: "Hai trovato un oggetto utile. Puoi equipaggiarlo o conservarlo nello zaino." },
    { title: "SWAG", description: "Merchandising aziendale. Sorprendentemente utile." }
  ],
  recruit: [
    { title: "RECLUTAMENTO", description: "Un developer sta cercando disperatamente una commessa." },
    { title: "COLLOQUIO", description: "Hai trovato qualcuno che conosce il codice legacy." }
  ]
};

const MAP_STAGES: Exclude<MapNodeType, "boss">[][] = [
  ["battle", "event", "item"],
  ["battle", "reward", "recruit"],
  ["battle", "elite", "event"],
  ["rest", "reward", "item"],
  ["battle", "elite", "recruit"],
  ["battle", "elite", "reward"]
];

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

function connectAdjacentRows(nodes: MapNode[], fromRow: number, toRow: number) {
  const from = nodes.filter(node => node.row === fromRow);
  const to = nodes.filter(node => node.row === toRow);

  from.forEach(node => {
    const candidates = to
      .filter(target => Math.abs(target.col - node.col) <= 1)
      .sort(() => Math.random() - 0.5);

    // Each choice should normally lead to one or two meaningful alternatives.
    const count = candidates.length > 1 && Math.random() < 0.55 ? 2 : 1;
    node.next = candidates.slice(0, count).map(target => target.id);
  });

  // Guarantee that every node in the next stage can actually be reached.
  to.forEach(target => {
    if (from.some(source => source.next.includes(target.id))) return;

    const source = from
      .filter(node => Math.abs(node.col - target.col) <= 1)
      .sort((a, b) => Math.abs(a.col - target.col) - Math.abs(b.col - target.col))[0];

    if (source && !source.next.includes(target.id)) source.next.push(target.id);
  });
}

/**
 * Runtime map generator. The map has a fixed six-stage structure so every
 * stage has a clear gameplay purpose instead of three arbitrary node types.
 */
const GamePrototype = Game.prototype as unknown as {
  generateMap: () => void;
};

GamePrototype.generateMap = function(this: Game) {
  const nodes: MapNode[] = [{
    id: "start",
    row: 0,
    col: 1,
    type: "rest",
    title: "START",
    description: "La commessa parte. Per ora non è ancora esplosa.",
    next: [],
    visited: true,
    hiddenEncounter: false
  }];

  MAP_STAGES.forEach((stageTypes, index) => {
    const row = index + 1;
    const types = [...stageTypes].sort(() => Math.random() - 0.5);

    types.forEach((type, col) => {
      nodes.push(createNode(this, row, col, type));
    });

    if (row === 1) {
      const start = nodes.find(node => node.id === "start");
      const firstRow = nodes.filter(node => node.row === 1);
      if (start) start.next = firstRow.map(node => node.id);
    } else {
      connectAdjacentRows(nodes, row - 1, row);
    }
  });

  const finalRest: MapNode = {
    id: "rest-final",
    row: 7,
    col: 1,
    type: "rest",
    title: "PAUSA FINALE",
    description: "Ultima pausa prima della Deadline. Recupera il team e preparati allo scontro.",
    next: ["boss-final"],
    visited: false,
    hiddenEncounter: false
  };

  const finalBoss: MapNode = {
    id: "boss-final",
    row: 8,
    col: 1,
    type: "boss",
    title: "DEADLINE",
    description: "DOMANI È ONLINE. Naturalmente nessuno l'aveva detto prima.",
    next: [],
    visited: false,
    hiddenEncounter: false,
    enemyId: boss.id
  };

  nodes.push(finalRest, finalBoss);

  nodes.filter(node => node.row === 6).forEach(node => {
    node.next = [finalRest.id];
  });

  this.mapNodes = nodes;
  this.currentMapNodeId = "start";
  this.currentNode = 0;
};