import { developers } from "../data/developers";
import { enemies } from "../data/enemies";
import { rewardCards, startingDeck } from "../data/cards";
import { rewardItems } from "../data/items";
import type { Card, Developer, Enemy, Item } from "../entities/types";
import { renderPokerCard } from "../card-view";

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function cardEffect(card: Card) {
  const e = card.effect;
  const labels: Record<string, string> = {
    damage: "DANNI",
    heal: "CURA",
    stress: "STRESS",
    codeBoost: "CODICE",
    block: "DIFESA",
    removeStress: "RIDUZIONE STRESS"
  };
  return `${labels[e.type] ?? e.type}: ${e.amount}${e.type === "codeBoost" ? "%" : ""}`;
}

function developerDetails(d: Developer) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">DEVELOPER · TIER ${d.tier}</span><h2>${esc(d.name)}</h2><b>${esc(d.role)}</b></div></div>
    <p class="codex-description">${esc(d.description)}</p>
    <div class="codex-stats"><span>TIER <b>${d.tier}</b></span><span>HP <b>${d.maxHp}</b></span><span>CODICE <b>${d.code}</b></span><span>DEBUG <b>${d.debug}</b></span><span>STRESS MAX <b>${d.maxStress}</b></span></div>
    <section class="codex-block"><h3>ABILITÀ</h3><p>${esc(d.passive)}</p></section>
    <div class="codex-two"><section class="codex-block"><h3>VANTAGGI</h3>${d.advantages.map(x => `<p>${esc(x)}</p>`).join("")}</section><section class="codex-block"><h3>DEBOLEZZE</h3>${d.weaknesses.map(x => `<p>${esc(x)}</p>`).join("")}</section></div>`;
}

function enemyDetails(e: Enemy) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">NEMICO · TIER ${e.tier} · ${esc(e.type)} · VALORI BASE</span><h2>${esc(e.name)}</h2></div></div>
    <p class="codex-description">${esc(e.description)}</p>
    <div class="codex-stats"><span>TIER <b>${e.tier}</b></span><span>HP <b>${e.maxHp}</b></span><span>CODICE <b>${e.code}</b></span><span>DEBUG <b>${e.debug}</b></span><span>DMG <b>${e.intent.damage}</b></span><span>STRESS <b>+${e.intent.stress}</b></span></div>
    <section class="codex-block"><h3>ABILITÀ</h3><p>${esc(e.passive)}</p></section>
    <section class="codex-block"><h3>INTENZIONE</h3><p>${esc(e.intent.label)} · ${e.intent.damage} danni · +${e.intent.stress} Stress</p></section>
    <div class="codex-two"><section class="codex-block"><h3>VANTAGGI</h3>${e.advantages.map(x => `<p>${esc(x)}</p>`).join("")}</section><section class="codex-block"><h3>DEBOLEZZE</h3>${e.weaknesses.map(x => `<p>${esc(x)}</p>`).join("")}</section></div>`;
}

function cardDetails(c: Card) {
  return `<div class="codex-card-detail"><div class="codex-card-preview">${renderPokerCard(c)}</div><div class="codex-card-info"><span class="codex-kicker">DETTAGLIO TOOL · TIER ${c.tier ?? 1}</span><h2>${esc(c.name)}</h2><p class="codex-description">${esc(c.description)}</p><div class="codex-stats"><span>TIER <b>${c.tier ?? 1}</b></span><span>COSTO <b>${c.cost} ⚡</b></span><span>EFFETTO <b>${esc(cardEffect(c))}</b></span></div><section class="codex-block"><h3>EFFETTO TECNICO</h3><p>${esc(cardEffect(c))}</p></section></div></div>`;
}

function itemDetails(i: Item) {
  return `<div class="codex-detail-head"><div><span class="codex-kicker">OGGETTO · TIER ${i.tier}</span><h2>${esc(i.name)}</h2></div></div><p class="codex-description">${esc(i.description)}</p><div class="codex-stats"><span>TIER <b>${i.tier}</b></span><span>CODICE <b>+${i.codeBonus}</b></span><span>DEBUG <b>+${i.debugBonus}</b></span><span>POTENZA <b>${i.codeBonus + i.debugBonus}</b></span><span>SLOT <b>1</b></span></div><section class="codex-block"><h3>EFFETTO</h3><p>${i.codeBonus ? `+${i.codeBonus} CODICE` : "Nessun bonus CODICE"} · ${i.debugBonus ? `+${i.debugBonus} DEBUG` : "Nessun bonus DEBUG"}</p></section>`;
}

