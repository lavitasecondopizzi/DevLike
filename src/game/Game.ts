import { developers } from "../data/developers";
import { enemies, boss } from "../data/enemies";
import { rewardCards, startingDeck } from "../data/cards";
import type { Card, Developer, Enemy, MapNode, MapNodeType } from "../entities/types";
import { Combat } from "./Combat";

export type GameScreen = "menu" | "team" | "map" | "combat" | "reward" | "recruit" | "result";
type NormalNodeType = Exclude<MapNodeType, "boss">;

const NODE_TEMPLATES: Record<NormalNodeType, Array<{ title: string; description: string }>> = {
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
  reward: [
    { title: "TOOLBOX", description: "Un nuovo Tool entra nel tuo arsenale." },
    { title: "GITHUB", description: "Hai trovato una repository che non è in fiamme." }
  ],
  recruit: [
    { title: "RECLUTAMENTO", description: "Un developer sta cercando disperatamente un progetto." },
    { title: "COLLOQUIO", description: "Hai trovato qualcuno che conosce il codice legacy." }
  ]
};

export class Game {
  screen: GameScreen = "menu";
  team: Developer[] = [];
  deck: Card[] = [];
  combat: Combat | null = null;
  currentNode = 0;
  mapNodes: MapNode[] = [];
  currentMapNodeId: string | null = null;
  projectNumber = 1;
  reward: Card | null = null;
  startingCandidates: Developer[] = [];
  recruitCandidates: Developer[] = [];
  selectedStartingId: string | null = null;
  selectedRecruitIndex: number | null = null;
  recruitTargetIndex: number | null = null;
  message = "";

  start() {
    this.screen = "team";
    this.team = [];
    this.deck = [...startingDeck];
    this.currentNode = 0;
    this.mapNodes = [];
    this.currentMapNodeId = null;
    this.projectNumber = 1;
    this.reward = null;
    this.selectedStartingId = null;
    this.recruitCandidates = [];
    this.selectedRecruitIndex = null;
    this.recruitTargetIndex = null;
    this.startingCandidates = this.randomDevelopers(3);
    this.message = "Tre developer disponibili. Scegline UNO come protagonista.";
  }

  private randomDevelopers(count: number, excluded: string[] = []) {
    const pool = developers.filter(dev => !excluded.includes(dev.id));
    return [...pool].sort(() => Math.random() - 0.5).slice(0, count).map(dev => ({ ...dev }));
  }

  selectStartingDeveloper(index: number) {
    const candidate = this.startingCandidates[index];
    if (!candidate) return;
    this.selectedStartingId = candidate.id;
  }

  confirmStartingDeveloper() {
    if (!this.selectedStartingId) return;
    const candidate = this.startingCandidates.find(dev => dev.id === this.selectedStartingId);
    if (!candidate) return;
    this.team = [{ ...candidate, hp: candidate.maxHp, stress: 0 }];
    this.generateMap();
    this.screen = "map";
    this.message = `${candidate.name} è il developer principale. Scegli il percorso.`;
  }

  private randomTemplate(type: NormalNodeType) {
    const list = NODE_TEMPLATES[type];
    return list[Math.floor(Math.random() * list.length)];
  }

  private randomType(row: number): NormalNodeType {
    const roll = Math.random();
    if (row === 1) return roll < 0.55 ? "battle" : roll < 0.75 ? "recruit" : "event";
    if (row >= 5) return roll < 0.38 ? "elite" : roll < 0.55 ? "recruit" : roll < 0.7 ? "battle" : "reward";
    if (roll < 0.38) return "battle";
    if (roll < 0.54) return "event";
    if (roll < 0.67) return "rest";
    if (roll < 0.84) return "reward";
    return "recruit";
  }

  private generateMap() {
    const finalRow = 7;
    const nodes: MapNode[] = [{
      id: "start", row: 0, col: 1, type: "rest", title: "START",
      description: "Il progetto parte. Per ora non è ancora esploso.", next: [], visited: true
    }];

    for (let row = 1; row <= finalRow; row++) {
      if (row === finalRow) {
        nodes.push({ id: "boss", row, col: 1, type: "boss", title: "DEADLINE",
          description: "DOMANI È ONLINE. Naturalmente nessuno l'aveva detto prima.", next: [], visited: false });
      } else {
        for (let col = 0; col < 3; col++) {
          const type = this.randomType(row);
          const template = this.randomTemplate(type);
          nodes.push({ id: `r${row}c${col}`, row, col, type, title: template.title,
            description: template.description, next: [], visited: false });
        }
      }
    }

    const row = (n: number) => nodes.filter(node => node.row === n);
    const start = row(0)[0];
    start.next = row(1).sort(() => Math.random() - 0.5).slice(0, 2).map(n => n.id);

    for (let r = 1; r < finalRow; r++) {
      const from = row(r);
      const to = row(r + 1);
      from.forEach(node => {
        const nearby = to.filter(target => Math.abs(target.col - node.col) <= 1);
        const pool = nearby.length ? nearby : to;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        shuffled.slice(0, Math.random() < 0.6 ? 1 : 2).forEach(target => node.next.push(target.id));
      });
      to.forEach(target => {
        if (!nodes.some(node => node.next.includes(target.id))) {
          const source = from[Math.floor(Math.random() * from.length)];
          source.next.push(target.id);
        }
      });
    }

    row(finalRow - 1).forEach(node => { node.next = ["boss"]; });
    this.mapNodes = nodes;
    this.currentMapNodeId = "start";
    this.currentNode = 0;
  }

