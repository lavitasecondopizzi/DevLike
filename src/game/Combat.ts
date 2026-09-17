import type { BattleResult, Card, Developer, Enemy } from "../entities/types";

export class Combat {
  team: Developer[];
  activeIndex = 0;
  enemy: Enemy;
  energy = 3;
  block = 0;
  codeBoost = 0;
  drawPile: Card[];
  discardPile: Card[] = [];
  hand: Card[] = [];
  result: BattleResult = "ongoing";
  log: string[] = [];

  constructor(team: Developer[], enemy: Enemy, deck: Card[]) {
    this.team = team.map(d => ({ ...d, items: d.items.map(item => ({ ...item })) }));
    this.enemy = { ...enemy, intent: { ...enemy.intent } };
    this.drawPile = this.shuffle([...deck]);
    this.log.push(`${this.active.name} entra in campo contro ${this.enemy.name}.`);
    this.startTurn();
  }

  get active(): Developer {
    return this.team[this.activeIndex];
  }

  get itemCodeBonus(): number {
    return this.active.items.reduce((total, item) => total + item.codeBonus, 0);
  }

  get itemDebugBonus(): number {
    return this.active.items.reduce((total, item) => total + item.debugBonus, 0);
  }

  startTurn() {
    if (this.result !== "ongoing") return;
    this.energy = 3;
    this.block = 0;
    this.codeBoost = 0;
    this.drawCards(3);
    this.log.push(`Turno ${this.turnNumber}. ${this.active.name} ha 3 Energia.`);
  }

  get turnNumber(): number {
    return Math.max(1, this.discardPile.length + this.hand.length > 0 ? Math.floor((this.discardPile.length + this.hand.length) / 3) : 1);
  }

  drawCards(count: number) {
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawPile = this.shuffle(this.discardPile.splice(0));
      }
      const card = this.drawPile.pop();
      if (card) this.hand.push(card);
    }
  }

  playCard(index: number): boolean {
    const card = this.hand[index];
    if (!card || card.cost > this.energy || this.result !== "ongoing") return false;

    this.energy -= card.cost;
    this.hand.splice(index, 1);
    this.discardPile.push(card);

    switch (card.effect.type) {
      case "damage":
        this.dealDamage(Math.round(card.effect.amount * (1 + this.codeBoost / 100)));
        this.log.push(`${card.name}: ${card.effect.amount} danni.`);
        break;
      case "heal":
        this.active.hp = Math.min(this.active.maxHp, this.active.hp + card.effect.amount);
        this.log.push(`${card.name}: +${card.effect.amount} HP.`);
        break;
      case "removeStress":
        this.active.stress = Math.max(0, this.active.stress - card.effect.amount);
        this.log.push(`${card.name}: -${card.effect.amount} Stress.`);
        break;
      case "block":
        this.block += card.effect.amount;
        this.log.push(`${card.name}: +${card.effect.amount} Difesa.`);
        break;
      case "codeBoost":
        this.codeBoost += card.effect.amount;
        this.active.stress = Math.min(100, this.active.stress + 10);
        this.log.push(`${card.name}: +${card.effect.amount}% Codice, +10 Stress.`);
        break;
    }

    this.checkVictory();
    return true;
  }

  basicAction(action: "code" | "debug" | "defend"): boolean {
    if (this.energy <= 0 || this.result !== "ongoing") return false;

    if (action === "code") {
      this.energy -= 1;
      let damage = this.active.code + this.itemCodeBonus;
      if (this.active.id === "senior") damage += 2;
      damage = Math.round(damage * (1 + this.codeBoost / 100));
      this.dealDamage(damage);
      this.active.stress = Math.min(100, this.active.stress + 3);
      this.log.push(`CODA: ${damage} danni, +3 Stress.`);
    }

    if (action === "debug") {
      if (this.energy < 2) return false;
      this.energy -= 2;
      let debug = this.active.debug + this.itemDebugBonus;
      if (this.active.hp < this.active.maxHp * 0.5 && this.active.id === "junior") debug += 2;
      const damage = Math.round(debug * 1.5 * (1 + this.codeBoost / 100));
      this.dealDamage(damage);
      this.active.stress = Math.min(100, this.active.stress + 5);
      this.log.push(`DEBUG: ${damage} danni, +5 Stress.`);
    }

    if (action === "defend") {
      this.energy -= 1;
      this.block += this.active.id === "devops" ? 15 : 10;
      this.active.stress = Math.max(0, this.active.stress - 3);
      this.log.push(`DIFESA: ${this.block} danni bloccati, -3 Stress.`);
    }

    this.checkBurnout();
    this.checkVictory();
    return true;
  }

  switchDeveloper(index: number): boolean {
    if (this.energy < 1 || index === this.activeIndex || !this.team[index] || this.team[index].hp <= 0 || this.team[index].stress >= 100) return false;
    this.energy -= 1;
    this.activeIndex = index;
    this.log.push(`Cambio: entra ${this.active.name}.`);
    return true;
  }

  endTurn() {
    if (this.result !== "ongoing") return;
    this.discardPile.push(...this.hand.splice(0));
    this.enemyAttack();
    this.checkBurnout();
    if (this.result === "ongoing") this.startTurn();
  }

  private enemyAttack() {
    const raw = this.enemy.intent.damage;
    const damage = Math.max(0, raw - this.block);
    this.block = Math.max(0, this.block - raw);
    this.active.hp = Math.max(0, this.active.hp - damage);
    this.active.stress = Math.min(100, this.active.stress + this.enemy.intent.stress);
    this.log.push(`${this.enemy.name}: ${raw} danni. Subiti ${damage}. +${this.enemy.intent.stress} Stress.`);
  }

  private dealDamage(amount: number) {
    this.enemy.hp = Math.max(0, this.enemy.hp - amount);
  }

  private checkVictory() {
    if (this.enemy.hp <= 0) {
      this.result = "victory";
      this.log.push(`${this.enemy.name} è stato sconfitto.`);
    }
  }

  private checkBurnout() {
    if (this.active.stress >= 100 || this.active.hp <= 0) {
      this.log.push(`${this.active.name} è andato in BURNOUT/ESAUSTO.`);
      const available = this.team.findIndex((d, i) => i !== this.activeIndex && d.hp > 0 && d.stress < 100);
      if (available >= 0) {
        this.active.stress = 100;
        this.activeIndex = available;
        this.log.push(`Entra ${this.active.name}.`);
      } else {
        this.result = "defeat";
        this.log.push("Tutti i developer sono fuori combattimento.");
      }
    }
  }

  private shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
}
