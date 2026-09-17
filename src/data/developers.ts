import type { Developer } from "../entities/types";

export const developers: Developer[] = [
  {
    id: "junior",
    name: "Junior",
    role: "Frontend",
    description: "Smanetta con interfacce e CSS finché il pixel non si arrende.",
    hp: 70,
    maxHp: 70,
    stress: 0,
    code: 10,
    debug: 8,
    passive: "Stack Overflow: sotto il 50% di HP, +2 Debug."
  },
  {
    id: "senior",
    name: "Senior",
    role: "Backend",
    description: "Ha visto sistemi che nessuno dovrebbe aver visto. E li ha mantenuti in vita.",
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
    description: "Se funziona in produzione è perché lui ha sacrificato il sonno.",
    hp: 90,
    maxHp: 90,
    stress: 0,
    code: 10,
    debug: 16,
    passive: "Da me funziona: la prima Difesa di ogni combattimento blocca +5."
  },
  {
    id: "fullstack",
    name: "Full Stack",
    role: "Full Stack",
    description: "Fa tutto. Male? Forse. Ma fa tutto.",
    hp: 85,
    maxHp: 85,
    stress: 0,
    code: 13,
    debug: 13,
    passive: "Tuttofare: dopo aver giocato un Tool, +1 CODICE fino a fine turno."
  },
  {
    id: "intern",
    name: "Stagista",
    role: "Intern",
    description: "È arrivato ieri e ha già accesso alla produzione.",
    hp: 60,
    maxHp: 60,
    stress: 0,
    code: 8,
    debug: 10,
    passive: "Non era documentato: la prima volta che raggiunge 75 Stress, lo riduce di 10."
  },
  {
    id: "architect",
    name: "Architect",
    role: "Software Architect",
    description: "Prima di scrivere una riga di codice disegna 14 diagrammi.",
    hp: 95,
    maxHp: 95,
    stress: 0,
    code: 12,
    debug: 15,
    passive: "Overengineering: DIFESA costa 0 Energia una volta per combattimento."
  },
  {
    id: "hacker",
    name: "Hacker",
    role: "Security",
    description: "Trova bug che nessuno aveva ancora avuto il coraggio di chiamare bug.",
    hp: 75,
    maxHp: 75,
    stress: 0,
    code: 11,
    debug: 17,
    passive: "Exploit: DEBUG infligge +3 danni contro i Clienti."
  },
  {
    id: "designer",
    name: "Designer",
    role: "UI/UX",
    description: "Ha spostato un bottone di 2 pixel e ha salvato il progetto.",
    hp: 80,
    maxHp: 80,
    stress: 0,
    code: 9,
    debug: 11,
    passive: "Pixel Perfect: la prima carta giocata ogni turno costa 1 Energia in meno."
  },
  {
    id: "freelancer",
    name: "Freelancer",
    role: "Consulente",
    description: "Lavora ovunque, a qualsiasi ora, purché la fattura parta prima.",
    hp: 88,
    maxHp: 88,
    stress: 0,
    code: 15,
    debug: 9,
    passive: "Fattura: dopo una vittoria recupera 5 HP."
  }
];
