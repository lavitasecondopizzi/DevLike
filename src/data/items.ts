import type { Item } from "../entities/types";

export const rewardItems:Item[]=[
 // TIER 1 · bonus totali 2–3
 {id:"mechanical-mouse",name:"MOUSE GAMING",description:"+2 CODICE. Il DPI è rigorosamente non necessario.",codeBonus:2,debugBonus:0,tier:1},
 {id:"terminal",name:"TERMINALE NERO",description:"+2 DEBUG. Scrivere comandi bianchi su nero fa più professionale.",codeBonus:0,debugBonus:2,tier:1},
 {id:"coffee-mug",name:"TAZZA 'IT WORKS'",description:"+1 CODICE e +1 DEBUG. Non lavarla mai.",codeBonus:1,debugBonus:1,tier:1},
 {id:"hoodie",name:"HOODIE AZIENDALE",description:"+1 CODICE e +1 DEBUG. Protegge dal meeting improvviso.",codeBonus:1,debugBonus:1,tier:1},
 {id:"lanyard",name:"BADGE CON CORDINO",description:"+1 CODICE e +1 DEBUG. Accesso garantito al corridoio.",codeBonus:1,debugBonus:1,tier:1},
 {id:"vpn",name:"VPN AZIENDALE",description:"+2 DEBUG. Il server ora pensa che tu sia qualcun altro.",codeBonus:0,debugBonus:2,tier:1},
 {id:"git-sticker",name:"ADESIVO GIT",description:"+2 CODICE. Non aumenta davvero le performance.",codeBonus:2,debugBonus:0,tier:1},

 // TIER 2 · bonus totali 4–5
 {id:"mechanical-keyboard",name:"TASTIERA MECCANICA",description:"+3 CODICE e +1 DEBUG. Fa rumore anche quando non stai lavorando.",codeBonus:3,debugBonus:1,tier:2},
 {id:"rubber-duck-item",name:"RUBBER DUCK GOLD",description:"+1 CODICE e +3 DEBUG. Ti ascolta senza mai contraddirti.",codeBonus:1,debugBonus:3,tier:2},
 {id:"second-monitor",name:"SECONDO MONITOR",description:"+3 CODICE e +1 DEBUG. Il problema è sempre sull'altro schermo.",codeBonus:3,debugBonus:1,tier:2},
 {id:"energy-drink",name:"ENERGY DRINK",description:"+2 CODICE e +2 DEBUG. Il sonno è una feature opzionale.",codeBonus:2,debugBonus:2,tier:2},
 {id:"rubber-keycap",name:"KEYCAP PORTAFORTUNA",description:"+2 CODICE e +2 DEBUG. Non migliora il codice, ma porta fortuna.",codeBonus:2,debugBonus:2,tier:2},
 {id:"sticky-notes",name:"POST-IT INFINITI",description:"+1 CODICE e +3 DEBUG. La documentazione finalmente esiste, da qualche parte.",codeBonus:1,debugBonus:3,tier:2},
 {id:"usb-stick",name:"CHIAVETTA USB",description:"+2 CODICE e +2 DEBUG. Contiene sicuramente qualcosa di importante.",codeBonus:2,debugBonus:2,tier:2},

 // TIER 3 · bonus totali 5–6
 {id:"debugger-usb",name:"DEBUGGER USB",description:"+2 CODICE e +4 DEBUG. Nessuno sa cosa contenga davvero.",codeBonus:2,debugBonus:4,tier:3},
 {id:"ultrawide",name:"MONITOR ULTRAWIDE",description:"+5 CODICE. Finalmente puoi vedere tutti i problemi contemporaneamente.",codeBonus:5,debugBonus:0,tier:3},
 {id:"rubber-duck-blue",name:"PAPERA BLU",description:"+1 CODICE e +5 DEBUG. Ha già sentito questo bug tre volte.",codeBonus:1,debugBonus:5,tier:3},
 {id:"usb-hub",name:"HUB USB DA 17 PORTE",description:"+4 CODICE e +1 DEBUG. Nessuno sa perché servano tutte.",codeBonus:4,debugBonus:1,tier:3},
 {id:"noise-cancel-headset",name:"CUFFIE ANTI-MEETING",description:"+2 CODICE e +4 DEBUG. Il meeting continua, ma almeno non lo senti.",codeBonus:2,debugBonus:4,tier:3},
 {id:"docking-station",name:"DOCKING STATION",description:"+3 CODICE e +3 DEBUG. Tutto collegato, per una volta.",codeBonus:3,debugBonus:3,tier:3},
 {id:"ergonomic-chair",name:"SEDIA ERGONOMICA",description:"+4 CODICE e +2 DEBUG. Il mal di schiena non è più una feature.",codeBonus:4,debugBonus:2,tier:3},

 // TIER 4 · bonus totali 7–8
 {id:"server-rack",name:"MINI SERVER",description:"+5 CODICE e +2 DEBUG. Fa caldo, ma funziona.",codeBonus:5,debugBonus:2,tier:4},
 {id:"rubber-duck-red",name:"PAPERA ROSSA",description:"+2 CODICE e +5 DEBUG. Giudica in silenzio.",codeBonus:2,debugBonus:5,tier:4},
 {id:"coffee-machine",name:"MACCHINETTA DEL CAFFÈ",description:"+4 CODICE e +4 DEBUG. Ma richiede manutenzione quotidiana.",codeBonus:4,debugBonus:4,tier:4},
 {id:"nas",name:"NAS AZIENDALE",description:"+6 CODICE e +1 DEBUG. Se tutto è salvato, niente può andare storto.",codeBonus:6,debugBonus:1,tier:4},
 {id:"server-monitor",name:"MONITOR DI PRODUZIONE",description:"+3 CODICE e +5 DEBUG. Vedi il disastro prima che arrivi il cliente.",codeBonus:3,debugBonus:5,tier:4},
 {id:"standing-desk",name:"SCRIVANIA ELETTRICA",description:"+4 CODICE e +3 DEBUG. Cambiare posizione non risolve il bug, ma aiuta.",codeBonus:4,debugBonus:3,tier:4},
 {id:"incident-kit",name:"KIT INCIDENT RESPONSE",description:"+5 CODICE e +3 DEBUG. Pronto per quando 'funziona in locale' smette di essere vero.",codeBonus:5,debugBonus:3,tier:4}
];
