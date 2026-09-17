import { Game } from "../game/Game";

export type NuzlockeRule =
  | "permadeath" | "noHealing" | "noRecruit" | "limitedRecruit"
  | "noBurnoutRecovery" | "noStressRecovery" | "noReplacement" | "firstPick"
  | "noSwitch" | "noBackpack" | "oneEquipment" | "noCardRemoval" | "deckLock"
  | "noRest" | "randomPath" | "eliteMandatory" | "noCode" | "noDebug"
  | "noDefense" | "noBattleSwitch" | "twoEnergy" | "smallHand" | "oneTool"
  | "noDuplicates" | "noCoffee" | "noAI" | "noGit";

type NuzGame = Game & { nuzlockeActive:boolean; nuzlockeGraveyard:string[]; nuzlockeRules:NuzlockeRule[]; nuzlockeRecruitCount:number };

const labels:Record<NuzlockeRule,string>={
  permadeath:"PERMADEATH", noHealing:"NIENTE GUARIGIONE", noRecruit:"TEAM BLOCCATO", limitedRecruit:"UN SOLO RECLUTAMENTO",
  noBurnoutRecovery:"BURNOUT PERMANENTE", noStressRecovery:"NIENTE RECUPERO STRESS", noReplacement:"NO SOSTITUZIONI", firstPick:"FIRST PICK",
  noSwitch:"NO CAMBIO", noBackpack:"NO ZAINO", oneEquipment:"UN SOLO EQUIPMENT", noCardRemoval:"MAZZO IMMUTABILE", deckLock:"DECK LOCK",
  noRest:"NO PAUSA", randomPath:"PERCORSO CASUALE", eliteMandatory:"ELITE OBBLIGATORIA", noCode:"NO CODICE", noDebug:"NO DEBUG",
  noDefense:"NO DIFESA", noBattleSwitch:"CAMBIO VIETATO IN COMBATTIMENTO", twoEnergy:"2 ENERGIA", smallHand:"MANO DA 2",
  oneTool:"UN SOLO TOOL", noDuplicates:"NO DOPPIONI", noCoffee:"NO CAFFÈ", noAI:"NO AI", noGit:"NO GIT"
};

const groups:[string,NuzlockeRule[]][]=[
  ["SOPRAVVIVENZA",["permadeath","noHealing","noBurnoutRecovery","noStressRecovery","noRest"]],
  ["TEAM",["noRecruit","limitedRecruit","noReplacement","firstPick","noSwitch","noBattleSwitch"]],
  ["RISORSE",["noBackpack","oneEquipment","noCardRemoval","deckLock","noDuplicates"]],
  ["MAPPA",["randomPath","eliteMandatory"]],
  ["COMBATTIMENTO",["noCode","noDebug","noDefense","twoEnergy","smallHand","oneTool"]],
  ["CAOS DEVLIKE",["noCoffee","noAI","noGit"]]
];

const descriptions:Record<NuzlockeRule,string>={
  permadeath:"Un Developer a 0 HP viene perso definitivamente.", noHealing:"PAUSA e RECUPERO non curano HP.", noRecruit:"Dopo la scelta iniziale non puoi reclutare Developer.", limitedRecruit:"Puoi reclutare o sostituire un solo Developer per progetto.",
  noBurnoutRecovery:"Un Developer che raggiunge BURNOUT resta a 100 Stress durante i recuperi.", noStressRecovery:"PAUSA e RECUPERO non riducono lo Stress.", noReplacement:"Con 3 Developer non puoi sostituirne nessuno.", firstPick:"Il Developer iniziale non può essere sostituito durante la run.",
  noSwitch:"L'azione CAMBIO non è disponibile.", noBackpack:"Gli oggetti non possono essere conservati nello ZAINO.", oneEquipment:"Ogni Developer ha un solo slot Equipment.", noCardRemoval:"Le carte non possono essere rimosse dal mazzo.", deckLock:"Il mazzo non può essere modificato durante il progetto, eccetto le ricompense automatiche.",
  randomPath:"Quando scegli un nodo, viene selezionato casualmente tra quelli disponibili.", eliteMandatory:"Se è disponibile un ELITE, devi affrontarlo prima degli altri nodi.", noCode:"L'azione CODICE è vietata.", noDebug:"L'azione DEBUG è vietata.",
  noDefense:"L'azione DIFESA è vietata.", noBattleSwitch:"Non puoi cambiare Developer durante un combattimento.", twoEnergy:"Ogni turno hai solo 2 Energia.", smallHand:"Peschi 2 carte invece di 3.", oneTool:"Puoi giocare un solo Tool per turno.",
  noDuplicates:"Non puoi aggiungere una carta già presente nel mazzo.", noCoffee:"Le carte con CAFFÈ nel nome non possono essere utilizzate.", noAI:"Le carte AI/CHATGPT non possono essere utilizzate.", noGit:"Le carte GIT non possono essere utilizzate."
};

