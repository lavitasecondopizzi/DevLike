import type { Card } from "../entities/types";

export const startingDeck: Card[] = [
  {
    id: "git",
    name: "GIT",
    cost: 1,
    description: "Riduce lo Stress di 12.",
    effect: { type: "removeStress", amount: 12 }
  },
  {
    id: "coffee",
    name: "COFFEE",
    cost: 0,
    description: "+15% Codice per questo turno e +10 Stress.",
    effect: { type: "codeBoost", amount: 15 }
  },
  {
    id: "docker",
    name: "DOCKER",
    cost: 1,
    description: "Blocca 10 danni.",
    effect: { type: "block", amount: 10 }
  },
  {
    id: "stack-overflow",
    name: "STACK OVERFLOW",
    cost: 1,
    description: "Recupera 18 HP.",
    effect: { type: "heal", amount: 18 }
  },
  {
    id: "ctrl-z",
    name: "CTRL+Z",
    cost: 1,
    description: "Infligge 12 danni.",
    effect: { type: "damage", amount: 12 }
  },
  {
    id: "ai",
    name: "CHATGPT",
    cost: 2,
    description: "Infligge 20 danni. Potrebbe essere una soluzione.",
    effect: { type: "damage", amount: 20 }
  }
];

export const rewardCards: Card[] = [
  {
    id: "jira",
    name: "JIRA",
    cost: 1,
    description: "Infligge 15 danni e +4 Stress.",
    effect: { type: "damage", amount: 15 }
  },
  {
    id: "google",
    name: "GOOGLE",
    cost: 1,
    description: "Recupera 12 HP e riduce 6 Stress.",
    effect: { type: "heal", amount: 12 }
  },
  {
    id: "rubber-duck",
    name: "RUBBER DUCK",
    cost: 0,
    description: "Riduce lo Stress di 15.",
    effect: { type: "removeStress", amount: 15 }
  }
];
