import type { Card } from "../entities/types";

// Tier 1 is deliberately low-power: the deck should help with consistency,
// not solve the encounter by itself. Higher tiers are unlocked by difficulty.
export const startingDeck:Card[]=[
 {id:"git",name:"GIT",cost:1,description:"Riduce lo Stress di 6.",effect:{type:"removeStress",amount:6}},
 {id:"coffee",name:"COFFEE",cost:0,description:"Aumenta del 10% i danni inflitti per questo turno e aumenta lo Stress di 10.",effect:{type:"codeBoost",amount:10}},
 {id:"docker",name:"DOCKER",cost:1,description:"Blocca 6 danni.",effect:{type:"block",amount:6}},
 {id:"stack-overflow",name:"STACK OVERFLOW",cost:1,description:"Recupera 8 HP.",effect:{type:"heal",amount:8}},
 {id:"ctrl-z",name:"CTRL+Z",cost:1,description:"Infligge 6 danni.",effect:{type:"damage",amount:6}}
];

export const rewardCards:Card[]=[
 // TIER 1 · difficoltà x1.0–x1.5
 {id:"chatgpt",name:"CHATGPT",cost:2,description:"Infligge 8 danni. Potrebbe essere una soluzione.",effect:{type:"damage",amount:8}},
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
 {id:"rubber-stamp",name:"APPROVATO",cost:0,description:"Blocca 5 danni.",effect:{type:"block",amount:5}},
 // TIER 2 · difficoltà x2.0–x2.5
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
 // TIER 3 · difficoltà x3.0–x3.5
 {id:"coffee-overdose",name:"CAFFÈ TRIPLO",cost:0,description:"Aumenta del 20% i danni inflitti per questo turno e aumenta lo Stress di 15.",effect:{type:"codeBoost",amount:20}},
 {id:"production",name:"PRODUZIONE",cost:2,description:"Infligge 18 danni.",effect:{type:"damage",amount:18}},
 {id:"code-review",name:"CODE REVIEW",cost:1,description:"Infligge 11 danni.",effect:{type:"damage",amount:11}},
 {id:"deadline-extension",name:"PROROGA",cost:1,description:"Riduce lo Stress di 12.",effect:{type:"removeStress",amount:12}},
 // TIER 4 · difficoltà x4.0+
 {id:"chatgpt-protocol",name:"CHATGPT PROTOCOL",cost:2,description:"Infligge 22 danni.",effect:{type:"damage",amount:22}},
 {id:"emergency-hotfix",name:"HOTFIX D'EMERGENZA",cost:2,description:"Infligge 20 danni e recupera 5 HP.",effect:{type:"damage",amount:20}}
];

export const rewardCardTiers:Record<string,number>={
 chatgpt:1,jira:1,google:1,"rubber-duck":1,"stackoverflow-copy":1,"npm-install":1,"git-pull":1,"console-log":1,breakpoint:1,"rubber-duck-debug":1,"unit-test":1,sleep:1,documentation:1,"rubber-stamp":1,
 "git-push":2,"merge-conflict":2,regex:2,refactor:2,"legacy-patch":2,"stackoverflow-answer":2,"integration-test":2,hotfix:2,rollback:2,"meeting-cancel":2,"energy-drink-card":2,"ai-slop":2,
 "coffee-overdose":3,production:3,"code-review":3,"deadline-extension":3,
 "chatgpt-protocol":4,"emergency-hotfix":4
};

const starterIds:Record<string,string[]>={junior:["git","coffee","stack-overflow","ctrl-z","docker"],senior:["git","docker","ctrl-z","chatgpt","stack-overflow"],devops:["docker","git","coffee","ctrl-z","chatgpt"],fullstack:["git","coffee","docker","stack-overflow","chatgpt"],intern:["coffee","git","stack-overflow","docker","ctrl-z"],architect:["git","docker","stack-overflow","chatgpt","ctrl-z"],hacker:["ctrl-z","chatgpt","git","docker","coffee"],designer:["coffee","stack-overflow","git","ctrl-z","docker"],freelancer:["ctrl-z","git","coffee","chatgpt","stack-overflow"]};
export function starterDeckForDeveloper(developerId:string):Card[]{const ids=starterIds[developerId]??starterIds.junior;return ids.map(id=>startingDeck.find(c=>c.id===id)).filter((c):c is Card=>Boolean(c)).map(c=>({...c}));}