function dataForCategory(category: string): Array<{ id: string; name: string; subtitle: string; details: string; tier?: number }> {
  if (category === "developers") {
    return [...developers]
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, "it"))
      .map(d => ({ id: d.id, name: d.name, tier: d.tier, subtitle: `T${d.tier} · ${d.role} · ${d.code} COD / ${d.debug} DEBUG`, details: developerDetails(d) }));
  }
  if (category === "enemies") {
    return [...enemies]
      .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, "it"))
      .map(e => ({ id: e.id, name: e.name, tier: e.tier, subtitle: `T${e.tier} · ${e.type}`, details: enemyDetails(e) }));
  }
  if (category === "cards") {
    const all = [...startingDeck, ...rewardCards].filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
    return all
      .sort((a, b) => (a.tier ?? 1) - (b.tier ?? 1) || a.name.localeCompare(b.name, "it"))
      .map(c => ({ id: c.id, name: c.name, tier: c.tier ?? 1, subtitle: `T${c.tier ?? 1} · ${c.cost} ⚡ · ${cardEffect(c)}`, details: cardDetails(c) }));
  }
  return [...rewardItems]
    .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, "it"))
    .map(i => ({ id: i.id, name: i.name, tier: i.tier, subtitle: `T${i.tier} · +${i.codeBonus} COD · +${i.debugBonus} DEBUG`, details: itemDetails(i) }));
}

function codexRefresh(category: string, selectedId?: string) {
  const overlay = document.querySelector<HTMLElement>('[data-feature-overlay="codex"]');
  if (!overlay) return;
  const list = overlay.querySelector<HTMLElement>("[data-codex-list]");
  const detail = overlay.querySelector<HTMLElement>("[data-codex-detail]");
  const tabs = overlay.querySelectorAll<HTMLButtonElement>("[data-codex-category]");
  const data = dataForCategory(category);
  const selected = data.find((entry) => entry.id === selectedId) ?? data[0];
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.codexCategory === category));
  if (list) {
    let lastTier: number | undefined;
    const markup: string[] = [];
    data.forEach((entry) => {
      if (entry.tier !== undefined && entry.tier !== lastTier) {
        lastTier = entry.tier;
        markup.push(`<div class="codex-tier-divider"><span>TIER ${entry.tier}</span></div>`);
      }
      markup.push(`<button type="button" class="codex-entry ${entry.id === selected?.id ? "selected" : ""}" data-codex-entry="${esc(entry.id)}"><b>${esc(entry.name)}</b><small>${esc(entry.subtitle)}</small></button>`);
    });
    list.innerHTML = markup.join("");
  }
  if (detail) detail.innerHTML = selected?.details ?? `<div class="codex-empty">NESSUN RECORD</div>`;
}

export function codexMarkup() {
  return `<div class="feature-overlay codex-overlay" data-feature-overlay="codex"><div class="feature-window codex-window"><div class="feature-titlebar"><div><span class="codex-kicker">DATABASE</span><h2>CODEX DEVLIKE</h2></div><button type="button" class="feature-close" data-feature-close>CHIUDI ×</button></div><nav class="codex-tabs"><button type="button" class="active" data-codex-category="developers">DEVELOPER</button><button type="button" data-codex-category="enemies">NEMICI</button><button type="button" data-codex-category="cards">TOOL</button><button type="button" data-codex-category="items">OGGETTI</button></nav><div class="codex-layout"><aside class="codex-list" data-codex-list></aside><article class="codex-detail" data-codex-detail></article></div></div></div>`;
}
export function setupCodex() {
  document.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const open = target.closest<HTMLElement>('[data-feature-open="codex"]');
    if (open) {
      event.preventDefault();
      event.stopImmediatePropagation();
      document.querySelector('[data-feature-overlay="codex"]')?.remove();
      document.querySelector<HTMLElement>(".game-shell")?.insertAdjacentHTML("beforeend", codexMarkup());
      codexRefresh("developers");
      return;
    }
    const overlay = target.closest<HTMLElement>('[data-feature-overlay="codex"]');
    if (!overlay) return;
    const close = target.closest<HTMLElement>("[data-feature-close]");
    if (close) {
      event.preventDefault();
      event.stopImmediatePropagation();
      overlay.remove();
      return;
    }
    const category = target.closest<HTMLButtonElement>("[data-codex-category]");
    if (category) {
      event.preventDefault();
      event.stopImmediatePropagation();
      codexRefresh(category.dataset.codexCategory ?? "developers");
      return;
    }
    const entry = target.closest<HTMLButtonElement>("[data-codex-entry]");
    if (entry) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const current = overlay.querySelector<HTMLButtonElement>("[data-codex-category].active")?.dataset.codexCategory ?? "developers";
      codexRefresh(current, entry.dataset.codexEntry);
    }
  }, true);
}
