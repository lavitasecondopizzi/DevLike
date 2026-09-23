import { rewardCards } from "./cards";
import { rewardItems } from "./items";
import type { Card, Item } from "../entities/types";

export type EventEffect = {
  hp?: number;
  stress?: number;
  tempo?: number;
  reward?: "tool" | "item";
};

export type EventChoice = {
  label: string;
  description: string;
  effect: EventEffect;
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
};

export const gameEvents: GameEvent[] = [
  {
    id: "scope-creep",
    title: "IL CLIENTE HA UN'IDEA",
    description: "A metà sviluppo arriva un messaggio: «Già che ci siamo, possiamo aggiungere anche questa piccola cosa?» La piccola cosa richiede tre giorni.",
    choices: [
      { label: "ACCETTA", description: "Fai quello che chiede il cliente. +5 Stress, ma guadagni un Tool.", effect: { stress: 5, reward: "tool" } },
      { label: "NEGOZIA", description: "Ridimensioni la richiesta. -1 Tempo e -8 Stress.", effect: { tempo: -1, stress: -8 } },
      { label: "FALLO E BASTA", description: "Lo implementi senza fare domande. +10 Stress, ma recuperi un Oggetto.", effect: { stress: 10, reward: "item" } }
    ]
  },
  {
    id: "production-alert",
    title: "ALLARME IN PRODUZIONE",
    description: "Una notifica rossa compare sul monitor. Qualcosa è appena esploso in produzione.",
    choices: [
      { label: "HOTFIX", description: "Intervieni subito. -8 HP al team, ma il problema è risolto.", effect: { hp: -8 } },
      { label: "ROLLBACK", description: "Torni alla versione precedente. +1 Stress, ma guadagni 1 Tempo.", effect: { stress: 8, tempo: 1 } },
      { label: "NON È UN MIO BUG", description: "Apri un ticket e torni al lavoro. +12 Stress al team.", effect: { stress: 12 } }
    ]
  },
  {
    id: "coffee-machine",
    title: "LA MACCHINA DEL CAFFÈ",
    description: "La macchina del caffè aziendale lampeggia. Il team è stanco e nessuno vuole essere il primo a premere il pulsante.",
    choices: [
      { label: "CAFFÈ PER TUTTI", description: "Una pausa improvvisata. -15 Stress, ma perdi 1 Tempo.", effect: { stress: -15, tempo: -1 } },
      { label: "SOLO UN ESPRESSO", description: "Soluzione rapida. -7 Stress.", effect: { stress: -7 } },
      { label: "IL CAFFÈ È UNA DISTRAZIONE", description: "Ignori la macchina. +5 Stress, ma recuperi 1 Tempo.", effect: { stress: 5, tempo: 1 } }
    ]
  },
  {
    id: "legacy-code",
    title: "IL CODICE LEGACY",
    description: "Trovi una funzione di 900 righe senza commenti. Nessuno ricorda chi l'abbia scritta.",
    choices: [
      { label: "REFACTOR", description: "Metti ordine. -10 Stress, ma perdi 1 Tempo.", effect: { stress: -10, tempo: -1 } },
      { label: "NON TOCCARLA", description: "Se funziona, non si tocca. +6 Stress, nessun costo.", effect: { stress: 6 } },
      { label: "DOCUMENTA E SCAPPA", description: "Lasci una documentazione decente. Recuperi 1 Tempo, ma +3 Stress.", effect: { tempo: 1, stress: 3 } }
    ]
  },
  {
    id: "client-call",
    title: "CALL URGENTE",
    description: "«Hai cinque minuti per una call?» Sai già che durerà almeno un'ora.",
    choices: [
      { label: "PARTECIPA", description: "Ascolti tutto. -8 Stress al team, ma perdi 1 Tempo.", effect: { stress: -8, tempo: -1 } },
      { label: "MANDA IL RIASSUNTO", description: "Rispondi via mail. +4 Stress, ma non perdi Tempo.", effect: { stress: 4 } },
      { label: "TRASFORMA LA CALL IN TOOL", description: "Esci dalla call con una soluzione concreta. +3 Stress, ottieni un Tool.", effect: { stress: 3, reward: "tool" } }
    ]
  },
  {
    id: "friday-deploy",
    title: "DEPLOY DI VENERDÌ",
    description: "È venerdì alle 17:58. Qualcuno propone di fare il deploy adesso.",
    choices: [
      { label: "DEPLOY", description: "Rischi tutto. -12 HP e +10 Stress.", effect: { hp: -12, stress: 10 } },
      { label: "ASPETTI LUNEDÌ", description: "Scelta prudente. -5 Stress, ma perdi 1 Tempo.", effect: { stress: -5, tempo: -1 } },
      { label: "FAI UN BACKUP", description: "Prepari il terreno. +3 Stress, ottieni un Oggetto.", effect: { stress: 3, reward: "item" } }
    ]
  },
  {
    id: "stackoverflow",
    title: "STACK OVERFLOW",
    description: "Trovi esattamente la risposta che cercavi. Il post è del 2014 e nessuno sa se sia ancora valido.",
    choices: [
      { label: "COPIA E INCOLLA", description: "Funziona. -10 Stress.", effect: { stress: -10 } },
      { label: "LEGGI E CAPISCI", description: "Perdi tempo, ma impari qualcosa. -1 Tempo e +1 Stress.", effect: { tempo: -1, stress: 1 } },
      { label: "APRI TRE TAB", description: "Cerchi una soluzione migliore. Ottieni un Tool, ma +5 Stress.", effect: { reward: "tool", stress: 5 } }
    ]
  },
  {
    id: "mysterious-usb",
    title: "LA CHIAVETTA USB",
    description: "Sul tavolo della sala riunioni c'è una chiavetta USB senza etichetta. Nessuno ammette di averla lasciata lì.",
    choices: [
      { label: "LA COLLEGHI", description: "Una scelta discutibile. -15 HP, ma trovi un Oggetto utile.", effect: { hp: -15, reward: "item" } },
      { label: "LA ISOLI", description: "La metti da parte e segnali il problema. -5 Stress.", effect: { stress: -5 } },
      { label: "LA PORTI ALL'IT", description: "Qualcun altro se ne occupa. +1 Tempo e +2 Stress.", effect: { tempo: 1, stress: 2 } }
    ]
  }
];

export function randomEvent(): GameEvent {
  return gameEvents[Math.floor(Math.random() * gameEvents.length)];
}

export function randomEventReward(kind: "tool", maxTier?: number): Card;
export function randomEventReward(kind: "item", maxScore?: number): Item;
export function randomEventReward(kind: "tool" | "item", limit?: number): Card | Item {
  if (kind === "tool") {
    const pool=rewardCards.filter(card=>(card.tier??1)<=Math.max(1,limit??1));
    return pool[Math.floor(Math.random()*pool.length)]??rewardCards[0];
  }
  const pool=rewardItems.filter(item=>item.codeBonus+item.debugBonus<=Math.max(1,limit??3));
  return pool[Math.floor(Math.random()*pool.length)]??rewardItems[0];
}
