import type { Item } from "../entities/types";

export const rewardItems: Item[] = [
  {
    id: "mechanical-keyboard",
    name: "TASTIERA MECCANICA",
    description: "+3 CODICE. Fa rumore anche quando non stai lavorando.",
    codeBonus: 3,
    debugBonus: 0
  },
  {
    id: "rubber-duck-item",
    name: "RUBBER DUCK GOLD",
    description: "+3 DEBUG. Ti ascolta senza mai contraddirti.",
    codeBonus: 0,
    debugBonus: 3
  },
  {
    id: "second-monitor",
    name: "SECONDO MONITOR",
    description: "+2 CODICE e +1 DEBUG. Il problema è sempre sull'altro schermo.",
    codeBonus: 2,
    debugBonus: 1
  },
  {
    id: "energy-drink",
    name: "ENERGY DRINK",
    description: "+1 CODICE e +2 DEBUG. Il sonno è una feature opzionale.",
    codeBonus: 1,
    debugBonus: 2
  },
  {
    id: "debugger-usb",
    name: "DEBUGGER USB",
    description: "+1 CODICE e +3 DEBUG. Nessuno sa cosa contenga davvero.",
    codeBonus: 1,
    debugBonus: 3
  },
  {
    id: "rubber-keycap",
    name: "KEYCAP PORTAFORTUNA",
    description: "+2 CODICE e +1 DEBUG. Non migliora il codice, ma porta fortuna.",
    codeBonus: 2,
    debugBonus: 1
  }
];
