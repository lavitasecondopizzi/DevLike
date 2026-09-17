import type { Game } from "./game/Game";

function moveToolsToMap(game:Game){
  if(game.screen!=="map") return;
  const strip=document.querySelector<HTMLElement>(".map-panel .team-strip");
  if(!strip) return;

  // deck-fix owns the single GESTIONE TEAM block. Keep it inside the
  // team sidebar so it stays directly above the developer cards.
  const controls=document.querySelector<HTMLElement>(".map-panel .team-controls");
  if(controls && controls.parentElement!==strip) strip.prepend(controls);

  // Remove the obsolete secondary implementation if an older DOM survived.
  strip.querySelectorAll<HTMLElement>(".team-tools").forEach(el=>el.remove());

  // The renderer still creates the old header equipment button. It must not
  // compete with the team sidebar controls.
  document.querySelectorAll<HTMLElement>('.header-right [data-action="open-equipment"]').forEach(el=>el.remove());
}

export function setupTeamToolsFix(game:Game){
  const observer=new MutationObserver(()=>moveToolsToMap(game));
  observer.observe(document.body,{childList:true,subtree:true});

  // The injected ZAINO button is not present when render.bind() runs, so bind
  // it here explicitly and use the normal Game API. main.ts will re-render.
  document.addEventListener("click",event=>{
    const target=(event.target as HTMLElement).closest<HTMLElement>('.team-controls [data-action="open-equipment"]');
    if(!target || game.screen!=="map") return;
    event.preventDefault();
    event.stopPropagation();
    game.openEquipment();
  });

  moveToolsToMap(game);
}
