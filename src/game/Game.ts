import { developers } from "../data/developers";
import { enemies, boss } from "../data/enemies";
import { rewardCards, startingDeck } from "../data/cards";
import type { Card, Developer, Enemy } from "../entities/types";
import { Combat } from "./Combat";

export type GameScreen = "menu" | "team" | "map" | "combat" | "reward" | "result";

export class Game {
  screen: GameScreen = "menu";
  team: Developer[] = [];
  deck: Card[] = [];
  combat: Combat | null = null;
  currentNode = 0;
  normalBattles = 0;
  maxNormalBattles = 3;
  reward: Card | null = null;
  selectedDeveloper = 0;
  message = "";

  start() {
    this.screen = "team";
    this.team = [];
    this.deck = [...startingDeck];
    this.normalBattles = 0;
    this.currentNode = 0;
    this.reward = null;
    this.message = "Scegli fino a 3 developer.";
  }

  toggleDeveloper(index: number) {
    const existing = this.team.findIndex(d => d.id === developers[index].id);
    if (existing >= 0) {
      this.team.splice(existing, 1);
    } else if (this.team.length < 3) {
      this.team.push({ ...developers[index] });
    }
  }

  confirmTeam() {
    if (this.team.length === 0) return;
    this.screen = "map";
    this.message = "Progetto avviato.";
  }

  enterRandomBattle() {
    const source = enemies[Math.floor(Math.random() * enemies.length)];
    this.startBattle(source);
  }

  enterBoss() {
    this.startBattle(boss);
  }

  startBattle(enemy: Enemy) {
    this.combat = new Combat(this.team, enemy, this.deck);
    this.screen = "combat";
  }

  chooseReward(cardIndex: number) {
    if (!this.reward) return;
    this.deck.push({ ...this.reward });
    this.reward = null;
    this.normalBattles++;
    this.screen = "map";
  }

  generateReward() {
    this.reward = rewardCards[Math.floor(Math.random() * rewardCards.length)];
    this.screen = "reward";
  }

  updateTeamFromCombat() {
    if (!this.combat) return;
    this.team = this.combat.team;
  }

  onCombatFinished() {
    this.updateTeamFromCombat();
    if (this.combat?.result === "victory") {
      if (this.combat.enemy.id === "deadline") {
        this.screen = "result";
        this.message = "DEPLOY RIUSCITO.";
      } else {
        this.generateReward();
      }
    } else if (this.combat?.result === "defeat") {
      this.screen = "result";
      this.message = "PROJECT FAILED.";
    }
  }

  restart() {
    this.start();
  }
}