function markup(){return `<div class="feature-overlay" data-nuzlocke-overlay><div class="feature-window nuzlocke-window"><div class="feature-titlebar"><div><span class="codex-kicker">MODALITÀ SPECIALE</span><h2>NUZLOCKE</h2><small>Costruisci la difficoltà scegliendo le regole.</small></div><button type="button" class="feature-close" data-nuz-close>ANNULLA ×</button></div><div class="nuzlocke-rules"><div class="nuzlocke-groups">${groups.map(([name,rules])=>`<section><h3>${name}</h3><div class="nuzlocke-rule-grid">${rules.map(rule=>`<label class="nuzlocke-option ${rule==="permadeath"?"selected":""}"><input type="checkbox" data-nuz-rule="${rule}" ${rule==="permadeath"?"checked":""}><span><b>${labels[rule]}</b><small>${descriptions[rule]}</small></span></label>`).join("")}</div></section>`).join("")}</div><div class="nuzlocke-summary-box"><span>REGOLAMENTO SELEZIONATO</span><strong data-nuz-summary>PERMADEATH</strong></div></div><button type="button" class="primary nuzlocke-start" data-nuz-start>INIZIA NUZLOCKE</button></div></div>`;}

function selectedRules(){return [...document.querySelectorAll<HTMLInputElement>("[data-nuz-rule]:checked")].map(x=>x.dataset.nuzRule as NuzlockeRule);}
function summary(){const rules=selectedRules();const el=document.querySelector<HTMLElement>("[data-nuz-summary]");if(el)el.textContent=rules.length?`${rules.length} REGOLE · ${rules.map(r=>labels[r]).join(" · ")}`:"NESSUNA REGOLA";}

