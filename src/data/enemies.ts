import type { Enemy } from "../entities/types";

export const enemies: Enemy[] = [
  {
    id: "bug",
    name: "BUG",
    hp: 32,
    maxHp: 32,
    intent: { label: "Morde il codice", damage: 7, stress: 4 }
  },
  {
    id: "meeting",
    name: "MEETING",
    hp: 40,
    maxHp: 40,
    intent: { label: "Poteva essere una mail", damage: 5, stress: 9 }
  },
  {
    id: "legacy",
    name: "LEGACY CODE",
    hp: 55,
    maxHp: 55,
    intent: { label: "Non toccarmi", damage: 11, stress: 6 }
  },
  {
    id: "client",
    name: "CLIENTE",
    hp: 70,
    maxHp: 70,
    intent: { label: "Piccola modifica", damage: 13, stress: 10 }
  }
];

export const boss: Enemy = {
  id: "deadline",
  name: "DEADLINE",
  hp: 120,
  maxHp: 120,
  intent: { label: "DOMANI È ONLINE", damage: 18, stress: 14 }
};
