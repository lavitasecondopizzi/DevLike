import type { Card, Developer } from "./entities/types";
import { Game } from "./game/Game";

export type LeaderboardEntry = {
  score:number;
  nickname:string;
  team:{developerId:string;name:string}[];
  commessa:number;
  tappa:number;
  causaPerdita:string;
  difficolta:number;
  mazzo:{cardId:string;name:string;quantity:number}[];
  nuzlocke:{enabled:boolean;rules:string[]};
  createdAt:string;
};

const viteEnv=(import.meta as unknown as {env?:Record<string,string|undefined>}).env;
export const LEADERBOARD_API_URL = viteEnv?.VITE_LEADERBOARD_API_URL?.trim() ?? "";

const NUZLOCKE_LABELS:Record<string,string> = {
  permadeath:"PERMADEATH",noHealing:"NIENTE GUARIGIONE",noRecruit:"TEAM BLOCCATO",limitedRecruit:"UN SOLO RECLUTAMENTO",
  noBurnoutRecovery:"BURNOUT PERMANENTE",noStressRecovery:"NIENTE RECUPERO STRESS",noReplacement:"NO SOSTITUZIONI",firstPick:"FIRST PICK",
  noSwitch:"NO CAMBIO",noBackpack:"NO ZAINO",oneEquipment:"UN SOLO EQUIPMENT",noCardRemoval:"NO RIMOZIONE CARTE",deckLock:"DECK LOCK",
  noRest:"NO PAUSA",randomPath:"PERCORSO CASUALE",eliteMandatory:"ELITE OBBLIGATORIA",noCode:"NO CODICE",noDebug:"NO DEBUG",
  noDefense:"NO DIFESA",noBattleSwitch:"CAMBIO VIETATO IN COMBATTIMENTO",twoEnergy:"2 ENERGIA",smallHand:"MANO DA 2",
  oneTool:"UN SOLO TOOL",noDuplicates:"NO DOPPIONI",noCoffee:"NO CAFFÈ",noAI:"NO AI",noGit:"NO GIT",battleCardLock:"MONOUSO IN BATTAGLIA"
};

function countCards(deck:Card[]):LeaderboardEntry["mazzo"] {
  const grouped=new Map<string,{cardId:string;name:string;quantity:number}>();
  for(const card of deck){
    const current=grouped.get(card.id);
    if(current) current.quantity++;
    else grouped.set(card.id,{cardId:card.id,name:card.name,quantity:1});
  }
  return [...grouped.values()];
}

export function buildLeaderboardEntry(game:Game,nickname:string):LeaderboardEntry {
  const typed=game as Game & {nuzlockeActive?:boolean;nuzlockeRules?:string[]};
  const combat=game.combat;
  const team:Developer[]=combat?.team?.length?combat.team:game.team;
  return {
    score:game.score,
    nickname:nickname.trim(),
    team:team.map(dev=>({developerId:dev.id,name:dev.name})),
    commessa:game.projectNumber,
    tappa:Math.min(game.currentNode,6),
    causaPerdita:(game as Game & {lossCause?:string}).lossCause??"SCONFITTA",
    difficolta:game.difficulty,
    mazzo:countCards(game.deck),
    nuzlocke:{
      enabled:!!typed.nuzlockeActive,
      rules:(typed.nuzlockeRules??[]).map(rule=>NUZLOCKE_LABELS[rule]??rule)
    },
    createdAt:new Date().toISOString()
  };
}

export async function submitLeaderboardEntry(entry:LeaderboardEntry):Promise<void> {
  if(!LEADERBOARD_API_URL) throw new Error("LEADERBOARD_API_URL_NOT_CONFIGURED");
  const response=await fetch(LEADERBOARD_API_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(entry)
  });
  if(!response.ok) throw new Error("LEADERBOARD_SUBMIT_FAILED");
}

export async function fetchLeaderboard():Promise<LeaderboardEntry[]> {
  if(!LEADERBOARD_API_URL) throw new Error("LEADERBOARD_API_URL_NOT_CONFIGURED");
  const response=await fetch(LEADERBOARD_API_URL);
  if(!response.ok) throw new Error("LEADERBOARD_FETCH_FAILED");
  const data=await response.json();
  if(!Array.isArray(data)) return [];
  return data.map((entry:Partial<LeaderboardEntry>)=>({
    score:Number(entry.score??0),
    nickname:String(entry.nickname??"—"),
    team:Array.isArray(entry.team)?entry.team:[],
    commessa:Number(entry.commessa??0),
    tappa:Number(entry.tappa??0),
    causaPerdita:String(entry.causaPerdita??"SCONFITTA"),
    difficolta:Number(entry.difficolta??1),
    mazzo:Array.isArray(entry.mazzo)?entry.mazzo:[],
    nuzlocke:entry.nuzlocke&&typeof entry.nuzlocke==="object"?entry.nuzlocke:{enabled:false,rules:[]},
    createdAt:String(entry.createdAt??"")
  }));
}
