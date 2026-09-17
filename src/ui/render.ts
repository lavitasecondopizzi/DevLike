import { Game } from "../game/Game";
import type { Developer } from "../entities/types";
import { developers } from "../data/developers";

const root = document.querySelector<HTMLDivElement>("#app")!;

function pct(value: number, max: number) {
  return Math.round((value / max) * 100);
}

function devCard(dev: Developer, selected = false, selectable = false) {
  return `
    <button class="dev-card ${selected ? "selected" : ""}" ${selectable ? `data-dev="${dev.id}"` : ""}>
      <div class="dev-head"><b>${dev.name}</b><span>${dev.role}</span></div>
      <div>HP ${dev.hp}/${dev.maxHp}</div>
      <div class="bar"><i style="width:${pct(dev.hp, dev.maxHp)}%"></i></div>
      <div>Stress ${dev.stress}/100</div>
      <div class="stress"><i style="width:${dev.stress}%"></i></div>
      <small>CODICE ${dev.code} · DEBUG ${dev.debug}</small>
    </button>
  `;
}

export function render(game: Game) {
  root.innerHTML = `
    <main class="game-shell">
      <header>
        <div>
          <div class="logo">DEV<span>LIKE</span></div>
          <small>SHIP IT OR BURN OUT.</small>
        </div>
        <div class="header-stat">NODI ${game.currentNode}</div>
      </header>
      ${screen(game)}
    </main>
  `;
  bind(game);
}

function screen(game: Game) {
  if (game.screen === "menu") {
    return `
      <section class="panel center">
        <div class="pixel-icon">⌨</div>
        <h1>DEVLIKE</h1>
        <p>Un roguelike dove il vero boss è il cliente.</p>
        <button class="primary" data-action="start">NUOVO PROGETTO</button>
      </section>
    `;
  }

  if (game.screen === "team") {
    return `
      <section class="panel">
        <h2>ASSEMBLA IL TEAM</h2>
        <p>Scegli massimo 3 developer.</p>
        <div class="grid dev-grid">
          ${game.team.length === 0 ? "" : game.team.map(d => devCard(d, true)).join("")}
        </div>
        <div class="grid dev-grid">
          ${developers.map((d, i) => devCard(
            d,
            game.team.some(member => member.id === d.id),
            true
          )).join("")}
        </div>
        <div class="actions">
          <button class="primary" data-action="confirm-team" ${game.team.length === 0 ? "disabled" : ""}>INIZIA IL PROGETTO</button>
        </div>
      </section>
    `;
  }

  if (game.screen === "map") {
    return `
      <section class="panel">
        <div class="map-top">
          <div><b>PROGETTO #${game.normalBattles + 1}</b><br><small>Deadline in ${12 - game.normalBattles} nodi</small></div>
          <div class="deadline">DEADLINE<br><b>${"█".repeat(Math.max(0, 6-game.normalBattles))}${"░".repeat(Math.min(6,game.normalBattles))}</b></div>
        </div>
        <div class="path">
          <div class="node current">START</div>
          <div class="connector"></div>
          <div class="node">⚔ BUG</div>
          <div class="connector"></div>
          <div class="node">❓ EVENTO</div>
          <div class="connector"></div>
          <div class="node">⚔ CLIENTE</div>
          <div class="connector"></div>
          <div class="node boss">☠ DEADLINE</div>
        </div>
        <div class="team-strip">${game.team.map(d => devCard(d)).join("")}</div>
        <div class="actions">
          ${game.normalBattles < game.maxNormalBattles
            ? `<button class="primary" data-action="battle">AFFRONTA IL PROSSIMO PROBLEMA</button>`
            : `<button class="danger" data-action="boss">AFFRONTA LA DEADLINE</button>`}
        </div>
      </section>
    `;
  }

  if (game.screen === "combat" && game.combat) {
    const c = game.combat;
    return `
      <section class="battle">
        <div class="enemy panel">
          <div class="enemy-name">${c.enemy.name}</div>
          <div class="big-hp">${c.enemy.hp}/${c.enemy.maxHp} HP</div>
          <div class="bar"><i style="width:${pct(c.enemy.hp,c.enemy.maxHp)}%"></i></div>
          <div class="intent">INTENT: ${c.enemy.intent.label} · ${c.enemy.intent.damage} DMG · +${c.enemy.intent.stress} STRESS</div>
        </div>

        <div class="combat-area">
          <div class="active-dev panel">
            ${devCard(c.active, true)}
            <div class="energy">ENERGIA: ${"⚡".repeat(c.energy)}${"·".repeat(3-c.energy)}</div>
            <div class="combat-actions">
              <button data-action="code">CODA<br><small>1 ⚡</small></button>
              <button data-action="debug">DEBUG<br><small>2 ⚡</small></button>
              <button data-action="defend">DIFESA<br><small>1 ⚡</small></button>
            </div>
            <div class="hand">
              ${c.hand.map((card, i) => `
                <button class="card" data-card="${i}" ${card.cost > c.energy ? "disabled" : ""}>
                  <b>${card.name}</b>
                  <span>${card.cost} ⚡</span>
                  <small>${card.description}</small>
                </button>
              `).join("")}
            </div>
            <button class="end" data-action="end-turn">FINE TURNO</button>
          </div>

          <aside class="bench panel">
            <h3>PANCHINA</h3>
            ${c.team.map((d,i) => `
              <button class="bench-dev ${i===c.activeIndex ? "active":""}" data-switch="${i}" ${i===c.activeIndex || d.hp<=0 || d.stress>=100 ? "disabled":""}>
                ${d.name} · HP ${d.hp} · S ${d.stress}
              </button>
            `).join("")}
            <h3>LOG</h3>
            <div class="log">${c.log.slice(-8).reverse().map(x => `<div>${x}</div>`).join("")}</div>
          </aside>
        </div>
      </section>
    `;
  }

  if (game.screen === "reward") {
    const card = game.reward!;
    return `
      <section class="panel center">
        <h2>RICOMPENSA</h2>
        <p>Il progetto è quasi in fiamme. Scegli un Tool.</p>
        <button class="reward-card" data-action="reward">
          <b>${card.name}</b>
          <span>${card.cost} ⚡</span>
          <small>${card.description}</small>
        </button>
        <button data-action="map">CONTINUA</button>
      </section>
    `;
  }

  return `
    <section class="panel center result">
      <div class="pixel-icon">${game.message.includes("RIUSCITO") ? "✓" : "☠"}</div>
      <h1>${game.message}</h1>
      <p>${game.message.includes("RIUSCITO") ? "Il cliente non ha ancora chiesto una modifica." : "Il progetto è andato in produzione. Da qualche parte."}</p>
      <button class="primary" data-action="restart">NUOVO PROGETTO</button>
    </section>
  `;
}

