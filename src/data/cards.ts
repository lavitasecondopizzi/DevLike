import type { Card } from "../entities/types";

export const startingDeck:Card[]=[
 {id:"git",name:"GIT",cost:1,description:"Riduce lo Stress di 12.",effect:{type:"removeStress",amount:12}},
 {id:"coffee",name:"COFFEE",cost:0,description:"+15% Codice per questo turno e +10 Stress.",effect:{type:"codeBoost",amount:15}},
 {id:"docker",name:"DOCKER",cost:1,description:"Blocca 10 danni.",effect:{type:"block",amount:10}},
 {id:"stack-overflow",name:"STACK OVERFLOW",cost:1,description:"Recupera 18 HP.",effect:{type:"heal",amount:18}},
 {id:"ctrl-z",name:"CTRL+Z",cost:1,description:"Infligge 12 danni.",effect:{type:"damage",amount:12}}
];

export const rewardCards:Card[]=[
 {id:"chatgpt",name:"CHATGPT",cost:2,description:"Infligge 20 danni. Potrebbe essere una soluzione.",effect:{type:"damage",amount:20}},
 {id:"jira",name:"JIRA",cost:1,description:"Infligge 15 danni e aumenta lo Stress di 4.",effect:{type:"damage",amount:15}},
 {id:"google",name:"GOOGLE",cost:1,description:"Recupera 12 HP.",effect:{type:"heal",amount:12}},
 {id:"rubber-duck",name:"RUBBER DUCK",cost:0,description:"Riduce lo Stress di 15.",effect:{type:"removeStress",amount:15}},
 {id:"stackoverflow-copy",name:"STACK OVERFLOW DUPLICATO",cost:0,description:"Recupera 10 HP.",effect:{type:"heal",amount:10}},
 {id:"npm-install",name:"NPM INSTALL",cost:1,description:"Infligge 10 danni.",effect:{type:"damage",amount:10}},
 {id:"git-push",name:"GIT PUSH --FORCE",cost:2,description:"Infligge 25 danni.",effect:{type:"damage",amount:25}},
 {id:"git-pull",name:"GIT PULL",cost:1,description:"Riduce lo Stress di 8 e infligge 5 danni.",effect:{type:"removeStress",amount:8}},
 {id:"merge-conflict",name:"MERGE CONFLICT",cost:1,description:"Infligge 17 danni.",effect:{type:"damage",amount:17}},
 {id:"regex",name:"REGEX",cost:1,description:"Infligge 14 danni.",effect:{type:"damage",amount:14}},
 {id:"console-log",name:"CONSOLE.LOG",cost:0,description:"Infligge 7 danni.",effect:{type:"damage",amount:7}},
 {id:"breakpoint",name:"BREAKPOINT",cost:1,description:"Blocca 14 danni.",effect:{type:"block",amount:14}},
 {id:"rubber-duck-debug",name:"DEBUG A PAPERA",cost:1,description:"Riduce lo Stress di 10 e recupera 5 HP.",effect:{type:"removeStress",amount:10}},
 {id:"refactor",name:"REFACTOR",cost:1,description:"Infligge 13 danni.",effect:{type:"damage",amount:13}},
 {id:"legacy-patch",name:"PATCH AL LEGACY",cost:2,description:"Infligge 24 danni.",effect:{type:"damage",amount:24}},
 {id:"stackoverflow-answer",name:"RISPOSTA ACCETTATA",cost:1,description:"Recupera 20 HP.",effect:{type:"heal",amount:20}},
 {id:"unit-test",name:"UNIT TEST",cost:1,description:"Blocca 12 danni.",effect:{type:"block",amount:12}},
 {id:"integration-test",name:"INTEGRATION TEST",cost:2,description:"Infligge 22 danni.",effect:{type:"damage",amount:22}},
 {id:"hotfix",name:"HOTFIX",cost:1,description:"Infligge 16 danni.",effect:{type:"damage",amount:16}},
 {id:"rollback",name:"ROLLBACK",cost:1,description:"Riduce lo Stress di 18.",effect:{type:"removeStress",amount:18}},
 {id:"coffee-overdose",name:"CAFFÈ TRIPLO",cost:0,description:"+25% Codice per questo turno e +15 Stress.",effect:{type:"codeBoost",amount:25}},
 {id:"energy-drink-card",name:"ENERGY DRINK",cost:1,description:"+15% Codice per questo turno e +10 Stress.",effect:{type:"codeBoost",amount:15}},
 {id:"rubber-stamp",name:"APPROVATO",cost:0,description:"Blocca 8 danni.",effect:{type:"block",amount:8}},
 {id:"deadline-extension",name:"PROROGA",cost:1,description:"Riduce lo Stress di 20.",effect:{type:"removeStress",amount:20}},
 {id:"meeting-cancel",name:"CANCELLA MEETING",cost:1,description:"Infligge 18 danni.",effect:{type:"damage",amount:18}},
 {id:"production",name:"PRODUZIONE",cost:2,description:"Infligge 28 danni.",effect:{type:"damage",amount:28}},
 {id:"sleep",name:"DORMIRE",cost:1,description:"Recupera 15 HP.",effect:{type:"heal",amount:15}},
 {id:"documentation",name:"DOCUMENTAZIONE",cost:1,description:"Riduce lo Stress di 14.",effect:{type:"removeStress",amount:14}},
 {id:"code-review",name:"CODE REVIEW",cost:1,description:"Infligge 16 danni.",effect:{type:"damage",amount:16}},
 {id:"ai-slop",name:"AI SLOP",cost:0,description:"+20% Codice per questo turno e +12 Stress.",effect:{type:"codeBoost",amount:20}}
];

const starterIds:Record<string,string[]>={junior:["git","coffee","stack-overflow","ctrl-z","docker"],senior:["git","docker","ctrl-z","chatgpt","stack-overflow"],devops:["docker","git","coffee","ctrl-z","chatgpt"],fullstack:["git","coffee","docker","stack-overflow","chatgpt"],intern:["coffee","git","stack-overflow","docker","ctrl-z"],architect:["git","docker","stack-overflow","chatgpt","ctrl-z"],hacker:["ctrl-z","chatgpt","git","docker","coffee"],designer:["coffee","stack-overflow","git","ctrl-z","docker"],freelancer:["ctrl-z","git","coffee","chatgpt","stack-overflow"]};
export function starterDeckForDeveloper(developerId:string):Card[]{const ids=starterIds[developerId]??starterIds.junior;return ids.map(id=>startingDeck.find(c=>c.id===id)).filter((c):c is Card=>Boolean(c)).map(c=>({...c}));}
