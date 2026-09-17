import type { Game } from "./game/Game";

function moveToolsToMap(game:Game){
  if(game.screen!=="map") return;
  const strip=document.querySelector<HTMLElement>(".map-panel .team-strip");
  if(!strip) return;

  let tools=strip.querySelector<HTMLElement>(".team-tools");
  if(!tools){
    tools=document.createElement("div");
    tools.className="team-tools";
    tools.innerHTML='<div class="team-tools-title">GESTIONE TEAM</div>';
    strip.prepend(tools);
  }

  const header=document.querySelector<HTMLElement>(".header-right");
  const equipment=header?.querySelector<HTMLElement>('[data-action="open-equipment"]');
  const deck=header?.querySelector<HTMLElement>("[data-open-deck]");

  if(equipment && equipment.parentElement!==tools) tools.appendChild(equipment);
  if(deck && deck.parentElement!==tools) tools.appendChild(deck);
}

export function setupTeamToolsFix(game:Game){
  const observer=new MutationObserver(()=>moveToolsToMap(game));
  observer.observe(document.body,{childList:true,subtree:true});
  setInterval(()=>moveToolsToMap(game),100);
}