  get currentMapNode(): MapNode | null {
    return this.mapNodes.find(node => node.id === this.currentMapNodeId) ?? null;
  }

  get availableMapNodes(): MapNode[] {
    const current = this.currentMapNode;
    if (!current) return [];
    return current.next.map(id => this.mapNodes.find(node => node.id === id))
      .filter((node): node is MapNode => Boolean(node) && !node.visited);
  }

  selectMapNode(id: string) {
    const node = this.mapNodes.find(candidate => candidate.id === id);
    if (!node || node.visited || !this.availableMapNodes.some(candidate => candidate.id === id)) return;
    this.currentMapNodeId = id;
    this.currentNode = node.row;
    node.visited = true;

    if (node.type === "boss") return this.enterBoss();
    if (node.type === "battle" || node.type === "elite") {
      this.startBattle(this.randomEnemy(node.type === "elite"));
      return;
    }
    if (node.type === "reward") return this.generateReward();
    if (node.type === "recruit") return this.openRecruitment();

    if (node.type === "rest") {
      this.team.forEach(dev => {
        dev.hp = Math.min(dev.maxHp, dev.hp + 14);
        dev.stress = Math.max(0, dev.stress - 10);
      });
      this.message = "PAUSA RIUSCITA: +14 HP e -10 STRESS al team.";
      return;
    }

    if (Math.random() < 0.5) {
      this.team.forEach(dev => dev.stress = Math.max(0, dev.stress - 8));
      this.message = "EVENTO: hai trovato una soluzione su Stack Overflow. -8 STRESS.";
    } else {
      this.team.forEach(dev => dev.stress = Math.min(100, dev.stress + 5));
      this.message = "EVENTO: 'facciamo una call veloce'. +5 STRESS.";
    }
  }

  private openRecruitment() {
    this.recruitCandidates = this.randomDevelopers(3, this.team.map(dev => dev.id));
    this.selectedRecruitIndex = null;
    this.recruitTargetIndex = this.team.length >= 3 ? null : 0;
    this.screen = "recruit";
    this.message = this.team.length >= 3
      ? "Hai già 3 developer. Scegli un candidato e poi chi sostituire."
      : "Scegli un nuovo developer da aggiungere al team.";
  }

  selectRecruitCandidate(index: number) {
    if (!this.recruitCandidates[index]) return;
    this.selectedRecruitIndex = index;
    if (this.team.length < 3) this.confirmRecruitment();
  }

  selectRecruitTarget(index: number) {
    if (this.team.length < 3 || !this.team[index]) return;
    this.recruitTargetIndex = index;
  }

  confirmRecruitment() {
    if (this.selectedRecruitIndex === null) return;
    const candidate = this.recruitCandidates[this.selectedRecruitIndex];
    if (!candidate) return;

    const fresh = { ...candidate, hp: candidate.maxHp, stress: 0 };
    if (this.team.length < 3) {
      this.team.push(fresh);
    } else {
      if (this.recruitTargetIndex === null) return;
      this.team[this.recruitTargetIndex] = fresh;
    }

    this.selectedRecruitIndex = null;
    this.recruitTargetIndex = null;
    this.recruitCandidates = [];
    this.screen = "map";
    this.message = `${candidate.name} entra nel team. Scegli il prossimo nodo.`;
  }

  private randomEnemy(elite = false): Enemy {
    const pool = elite ? enemies.filter(enemy => enemy.id === "client" || enemy.id === "legacy") : enemies;
    const source = pool[Math.floor(Math.random() * pool.length)];
    return { ...source, intent: { ...source.intent } };
  }

  enterRandomBattle() { this.startBattle(this.randomEnemy()); }
  enterBoss() { this.startBattle({ ...boss, intent: { ...boss.intent } }); }
  startBattle(enemy: Enemy) {
    this.combat = new Combat(this.team, enemy, this.deck);
    this.screen = "combat";
  }

  chooseReward(_cardIndex: number) {
    if (!this.reward) return;
    this.deck.push({ ...this.reward });
    this.reward = null;
    this.screen = "map";
    this.message = "Tool acquisito. Scegli il prossimo nodo.";
  }

  generateReward() {
    this.reward = { ...rewardCards[Math.floor(Math.random() * rewardCards.length)] };
    this.screen = "reward";
  }

  updateTeamFromCombat() {
    if (this.combat) this.team = this.combat.team;
  }

  onCombatFinished() {
    this.updateTeamFromCombat();
    if (this.combat?.result === "victory") {
      if (this.combat.enemy.id === "deadline") {
        this.screen = "result";
        this.message = "DEPLOY RIUSCITO.";
      } else this.generateReward();
    } else if (this.combat?.result === "defeat") {
      this.screen = "result";
      this.message = "PROJECT FAILED.";
    }
  }

  restart() { this.start(); }
}
