import type { Card } from "../entities/types";

// Ogni Developer ha un proprio mazzo base di 5 Tool. Queste carte rappresentano
// il kit di livello base della classe e vengono usate solo dopo la sua scelta.
export const startingDeck:Card[]=[
 {id:"git",name:"GIT",cost:1,description:"Riduce lo Stress di 6.",effect:{type:"removeStress",amount:6}},
 {id:"coffee",name:"COFFEE",cost:0,description:"Aumenta del 10% i danni inflitti per questo turno e aumenta lo Stress di 10.",effect:{type:"codeBoost",amount:10}},
 {id:"docker",name:"DOCKER",cost:1,description:"Blocca 6 danni.",effect:{type:"block",amount:6}},
 {id:"stack-overflow",name:"STACK OVERFLOW",cost:1,description:"Recupera 8 HP.",effect:{type:"heal",amount:8}},
 {id:"ctrl-z",name:"CTRL+Z",cost:1,description:"Infligge 6 danni.",effect:{type:"damage",amount:6}},
 {id:"grep",name:"GREP",cost:1,description:"Infligge 5 danni.",effect:{type:"damage",amount:5}},
 {id:"terminal",name:"TERMINALE",cost:1,description:"Blocca 5 danni.",effect:{type:"block",amount:5}},
 {id:"lint",name:"LINT",cost:1,description:"Riduce lo Stress di 5.",effect:{type:"removeStress",amount:5}},
 {id:"wireframe",name:"WIREFRAME",cost:1,description:"Blocca 4 danni e riduce lo Stress di 2.",effect:{type:"block",amount:4}},
 {id:"quick-fix",name:"QUICK FIX",cost:1,description:"Infligge 5 danni.",effect:{type:"damage",amount:5}},
 {id:"script",name:"SCRIPT",cost:1,description:"Infligge 6 danni.",effect:{type:"damage",amount:6}},
 {id:"monitor",name:"MONITOR",cost:1,description:"Blocca 6 danni.",effect:{type:"block",amount:6}},
 {id:"cache",name:"CACHE",cost:0,description:"Riduce lo Stress di 4.",effect:{type:"removeStress",amount:4}},
 {id:"api-call",name:"API CALL",cost:1,description:"Infligge 5 danni.",effect:{type:"damage",amount:5}},
 {id:"prototype",name:"PROTOTIPO",cost:1,description:"Recupera 6 HP.",effect:{type:"heal",amount:6}},
 {id:"exploit",name:"EXPLOIT",cost:1,description:"Infligge 7 danni.",effect:{type:"damage",amount:7}},
 {id:"freelance-hustle",name:"HUSTLE",cost:1,description:"Infligge 6 danni.",effect:{type:"damage",amount:6}}
];

// Il campo tier resta separato per compatibilità con le carte esistenti.
export const starterDecks:Record<string,string[]>={
 junior:["git","coffee","docker","stack-overflow","ctrl-z"],
 senior:["git","ctrl-z","quick-fix","stack-overflow","terminal"],
 devops:["docker","terminal","git","cache","ctrl-z"],
 fullstack:["git","script","docker","stack-overflow","api-call"],
 intern:["coffee","prototype","git","docker","quick-fix"],
 architect:["git","monitor","stack-overflow","terminal","lint"],
 hacker:["exploit","grep","git","cache","ctrl-z"],
 designer:["wireframe","prototype","coffee","git","monitor"],
 freelancer:["freelance-hustle","git","coffee","quick-fix","stack-overflow"]
};

