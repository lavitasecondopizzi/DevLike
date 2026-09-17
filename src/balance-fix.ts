import { Game } from "./game/Game";
import { rewardCards, rewardCardTiers } from "./data/cards";
import { developers } from "./data/developers";

// Balance pass: early-game Developers should provide a foundation, not a complete win condition.
const originalRandomDevelopers = (Game.prototype as any).randomDevelopers;
(Game.prototype as any).randomDevelopers = function(this: Game, count: number, excluded: string[] = []) {
  const candidates = originalRandomDevelopers.call(this, count, excluded) as typeof developers;
  return candidates.map(dev => ({
    ...dev,
    hp: Math.max(1, Math.round(dev.hp * 0.82)),
    maxHp: Math.max(1, Math.round(dev.maxHp * 0.82)),
    code: Math.max(1, Math.round(dev.code * 0.68)),
    debug: Math.max(1, Math.round(dev.debug * 0.68)),
  }));
};

// Reward tiers unlock at whole difficulty steps: x1/x1.5 -> T1, x2/x2.5 -> T2, etc.
const originalGenerateReward = Game.prototype.generateReward;
Game.prototype.generateReward = function(this: Game) {
  const unlockedTier = Math.max(1, Math.floor(this.difficulty));
  const pool = rewardCards.filter(card => (rewardCardTiers[card.id] ?? 1) <= unlockedTier);
  if (!pool.length) return originalGenerateReward.call(this);
  const reward = pool[Math.floor(Math.random() * pool.length)];
  if (reward) this.reward = { ...reward };
  this.screen = "reward";
};
