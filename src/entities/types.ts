export type Item = {
  id: string;
  name: string;
  description: string;
  codeBonus: number;
  debugBonus: number;
};

export type Developer = {
  id: string;
  name: string;
  role: string;
  description: string;
  hp: number;
  maxHp: number;
  stress: number;
  code: number;
  debug: number;
  passive: string;
  advantages: string[];
  weaknesses: string[];
  advantageEnemyIds: string[];
  weaknessEnemyIds: string[];
  advantageConditions: string[];
  weaknessConditions: string[];
  items: Item[];
};

export type EnemyIntent = { label: string; damage: number; stress: number };

export type Enemy = {
  id: string;
  name: string;
  type: string;
  description: string;
  hp: number;
  maxHp: number;
  code: number;
  debug: number;
  passive: string;
  advantages: string[];
  weaknesses: string[];
  advantageDeveloperIds: string[];
  weaknessDeveloperIds: string[];
  advantageConditions: string[];
  weaknessConditions: string[];
  intent: EnemyIntent;
};

export type CardEffect =
  | { type: "damage"; amount: number }
  | { type: "heal"; amount: number }
  | { type: "stress"; amount: number }
  | { type: "codeBoost"; amount: number }
  | { type: "block"; amount: number }
  | { type: "removeStress"; amount: number };

export type Card = { id: string; name: string; cost: number; description: string; effect: CardEffect };

export type MapNodeType = "battle" | "elite" | "event" | "rest" | "fullRest" | "reward" | "item" | "recruit" | "boss";
export type MapNode = {
  id: string; row: number; col: number; type: MapNodeType; title: string; description: string;
  next: string[]; visited: boolean; hiddenEncounter: boolean; enemyId?: string;
};
export type BattleResult = "ongoing" | "victory" | "defeat";