export const rewardCards:Card[]=[
 // TIER 1 · difficoltà x1.0–x1.5
 {id:"chatgpt",name:"CHATGPT",cost:2,description:"Infligge 10 danni. Potrebbe essere una soluzione.",effect:{type:"damage",amount:10}},
 {id:"jira",name:"JIRA",cost:1,description:"Infligge 7 danni.",effect:{type:"damage",amount:7}},
 {id:"google",name:"GOOGLE",cost:1,description:"Recupera 8 HP.",effect:{type:"heal",amount:8}},
 {id:"rubber-duck",name:"RUBBER DUCK",cost:0,description:"Riduce lo Stress di 6.",effect:{type:"removeStress",amount:6}},
 {id:"stackoverflow-copy",name:"STACK OVERFLOW DUPLICATO",cost:0,description:"Recupera 6 HP.",effect:{type:"heal",amount:6}},
 {id:"npm-install",name:"NPM INSTALL",cost:1,description:"Infligge 6 danni.",effect:{type:"damage",amount:6}},
 {id:"git-pull",name:"GIT PULL",cost:1,description:"Riduce lo Stress di 5.",effect:{type:"removeStress",amount:5}},
 {id:"console-log",name:"CONSOLE.LOG",cost:1,description:"Infligge 4 danni.",effect:{type:"damage",amount:4}},
 {id:"breakpoint",name:"BREAKPOINT",cost:1,description:"Blocca 7 danni.",effect:{type:"block",amount:7}},
 {id:"rubber-duck-debug",name:"DEBUG A PAPERA",cost:1,description:"Riduce lo Stress di 6.",effect:{type:"removeStress",amount:6}},
 {id:"unit-test",name:"UNIT TEST",cost:1,description:"Blocca 6 danni.",effect:{type:"block",amount:6}},
 {id:"sleep",name:"DORMIRE",cost:1,description:"Recupera 8 HP.",effect:{type:"heal",amount:8}},
 {id:"documentation",name:"DOCUMENTAZIONE",cost:1,description:"Riduce lo Stress di 6.",effect:{type:"removeStress",amount:6}},
 {id:"rubber-stamp",name:"APPROVATO",cost:1,description:"Blocca 5 danni.",effect:{type:"block",amount:5}},
 // TIER 2
 {id:"git-push",name:"GIT PUSH --FORCE",cost:2,description:"Infligge 14 danni.",effect:{type:"damage",amount:14}},
 {id:"merge-conflict",name:"MERGE CONFLICT",cost:1,description:"Infligge 10 danni.",effect:{type:"damage",amount:10}},
 {id:"regex",name:"REGEX",cost:1,description:"Infligge 9 danni.",effect:{type:"damage",amount:9}},
 {id:"refactor",name:"REFACTOR",cost:1,description:"Infligge 9 danni.",effect:{type:"damage",amount:9}},
 {id:"legacy-patch",name:"PATCH AL LEGACY",cost:2,description:"Infligge 15 danni.",effect:{type:"damage",amount:15}},
 {id:"stackoverflow-answer",name:"RISPOSTA ACCETTATA",cost:1,description:"Recupera 12 HP.",effect:{type:"heal",amount:12}},
 {id:"integration-test",name:"INTEGRATION TEST",cost:2,description:"Infligge 14 danni.",effect:{type:"damage",amount:14}},
 {id:"hotfix",name:"HOTFIX",cost:1,description:"Infligge 10 danni.",effect:{type:"damage",amount:10}},
 {id:"rollback",name:"ROLLBACK",cost:1,description:"Riduce lo Stress di 10.",effect:{type:"removeStress",amount:10}},
 {id:"meeting-cancel",name:"CANCELLA MEETING",cost:1,description:"Infligge 11 danni.",effect:{type:"damage",amount:11}},
 {id:"energy-drink-card",name:"ENERGY DRINK",cost:1,description:"Aumenta del 12% i danni inflitti per questo turno e aumenta lo Stress di 10.",effect:{type:"codeBoost",amount:12}},
 {id:"ai-slop",name:"AI SLOP",cost:0,description:"Aumenta del 15% i danni inflitti per questo turno e aumenta lo Stress di 10.",effect:{type:"codeBoost",amount:15}},
 // TIER 3
 {id:"coffee-overdose",name:"CAFFÈ TRIPLO",cost:0,description:"Aumenta del 20% i danni inflitti per questo turno e aumenta lo Stress di 15.",effect:{type:"codeBoost",amount:20}},
 {id:"production",name:"PRODUZIONE",cost:2,description:"Infligge 19 danni.",effect:{type:"damage",amount:19}},
 {id:"code-review",name:"CODE REVIEW",cost:1,description:"Infligge 12 danni.",effect:{type:"damage",amount:12}},
 {id:"deadline-extension",name:"PROROGA",cost:1,description:"Riduce lo Stress di 12.",effect:{type:"removeStress",amount:12}},
 // TIER 4
 {id:"chatgpt-protocol",name:"CHATGPT PROTOCOL",cost:2,description:"Infligge 21 danni.",effect:{type:"damage",amount:21}},
 {id:"emergency-hotfix",name:"HOTFIX D'EMERGENZA",cost:2,description:"Infligge 22 danni.",effect:{type:"damage",amount:22}},
 // TIER 1 · nuovi Tool
 {id:"grep-log",name:"GREP LOG",cost:1,description:"Infligge 6 danni.",effect:{type:"damage",amount:6}},
 {id:"backup",name:"BACKUP",cost:1,description:"Recupera 7 HP.",effect:{type:"heal",amount:7}},
 {id:"todo-list",name:"TODO LIST",cost:1,description:"Riduce lo Stress di 5.",effect:{type:"removeStress",amount:5}},
 {id:"firewall",name:"FIREWALL",cost:1,description:"Blocca 7 danni.",effect:{type:"block",amount:7}},
 // TIER 2 · nuovi Tool
 {id:"code-review-plus",name:"CODE REVIEW PLUS",cost:1,description:"Infligge 11 danni.",effect:{type:"damage",amount:11}},
 {id:"cache-clear",name:"CACHE CLEAR",cost:1,description:"Riduce lo Stress di 10.",effect:{type:"removeStress",amount:10}},
 {id:"backup-db",name:"BACKUP DATABASE",cost:1,description:"Recupera 11 HP.",effect:{type:"heal",amount:11}},
 {id:"load-balancer",name:"LOAD BALANCER",cost:1,description:"Blocca 10 danni.",effect:{type:"block",amount:10}},
 // TIER 3 · nuovi Tool
 {id:"power-patch",name:"POWER PATCH",cost:2,description:"Infligge 19 danni.",effect:{type:"damage",amount:19}},
 {id:"rollback-production",name:"ROLLBACK PRODUZIONE",cost:1,description:"Riduce lo Stress di 14.",effect:{type:"removeStress",amount:14}},
 {id:"medical-leave",name:"FERIE STRATEGICHE",cost:1,description:"Recupera 16 HP.",effect:{type:"heal",amount:16}},
 {id:"waf",name:"WAF",cost:2,description:"Blocca 17 danni.",effect:{type:"block",amount:17}},
 // TIER 4 · nuovi Tool
 {id:"mega-patch",name:"MEGA PATCH",cost:2,description:"Infligge 25 danni.",effect:{type:"damage",amount:25}},
 {id:"full-restore",name:"FULL RESTORE",cost:2,description:"Recupera 22 HP.",effect:{type:"heal",amount:22}},
 {id:"incident-response",name:"INCIDENT RESPONSE",cost:1,description:"Riduce lo Stress di 18.",effect:{type:"removeStress",amount:18}},
 {id:"mega-shield",name:"MEGA SHIELD",cost:2,description:"Blocca 22 danni.",effect:{type:"block",amount:22}},
];