function bind(game: Game) {
  root.querySelectorAll<HTMLElement>("[data-action]").forEach(el => {
    el.onclick = () => {
      const action = el.dataset.action;
      if (action === "start") game.start();
      if (action === "confirm-team") game.confirmTeam();
      if (action === "battle") game.enterRandomBattle();
      if (action === "boss") game.enterBoss();
      if (action === "code") game.combat?.basicAction("code");
      if (action === "debug") game.combat?.basicAction("debug");
      if (action === "defend") game.combat?.basicAction("defend");
      if (action === "end-turn") game.combat?.endTurn();
      if (action === "reward") game.chooseReward(0);
      if (action === "restart") game.restart();
      render(game);
      if (game.screen === "combat" && game.combat?.result !== "ongoing") {
        game.onCombatFinished();
        render(game);
      }
    };
  });

  root.querySelectorAll<HTMLElement>("[data-dev]").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.dev!;
      const ids = ["junior","senior","devops"];
      const index = ids.indexOf(id);
      if (index >= 0) game.toggleDeveloper(index);
      render(game);
    };
  });

  root.querySelectorAll<HTMLElement>("[data-card]").forEach(el => {
    el.onclick = () => {
      game.combat?.playCard(Number(el.dataset.card));
      render(game);
      if (game.combat?.result !== "ongoing") {
        game.onCombatFinished();
        render(game);
      }
    };
  });

  root.querySelectorAll<HTMLElement>("[data-switch]").forEach(el => {
    el.onclick = () => {
      game.combat?.switchDeveloper(Number(el.dataset.switch));
      render(game);
    };
  });

  root.querySelector<HTMLElement>('[data-action="map"]')?.addEventListener("click", () => {
    game.screen = "map";
    render(game);
  });
}
