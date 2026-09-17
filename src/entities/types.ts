export type Developer = {
  id: string;
  name: string;
  role: string;
  hp: number;
  maxHp: number;
  stress: number;
  code: number;
  debug: number;
  passive: string;
};

export type EnemyIntent = {
  label: string;
  damage: number;
  stress: number;
};

export type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  intent: EnemyIntent;
};

export type CardEffect =
  | { type: "damage"; amount: number }
  | { type: "heal"; amount: number }
  | { type: "stress"; amount: number }
  | { type: "codeBoost"; amount: number }
  | { type: "block"; amount: number }
  | { type: "removeStress"; amount: number };

export type Card = {
  id: string;
  name: string;
  cost: number;
  description: string;
  effect: CardEffect;
};

export type MapNodeType = "battle" | "elite" | "event" | "rest" | "reward" | "boss";

export type MapNode = {
  id: string;
  row: number;
  col: number;
  type: MapNodeType;
  title: string;
  description: string;
  next: string[];
  visited: boolean;
};

export type BattleResult = "ongoing" | "victory" | "defeat";
