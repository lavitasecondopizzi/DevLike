import { Game } from "./game/Game";

function getGame() {
  return (window as Window & { __devlikeGame?: Game }).__devlikeGame;
}

function esc(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function showDeveloperPopup(index: number) {
  const game = getGame();
  const dev = game?.team[index];
  if (!dev) return;
  document.querySelector(".dev-detail-overlay")?.remove();
  const advantages = dev.advantages.map(x => `<span>${esc(x)}</span>`).join("");
  const weaknesses = dev.weaknesses.map(x => `<span>${esc(x)}</span>`).join("");
  const items = dev.items.map(x => `<div class="dev-detail-item"><b>${esc(x.name)}</b><small>+${x.codeBonus} COD · +${x.debugBonus} DEBUG</small></div>`).join("");
  const overlay = document.createElement("div");
  overlay.className = "dev-detail-overlay";
  overlay.innerHTML = `<div class="dev-detail-window" role="dialog" aria-modal="true"><button type="button" class="dev-detail-close" data-close-dev-detail>×</button><div class="dev-detail-kicker">${index === 0 ? "DEVELOPER ATTIVO" : "DEVELOPER IN PANCHINA"}</div><h2>${esc(dev.name)}</h2><div class="dev-detail-type">${esc(dev.classId)} · ${esc(dev.role)}</div><p>${esc(dev.description)}</p><div class="dev-detail-stats"><span>HP <b>${dev.hp}/${dev.maxHp}</b></span><span>STRESS <b>${dev.stress}/100</b></span><span>CODICE <b>${dev.code}</b></span><span>DEBUG <b>${dev.debug}</b></span></div><section><h3>ABILITÀ</h3><p>${esc(dev.passive)}</p></section><div class="dev-detail-columns"><section><h3>VANTAGGI</h3>${advantages || "<small>Nessuno</small>"}</section><section><h3>DEBOLEZZE</h3>${weaknesses || "<small>Nessuna</small>"}</section></div><section><h3>EQUIPAGGIAMENTO</h3>${items || "<small>Nessun oggetto equipaggiato.</small>"}</section></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    if (target === overlay || target.closest("[data-close-dev-detail]")) overlay.remove();
  });
}

function install() {
  document.addEventListener("click", event => {
    const target = event.target as HTMLElement;
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".team-strip .team-summary"));
    const card = target.closest<HTMLElement>(".team-strip .team-summary");
    if (!card) return;
    const index = cards.indexOf(card);
    if (index >= 0) showDeveloperPopup(index);
  });
}

install();