export function setupNuzlocke(game:NuzGame){
  game.nuzlockeActive??=false;game.nuzlockeGraveyard??=[];game.nuzlockeRules??=["permadeath"];game.nuzlockeRecruitCount??=0;
  const originalStart=game.start.bind(game);game.start=()=>{originalStart();game.nuzlockeGraveyard=[];game.nuzlockeRecruitCount=0;};

  const originalSelect=game.selectMapNode.bind(game);
  game.selectMapNode=(id:string)=>{
    if(!game.nuzlockeActive){originalSelect(id);return;}
    const available=game.availableMapNodes;
    let target=available.find(n=>n.id===id);
    if(game.nuzlockeRules.includes("randomPath")&&available.length){target=available[Math.floor(Math.random()*available.length)];id=target.id;}
    if(game.nuzlockeRules.includes("eliteMandatory")){const elite=available.find(n=>n.type==="elite");if(elite){target=elite;id=elite.id;}}
    if(!target)return;
    if(target.type==="recruit"&&(game.nuzlockeRules.includes("noRecruit")||(game.nuzlockeRules.includes("limitedRecruit")&&game.nuzlockeRecruitCount>=1))) { game.currentMapNodeId=id;game.currentNode=target.row;target.visited=true;game.message=game.nuzlockeRules.includes("noRecruit")?"NUZLOCKE: TEAM BLOCCATO.":"NUZLOCKE: RECLUTAMENTO GIÀ UTILIZZATO.";return; }
    if((target.type==="rest"||target.type==="fullRest")&&game.nuzlockeRules.includes("noRest")){game.currentMapNodeId=id;game.currentNode=target.row;target.visited=true;game.message="NUZLOCKE: PAUSA VIETATA.";return;}
    const hp=game.team.map(d=>d.hp),stress=game.team.map(d=>d.stress);
    originalSelect(id);
    if(target.type==="rest"||target.type==="fullRest"){
      if(game.nuzlockeRules.includes("noHealing"))game.team.forEach((d,i)=>d.hp=hp[i]);
      if(game.nuzlockeRules.includes("noStressRecovery"))game.team.forEach((d,i)=>d.stress=stress[i]);
      if(game.nuzlockeRules.includes("noBurnoutRecovery"))game.team.forEach((d,i)=>{if(stress[i]>=100)d.stress=100;});
    }
  };

  const originalRecruit=game.confirmRecruitment.bind(game);game.confirmRecruitment=()=>{if(game.nuzlockeActive&&game.nuzlockeRules.includes("noRecruit"))return;if(game.nuzlockeActive&&game.nuzlockeRules.includes("limitedRecruit")&&game.nuzlockeRecruitCount>=1)return;const before=game.team.map(d=>d.id).join("|");const old=game.team.length;originalRecruit();if(game.nuzlockeActive&&before!==game.team.map(d=>d.id).join("|"))game.nuzlockeRecruitCount++;if(game.nuzlockeActive&&game.nuzlockeRules.includes("noReplacement")&&old>=3)game.team=game.team;};

  const originalStore=game.storeItemReward.bind(game);game.storeItemReward=()=>{if(game.nuzlockeActive&&game.nuzlockeRules.includes("noBackpack")){game.message="NUZLOCKE: ZAINO VIETATO. EQUIPAGGIA L'OGGETTO SU UN DEVELOPER.";return;}originalStore();};
  const originalEquip=game.confirmItemReward.bind(game);game.confirmItemReward=()=>{if(game.nuzlockeActive&&game.nuzlockeRules.includes("oneEquipment")&&game.selectedItemTargetIndex!==null&&game.team[game.selectedItemTargetIndex]?.items.length>=1){game.message="NUZLOCKE: QUESTO DEVELOPER HA GIÀ IL SUO UNICO EQUIPMENT.";return;}originalEquip();};

  const originalChooseReward=game.chooseReward.bind(game);game.chooseReward=(index:number)=>{const card=game.reward;if(game.nuzlockeActive&&card&&game.nuzlockeRules.includes("noDuplicates")&&game.deck.some(c=>c.id===card.id)){game.reward=null;game.screen="map";game.message="NUZLOCKE: DOPPIONE RIFIUTATO.";return;}originalChooseReward(index);};

  const originalFinished=game.onCombatFinished.bind(game);game.onCombatFinished=()=>{originalFinished();if(!game.nuzlockeActive||!game.nuzlockeRules.includes("permadeath"))return;const lost=game.team.filter(d=>d.hp<=0);lost.forEach(d=>{if(!game.nuzlockeGraveyard.includes(d.id))game.nuzlockeGraveyard.push(d.id);});if(lost.length)game.team=game.team.filter(d=>d.hp>0);if(!game.team.length){game.screen="result";game.message="NUZLOCKE FAILED · TUTTO IL TEAM È ESAUSTO.";}};

  document.addEventListener("click",event=>{
    const target=event.target as HTMLElement;const overlay=target.closest<HTMLElement>("[data-nuzlocke-overlay]");const open=target.closest<HTMLElement>('[data-feature-open="nuzlocke"]');
    if(open){event.preventDefault();event.stopImmediatePropagation();document.querySelector("[data-nuzlocke-overlay]")?.remove();document.querySelector<HTMLElement>(".game-shell")?.insertAdjacentHTML("beforeend",markup());return;}
    if(target.closest("[data-nuz-close]")){event.preventDefault();event.stopImmediatePropagation();overlay?.remove();return;}
    const option=target.closest<HTMLLabelElement>(".nuzlocke-option");if(option){const input=option.querySelector<HTMLInputElement>("input");if(input)input.checked=!input.checked;option.classList.toggle("selected",!!input?.checked);event.preventDefault();event.stopImmediatePropagation();summary();return;}
    if(target.closest("[data-nuz-start]")){event.preventDefault();event.stopImmediatePropagation();game.nuzlockeRules=selectedRules();game.nuzlockeActive=true;game.nuzlockeGraveyard=[];game.nuzlockeRecruitCount=0;overlay?.remove();game.start();}
  },true);
}
