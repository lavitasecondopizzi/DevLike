import type { Card } from "./entities/types";
import type { Game } from "./game/Game";

type DeckGame = Game & {
  cardCollection?: Card[];
  nuzlockeActive?: boolean;
  nuzlockeRules?: string[];
};

const esc = (value:string) => value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

function game():DeckGame|undefined {
  return (window as Window & { __devlikeGame?: DeckGame }).__devlikeGame;
}

function ensureCollection(g:DeckGame){
  if(!g.cardCollection) g.cardCollection = (g.deck ?? []).map(card => ({...card}));
}

function locked(g:DeckGame){return !!g.nuzlockeActive && !!g.nuzlockeRules?.includes("deckLock");}
function removalLocked(g:DeckGame){return locked(g) || (!!g.nuzlockeActive && !!g.nuzlockeRules?.includes("noCardRemoval"));}

function cardHtml(card:Card, action:string, index:number, disabled=false){
  const tier = card.tier ?? 1;
  return `<article class="deck-card ${disabled?"disabled":""}">
    <div class="deck-card-head"><b>${esc(card.name)}</b><strong>${card.cost} ⚡</strong></div>
    <div class="deck-card-meta"><span>TIER ${tier}</span><span>${esc(card.effect.type.toUpperCase())}</span></div>
    <p>${esc(card.description)}</p>
    <button type="button" data-deck-action="${action}" data-deck-index="${index}" ${disabled?"disabled":""}>${action==="remove"?"RIMUOVI DAL MAZZO":"AGGIUNGI AL MAZZO"}</button>
  </article>`;
}

function renderModal(){
  const g=game();
  if(!g)return;
  ensureCollection(g);
  const counts=new Map<string,{card:Card,owned:number,used:number}>();
  g.cardCollection!.forEach(card=>{
    const current=counts.get(card.id);
    if(current) current.owned++;
    else counts.set(card.id,{card,owned:1,used:0});
  });
  g.deck.forEach(card=>{const current=counts.get(card.id);if(current)current.used++;});
  const collection=[...counts.values()];
  const deckLocked=locked(g);
  const noRemoval=removalLocked(g);
  const deckCards=g.deck.map((card,index)=>cardHtml(card,"remove",index,noRemoval || g.deck.length<=5)).join("");
  const collectionCards=collection.map(({card,owned,used})=>{
    const canAdd=!deckLocked && g.deck.length<20 && used<owned;
    const sourceIndex=g.cardCollection!.findIndex(item=>item.id===card.id);
    return `<article class="deck-card collection-card ${!canAdd?"disabled":""}">
      <div class="deck-card-head"><b>${esc(card.name)}</b><strong>${card.cost} ⚡</strong></div>
      <div class="deck-card-meta"><span>TIER ${card.tier??1}</span><span>POSSEDUTE ${owned}</span><span>MAZZO ${used}</span></div>
      <p>${esc(card.description)}</p>
      <button type="button" data-deck-action="add" data-deck-index="${Math.max(0,sourceIndex)}" ${canAdd?"":"disabled"}>AGGIUNGI AL MAZZO</button>
    </article>`;
  }).join("");
  const message=deckLocked?"NUZLOCKE: DECK LOCK ATTIVO — il mazzo non può essere modificato.":noRemoval?"NUZLOCKE: RIMOZIONE CARTE VIETATA.":"Puoi costruire il mazzo tra un combattimento e l'altro. Minimo 5 · massimo 20 carte.";
  const overlay=document.createElement("div");
  overlay.className="deck-overlay";
  overlay.innerHTML=`<section class="deck-modal">
    <header class="deck-modal-header"><div><h2>MAZZO & COLLEZIONE</h2><p>${message}</p></div><button type="button" class="deck-close" data-deck-action="close">×</button></header>
    <div class="deck-summary"><div><b>MAZZO</b><strong>${g.deck.length}/20</strong></div><div><b>CARTE POSSEDUTE</b><strong>${g.cardCollection!.length}</strong></div><div><b>SPAZIO MINIMO</b><strong>5</strong></div></div>
    <div class="deck-columns"><section><div class="deck-section-title"><h3>MAZZO ATTIVO</h3><span>${g.deck.length} CARTE</span></div><div class="deck-grid">${deckCards || "<p class=\"deck-empty\">Il mazzo è vuoto.</p>"}</div></section><section><div class="deck-section-title"><h3>COLLEZIONE</h3><span>${collection.length} TIPI · ${g.cardCollection!.length} COPIE</span></div><div class="deck-grid">${collectionCards || "<p class=\"deck-empty\">Nessuna carta posseduta.</p>"}</div></section></div>
    <footer class="deck-modal-footer"><span>Le carte rimosse restano nella collezione e possono essere reinserite.</span><button type="button" class="primary" data-deck-action="close">TORNA AL GIOCO</button></footer>
  </section>`;
  document.body.appendChild(overlay);

  overlay.addEventListener("click",event=>{
    const target=(event.target as HTMLElement).closest<HTMLElement>("[data-deck-action]");
    if(!target)return;
    const action=target.dataset.deckAction;
    if(action==="close"){overlay.remove();return;}
    const index=Number(target.dataset.deckIndex);
    if(action==="remove" && !noRemoval && g.deck.length>5) g.deck.splice(index,1);
    if(action==="add" && !deckLocked && g.deck.length<20){
      const card=g.cardCollection![index];
      if(card){
        const owned=g.cardCollection!.filter(item=>item.id===card.id).length;
        const used=g.deck.filter(item=>item.id===card.id).length;
        if(used<owned)g.deck.push({...card});
      }
    }
    overlay.remove();renderModal();
  });
}

function injectButton(){
  const g=game();
  if(!g || g.screen==="menu" || g.screen==="team" || g.screen==="result")return;
  const header=document.querySelector<HTMLElement>(".header-right");
  if(!header || header.querySelector("[data-open-deck]"))return;
  const button=document.createElement("button");
  button.type="button";
  button.className="equipment-button deck-open-button";
  button.dataset.openDeck="true";
  button.textContent=`COLLEZIONE · ${g.cardCollection?.length ?? g.deck.length}`;
  header.prepend(button);
}

export function setupDeckFix(g:Game){
  const dg=g as DeckGame;
  const originalStart=g.start.bind(g);
  g.start=()=>{originalStart();ensureCollection(dg);};
  const originalConfirm=g.confirmStartingDeveloper.bind(g);
  g.confirmStartingDeveloper=()=>{originalConfirm();dg.cardCollection=(dg.deck??[]).map(card=>({...card}));};
  const originalReward=g.chooseReward.bind(g);
  g.chooseReward=(index:number)=>{const before=dg.deck.length;originalReward(index);ensureCollection(dg);if(dg.deck.length>before){const added=dg.deck[dg.deck.length-1];if(added)dg.cardCollection!.push({...added});}};

  document.addEventListener("click",event=>{
    const target=(event.target as HTMLElement).closest<HTMLElement>("[data-open-deck]");
    if(!target)return;
    event.preventDefault();
    event.stopPropagation();
    renderModal();
  });

  injectButton();
  setInterval(injectButton,100);
}
