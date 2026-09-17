export function setupCodexFix(){
  let preserveSelection=false;
  let observer:MutationObserver|undefined;

  const clearCodex=()=>{
    const overlay=document.querySelector<HTMLElement>('[data-feature-overlay="codex"]');
    if(!overlay)return;
    overlay.querySelectorAll<HTMLElement>('.codex-entry.selected').forEach(x=>x.classList.remove('selected'));
    const detail=overlay.querySelector<HTMLElement>('[data-codex-detail]');
    if(detail)detail.innerHTML='<div class="codex-empty">SELEZIONA UN RECORD</div>';
  };

  document.addEventListener('click',event=>{
    const target=event.target as HTMLElement;
    if(target.closest('[data-codex-entry]')){
      preserveSelection=true;
      window.setTimeout(()=>{preserveSelection=false;},100);
    }else if(target.closest('[data-codex-category]')){
      preserveSelection=false;
    }
  },true);

  observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      for(const node of Array.from(mutation.addedNodes)){
        if(!(node instanceof HTMLElement))continue;
        if(node.matches('[data-feature-overlay="codex"]')||node.querySelector('[data-feature-overlay="codex"]')){
          window.setTimeout(clearCodex,0);
          return;
        }
      }
    }
    if(!preserveSelection){
      const overlay=document.querySelector<HTMLElement>('[data-feature-overlay="codex"]');
      if(overlay && mutations.some(m=>m.type==='childList' && (m.target as HTMLElement).closest?.('[data-codex-list],[data-codex-detail]'))){
        window.setTimeout(clearCodex,0);
      }
    }
  });
  observer.observe(document.getElementById('app')!,{childList:true,subtree:true});
}
