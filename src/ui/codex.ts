import { developers } from "../data/developers";
import { enemies } from "../data/enemies";
import { rewardCards, startingDeck } from "../data/cards";
import { rewardItems } from "../data/items";
import type { Card, Developer, Enemy, Item } from "../entities/types";
import { renderPokerCard } from "../card-view";

type CodexCategory = "developers" | "enemies" | "cards" | "items";
type CodexEntry = { id:string; name:string; subtitle:string; details:string; tier?:number };

const esc = (v:string) => v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

function cardEffect(card:Card){
  const labels:Record<string,string>={damage:"DANNI",heal:"CURA",stress:"STRESS",codeBoost:"CODICE",block:"DIFESA",removeStress:"RIDUZIONE STRESS"};
  const e=card.effect;
  return `${labels[e.type]??e.type}: ${e.amount}${e.type==="codeBoost"?"%":""}`;
}

function statGrid(stats:Array<[string,string]>){
  return `<div class="codex-stats">${stats.map(([label,value])=>`<div><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("")}</div>`;
}

function listBlock(title:string, values:string[]){
  return `<section class="codex-block"><h3>${esc(title)}</h3><div class="codex-list-values">${values.length?values.map(v=>`<p>${esc(v)}</p>`).join(""):"<p>Nessun dato.</p>"}</div></section>`;
}

function developerDetails(d:Developer){
  return `<header class="codex-detail-head"><div><span class="codex-kicker">DEVELOPER · TIER ${d.tier}</span><h2>${esc(d.name)}</h2><p>${esc(d.role)}</p></div></header>
  <p class="codex-description">${esc(d.description)}</p>
  ${statGrid([["TIER",String(d.tier)],["HP",String(d.maxHp)],["CODICE",String(d.code)],["DEBUG",String(d.debug)],["STRESS MAX",String(d.maxStress)]])}
  <div class="codex-detail-grid"><section class="codex-block codex-wide"><h3>ABILITÀ PASSIVA</h3><p>${esc(d.passive)}</p></section>
  ${listBlock("VANTAGGI",d.advantages)}${listBlock("DEBOLEZZE",d.weaknesses)}</div>`;
}

function enemyDetails(e:Enemy){
  return `<header class="codex-detail-head"><div><span class="codex-kicker">NEMICO · TIER ${e.tier} · ${esc(e.type)}</span><h2>${esc(e.name)}</h2></div></header>
  <p class="codex-description">${esc(e.description)}</p>
  ${statGrid([["TIER",String(e.tier)],["HP",String(e.maxHp)],["CODICE",String(e.code)],["DEBUG",String(e.debug)],["DANNI",String(e.intent.damage)],["STRESS",`+${e.intent.stress}`]])}
  <div class="codex-detail-grid"><section class="codex-block codex-wide"><h3>ABILITÀ PASSIVA</h3><p>${esc(e.passive)}</p></section>
  <section class="codex-block codex-wide"><h3>INTENZIONE</h3><p><b>${esc(e.intent.label)}</b> · ${e.intent.damage} danni · +${e.intent.stress} Stress</p></section>
  ${listBlock("VANTAGGI",e.advantages)}${listBlock("DEBOLEZZE",e.weaknesses)}</div>`;
}

function cardDetails(c:Card){
  return `<div class="codex-card-detail"><div class="codex-card-preview">${renderPokerCard(c)}</div><div class="codex-card-info">
    <span class="codex-kicker">TOOL · TIER ${c.tier??1}</span><h2>${esc(c.name)}</h2><p class="codex-description">${esc(c.description)}</p>
    ${statGrid([["TIER",String(c.tier??1)],["COSTO",`${c.cost} ⚡`],["EFFETTO",cardEffect(c)]])}
    <section class="codex-block"><h3>EFFETTO TECNICO</h3><p>${esc(cardEffect(c))}</p></section>
  </div></div>`;
}

function itemDetails(i:Item){
  return `<header class="codex-detail-head"><div><span class="codex-kicker">OGGETTO · TIER ${i.tier}</span><h2>${esc(i.name)}</h2></div></header>
  <p class="codex-description">${esc(i.description)}</p>
  ${statGrid([["TIER",String(i.tier)],["CODICE",i.codeBonus?"+${i.codeBonus}":"—"],["DEBUG",i.debugBonus?"+${i.debugBonus}":"—"],["POTENZA",String(i.codeBonus+i.debugBonus)],["SLOT","1"]])}
  <section class="codex-block"><h3>EFFETTO</h3><p>${i.codeBonus?"+${i.codeBonus} CODICE":"Nessun bonus CODICE"} · ${i.debugBonus?"+${i.debugBonus} DEBUG":"Nessun bonus DEBUG"}</p></section>`;
}

function dataForCategory(category:CodexCategory):CodexEntry[]{
  if(category==="developers") return [...developers].sort((a,b)=>a.tier-b.tier||a.name.localeCompare(b.name,"it")).map(d=>({id:d.id,name:d.name,tier:d.tier,subtitle:`T${d.tier} · ${d.role} · ${d.code} COD / ${d.debug} DEBUG`,details:developerDetails(d)}));
  if(category==="enemies") return [...enemies].sort((a,b)=>a.tier-b.tier||a.name.localeCompare(b.name,"it")).map(e=>({id:e.id,name:e.name,tier:e.tier,subtitle:`T${e.tier} · ${e.type}`,details:enemyDetails(e)}));
  if(category==="cards"){
    const all=[...startingDeck,...rewardCards].filter((c,i,arr)=>arr.findIndex(x=>x.id===c.id)===i);
    return all.sort((a,b)=>(a.tier??1)-(b.tier??1)||a.name.localeCompare(b.name,"it")).map(c=>({id:c.id,name:c.name,tier:c.tier??1,subtitle:`T${c.tier??1} · ${c.cost} ⚡ · ${cardEffect(c)}`,details:cardDetails(c)}));
  }
  return [...rewardItems].sort((a,b)=>a.tier-b.tier||a.name.localeCompare(b.name,"it")).map(i=>({id:i.id,name:i.name,tier:i.tier,subtitle:`T${i.tier} · +${i.codeBonus} COD · +${i.debugBonus} DEBUG`,details:itemDetails(i)}));
}

function codexRefresh(overlay:HTMLElement,category:CodexCategory,selectedId?:string,query=""){
  const list=overlay.querySelector<HTMLElement>("[data-codex-list]");
  const detail=overlay.querySelector<HTMLElement>("[data-codex-detail]");
  const count=overlay.querySelector<HTMLElement>("[data-codex-count]");
  const search=overlay.querySelector<HTMLInputElement>("[data-codex-search]");
  const tabs=overlay.querySelectorAll<HTMLButtonElement>("[data-codex-category]");
  const data=dataForCategory(category);
  const normalized=query.trim().toLocaleLowerCase("it");
  const filtered=normalized?data.filter(e=>`${e.name} ${e.subtitle}`.toLocaleLowerCase("it").includes(normalized)):data;
  const selected=data.find(e=>e.id===selectedId)||filtered[0]||data[0];
  tabs.forEach(t=>t.classList.toggle("active",t.dataset.codexCategory===category));
  if(search&&search.value!==query) search.value=query;
  if(count) count.textContent=`${filtered.length}/${data.length}`;
  if(list){
    let lastTier:number|undefined;
    const markup:string[]=[];
    filtered.forEach(entry=>{
      if(entry.tier!==undefined&&entry.tier!==lastTier){lastTier=entry.tier;markup.push(`<div class="codex-tier-divider"><span>TIER ${entry.tier}</span></div>`);}
      markup.push(`<button type="button" class="codex-entry ${entry.id===selected?.id?"selected":""}" data-codex-entry="${esc(entry.id)}"><b>${esc(entry.name)}</b><small>${esc(entry.subtitle)}</small></button>`);
    });
    list.innerHTML=markup.join("")||'<div class="codex-no-results">NESSUN RISULTATO</div>';
  }
  if(detail) detail.innerHTML=selected?.details||'<div class="codex-empty">NESSUN RECORD</div>';
}

export function codexMarkup(){
  return `<div class="feature-overlay codex-overlay" data-feature-overlay="codex"><div class="feature-window codex-window">
    <div class="feature-titlebar"><div><span class="codex-kicker">DATABASE OPERATIVO</span><h2>CODEX DEVLIKE</h2></div><button type="button" class="feature-close" data-feature-close>CHIUDI ×</button></div>
    <nav class="codex-tabs"><button type="button" class="active" data-codex-category="developers">DEVELOPER</button><button type="button" data-codex-category="enemies">NEMICI</button><button type="button" data-codex-category="cards">TOOL</button><button type="button" data-codex-category="items">OGGETTI</button></nav>
    <div class="codex-layout"><aside class="codex-list-panel"><div class="codex-list-toolbar"><label for="codex-search">CERCA</label><input id="codex-search" type="search" data-codex-search placeholder="Nome o statistica..." autocomplete="off"><span data-codex-count>0/0</span></div><div class="codex-list" data-codex-list></div></aside><article class="codex-detail" data-codex-detail></article></div>
  </div></div>`;
}

export function setupCodex(){
  const root=globalThis as typeof globalThis & {_devlikeCodexReady?:boolean};
  if(root._devlikeCodexReady)return;
  root._devlikeCodexReady=true;
  document.addEventListener("click",event=>{
    const target=event.target as HTMLElement;
    const open=target.closest<HTMLElement>('[data-feature-open="codex"]');
    if(open){event.preventDefault();event.stopImmediatePropagation();document.querySelector('[data-feature-overlay="codex"]')?.remove();document.querySelector<HTMLElement>(".game-shell")?.insertAdjacentHTML("beforeend",codexMarkup());const overlay=document.querySelector<HTMLElement>('[data-feature-overlay="codex"]');if(overlay)codexRefresh(overlay,"developers");return;}
    const overlay=target.closest<HTMLElement>('[data-feature-overlay="codex"]');
    if(!overlay)return;
    const close=target.closest<HTMLElement>("[data-feature-close]");
    if(close){event.preventDefault();event.stopImmediatePropagation();overlay.remove();return;}
    const tab=target.closest<HTMLButtonElement>("[data-codex-category]");
    if(tab){event.preventDefault();event.stopImmediatePropagation();codexRefresh(overlay,(tab.dataset.codexCategory as CodexCategory)||"developers");return;}
    const entry=target.closest<HTMLButtonElement>("[data-codex-entry]");
    if(entry){event.preventDefault();event.stopImmediatePropagation();const category=(overlay.querySelector<HTMLButtonElement>("[data-codex-category].active")?.dataset.codexCategory as CodexCategory)||"developers";const query=overlay.querySelector<HTMLInputElement>("[data-codex-search]")?.value??"";codexRefresh(overlay,category,entry.dataset.codexEntry,query);}
  },true);
  document.addEventListener("input",event=>{
    const input=(event.target as HTMLElement).closest<HTMLInputElement>("[data-codex-search]");
    if(!input)return;
    const overlay=input.closest<HTMLElement>('[data-feature-overlay="codex"]');
    if(!overlay)return;
    const category=(overlay.querySelector<HTMLButtonElement>("[data-codex-category].active")?.dataset.codexCategory as CodexCategory)||"developers";
    codexRefresh(overlay,category,undefined,input.value);
  });
  document.addEventListener("keydown",event=>{
    if(event.key!=="Escape")return;
    document.querySelector<HTMLElement>('[data-feature-overlay="codex"]')?.remove();
  });
}
