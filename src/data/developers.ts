import type { Developer } from "../entities/types";

export const developers: Developer[] = [
  {
    id: "junior",
    name: "Junior",
    role: "Frontend",
    hp: 70,
    maxHp: 70,
    stress: 0,
    code: 10,
    debug: 8,
    passive: "Stack Overflow: quando è sotto il 50% di HP, +2 Debug."
  },
  {
    id: "senior",
    name: "Senior",
    role: "Backend",
    hp: 100,
    maxHp: 100,
    stress: 0,
    code: 14,
    debug: 12,
    passive: "Esperienza: +2 danni con CODA."
  },
  {
    id: "devops",
    name: "DevOps",
    role: "DevOps",
    hp: 90,
    maxHp: 90,
    stress: 0,
    code: 10,
    debug: 16,
    passive: "Da me funziona: la prima Difesa di ogni combattimento blocca +5."
  }
];