export const rewardCardTiers:Record<string,number>={"grep-log":1,backup:1,"todo-list":1,firewall:1,"code-review-plus":2,"cache-clear":2,"backup-db":2,"load-balancer":2,"power-patch":3,"rollback-production":3,"medical-leave":3,waf:3,"mega-patch":4,"full-restore":4,"incident-response":4,"mega-shield":4,chatgpt:1,jira:1,google:1,"rubber-duck":1,"stackoverflow-copy":1,"npm-install":1,"git-pull":1,"console-log":1,breakpoint:1,"rubber-duck-debug":1,"unit-test":1,sleep:1,documentation:1,"rubber-stamp":1,"git-push":2,"merge-conflict":2,regex:2,refactor:2,"legacy-patch":2,"stackoverflow-answer":2,"integration-test":2,hotfix:2,rollback:2,"meeting-cancel":2,"energy-drink-card":2,"ai-slop":2,"coffee-overdose":3,production:3,"code-review":3,"deadline-extension":3,"chatgpt-protocol":4,"emergency-hotfix":4};

rewardCards.forEach(card=>{card.tier=rewardCardTiers[card.id]??1;});

export function starterDeckForDeveloper(developerId:string):Card[]{const ids=starterDecks[developerId]??starterDecks.junior;return ids.map(id=>startingDeck.find(c=>c.id===id)).filter((c):c is Card=>Boolean(c)).map(c=>({...c,tier:1}));}
