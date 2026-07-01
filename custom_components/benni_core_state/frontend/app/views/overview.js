// Tab 1 — Übersicht: Master-Context, alle States als Kacheln, Bio-Direkt-Aktionen.
import { esc, chip } from "../styles.js";

const STATE_TILES = [
  ["presence_personal", "Presence Personal"],
  ["presence_household", "Presence Household"],
  ["presence_band", "Presence Band"],
  ["presence_transition", "Presence Transition"],
  ["presence_effective", "Presence Effective"],
  ["presence_effective_transition", "Effective Transition"],
  ["bio_state", "Bio State"],
  ["day_state", "Day State"],
  ["day_context", "Day Context"],
  ["activity_state", "Activity State"],
];

export function render(el, ctx) {
  const { store } = ctx;
  const s = store.status;
  if (!s || s._error || !s.available) {
    el.innerHTML = `<div class="empty"><span class="ico">⏳</span>${
      s && s._error ? "Status nicht verfügbar: " + esc(s._error)
        : "Lade Status … (Integration eingerichtet?)"}</div>`;
    return;
  }

  const st = s.state || {};
  const f = s.foundation || {};
  const tiles = STATE_TILES.map(([k, lbl]) =>
    `<div class="tile"><div class="lbl">${esc(lbl)}</div>
       <div class="big">${esc(st[k] ?? "—")}</div></div>`).join("");

  el.innerHTML = `
    <div class="grid cols-3">
      <div class="card" style="grid-column: span 2;">
        <h2><span class="ico">🧭</span>Master-Context</h2>
        <div class="tile">
          <div class="lbl">presence.bio.day_state.day_context.activity</div>
          <div class="big purple mono" style="font-size:16px">${esc(st.master_context ?? "—")}</div>
        </div>
        <div class="grid cols-4" style="margin-top:12px">${tiles}</div>
      </div>

      <div class="card">
        <h2><span class="ico">🧾</span>Status</h2>
        <div class="kv"><span class="k">Inputs bereit</span>
          <span class="v">${chip(f.total && f.ok === f.total ? "ok" : "warn", `${f.ok ?? 0}/${f.total ?? 0}`)}</span></div>
        <div class="kv"><span class="k">Preheat aktiv</span>
          <span class="v">${chip(st.preheat_active ? "ok" : "info", st.preheat_active ? "ja" : "nein")}</span></div>
        <div class="kv"><span class="k">Letztes Update</span>
          <span class="v">${chip(s.last_update_success ? "ok" : "warn", s.last_update_success ? "ok" : "Fehler")}</span></div>

        <h2 style="margin-top:16px"><span class="ico">⚡</span>Bio-Aktionen</h2>
        <div class="actions">
          <button class="btn" id="bSleep">😴 mark_sleep</button>
          <button class="btn" id="bWaking">🌅 waking</button>
          <button class="btn primary" id="bAwake">☀️ mark_awake</button>
        </div>
        <div class="subtext" style="margin-top:8px">Aktueller Bio-State: ${esc(st.bio_state ?? "—")}</div>
      </div>
    </div>`;

  const act = async (fn, label) => {
    try { await fn(); ctx.toast(`${label} ausgelöst`); setTimeout(ctx.refresh, 600); }
    catch (err) { ctx.toast("Fehler: " + (err.message || err)); }
  };
  el.querySelector("#bSleep").addEventListener("click", () => act(() => store.markSleep(), "mark_sleep"));
  el.querySelector("#bWaking").addEventListener("click", () => act(() => store.setBio("waking"), "waking"));
  el.querySelector("#bAwake").addEventListener("click", () => act(() => store.markAwake(), "mark_awake"));
}
