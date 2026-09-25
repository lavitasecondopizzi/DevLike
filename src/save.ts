import { Combat } from "./game/Combat";
import { Game } from "./game/Game";

const SAVE_KEY = "devlike-save-v1";

type SerializedSet = { __devlikeType: "Set"; values: unknown[] };

function replacer(_key:string, value:unknown):unknown {
  if(value instanceof Set) return { __devlikeType:"Set", values:[...value] } satisfies SerializedSet;
  return value;
}

function reviveSets(value:unknown):unknown {
  if(Array.isArray(value)) return value.map(reviveSets);
  if(value && typeof value === "object"){
    const record=value as Record<string,unknown>;
    if(record.__devlikeType==="Set" && Array.isArray(record.values)) return new Set(record.values.map(reviveSets));
    for(const key of Object.keys(record)) record[key]=reviveSets(record[key]);
  }
  return value;
}

export function hasLocalSave():boolean {
  return !!localStorage.getItem(SAVE_KEY);
}

export function saveGame(game:Game):void {
  if(typeof localStorage==="undefined") return;
  const payload = {
    version:1,
    savedAt:new Date().toISOString(),
    state:JSON.parse(JSON.stringify(game,replacer))
  };
  localStorage.setItem(SAVE_KEY,JSON.stringify(payload));
}

export function clearLocalSave():void {
  localStorage.removeItem(SAVE_KEY);
}

export function loadGame(game:Game):boolean {
  if(typeof localStorage==="undefined") return false;
  const raw=localStorage.getItem(SAVE_KEY);
  if(!raw) return false;
  try{
    const payload=JSON.parse(raw);
    if(payload?.version!==1||!payload.state)return false;
    const state=reviveSets(payload.state) as Record<string,unknown>;
    const savedCombat=state.combat as Record<string,unknown>|null|undefined;
    if(savedCombat){
      const team=Array.isArray(savedCombat.team)?savedCombat.team as never[]:game.team;
      const enemy=savedCombat.enemy as never;
      const deck=Array.isArray(state.deck)?state.deck as never[]:game.deck;
      const rules=Array.isArray(savedCombat.nuzlockeRules)?savedCombat.nuzlockeRules as string[]:[];
      const combat=new Combat(team as any,enemy as any,deck as any,rules);
      Object.assign(combat,savedCombat);
      state.combat=combat;
    }
    Object.assign(game,state);
    return true;
  }catch{
    clearLocalSave();
    return false;
  }
}
