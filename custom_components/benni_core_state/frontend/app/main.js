// Core-State-Panel — Shell, Sidebar-Navigation, Router, Live-Refresh.
// Struktur 1:1 nach benni_light_policy (konsistentes Panel-Muster).
import { CSS, chip, esc } from "./styles.js";
import { Store } from "./store.js";
import * as overview from "./views/overview.js";
import * as diagnostics from "./views/diagnostics.js";

const NAV = [
  { id: "overview", label: "Übersicht", icon: "🧭", view: overview },
  { id: "diagnostics", label: "Diagnose", icon: "🩺", view: diagnostics },
];

class BcsApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._store = new Store();
    this._view = "overview";
    this._booted = false;
    this._hass = null;
    this._liveTimer = null;
    this._pollTimer = null;
  }

  set hass(v) {
    this._hass = v;
    this._store.hass = v;
    if (!this._booted) {
      this._boot();
    } else {
      clearTimeout(this._liveTimer);
      this._liveTimer = setTimeout(() => this._renderLive(), 250);
    }
  }
  get hass() { return this._hass; }

  connectedCallback() {
    this._pollTimer = setInterval(() => this.refresh(), 10000);
  }
  disconnectedCallback() {
    clearInterval(this._pollTimer);
    clearTimeout(this._liveTimer);
  }

  async _boot() {
    if (this._booted) return;
    this._booted = true;
    this._renderShell();
    await this.refresh();
  }

  async refresh() {
    try {
      await this._store.refresh();
    } catch (e) {
      /* transient */
    }
    this._renderLive();
  }

  _ctx() {
    return {
      store: this._store,
      hass: this._hass,
      navigate: (id) => this._navigate(id),
      refresh: () => this.refresh(),
      rerender: () => this._renderView(),
      toast: (m) => this._toast(m),
    };
  }

  _navigate(id) {
    this._view = id;
    this.shadowRoot.querySelectorAll(".nav button").forEach((b) =>
      b.classList.toggle("active", b.dataset.id === id));
    this._renderView();
  }

  _renderShell() {
    const navHtml = NAV.map((n) =>
      `<button data-id="${n.id}" class="${n.id === this._view ? "active" : ""}">
         <span class="ico">${n.icon}</span>${n.label}</button>`).join("");
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="app">
        <aside class="sidebar">
          <div class="brand">
            <div class="logo">🧠</div>
            <div><b>Benni Core State</b><small>Kontext-Zustand</small></div>
          </div>
          <nav class="nav">${navHtml}</nav>
          <div class="sb-foot" id="sbfoot">benni_core_state</div>
        </aside>
        <main class="main">
          <div class="head">
            <div><h1 id="vtitle">Übersicht</h1><p id="vsub"></p></div>
            <div class="chips" id="headchips"></div>
          </div>
          <div id="content"></div>
        </main>
      </div>`;
    this.shadowRoot.querySelectorAll(".nav button").forEach((b) =>
      b.addEventListener("click", () => this._navigate(b.dataset.id)));
  }

  _renderLive() {
    if (!this._booted) return;
    this._renderHead();
    this._renderView();
  }

  _renderHead() {
    const s = this._store.status;
    const chips = this.shadowRoot.getElementById("headchips");
    if (!chips) return;
    if (!s || s._error || !s.available) {
      chips.innerHTML = chip("warn", s && s._error ? "WS-Fehler" : "lädt …");
      return;
    }
    const st = s.state || {};
    const f = s.foundation || {};
    chips.innerHTML = [
      chip("info", `Route: ${s.profile_label ?? s.profile ?? "—"}`),
      chip(f.total && f.ok === f.total ? "ok" : "warn", `Inputs ${f.ok ?? 0}/${f.total ?? 0}`),
      chip("info", `Presence: ${st.presence_personal ?? "—"}`),
      chip("info", `Bio: ${st.bio_state ?? "—"}`),
      chip(st.preheat_active ? "ok" : "info", st.preheat_active ? "Preheat an" : "Preheat aus"),
    ].join("");
    const foot = this.shadowRoot.getElementById("sbfoot");
    if (foot) foot.textContent = `benni_core_state · ${s.profile_label ?? s.profile ?? ""}`;
  }

  _renderView() {
    const nav = NAV.find((n) => n.id === this._view) || NAV[0];
    const title = this.shadowRoot.getElementById("vtitle");
    const content = this.shadowRoot.getElementById("content");
    if (!content) return;
    title.textContent = nav.label;
    try {
      nav.view.render(content, this._ctx());
    } catch (e) {
      content.innerHTML = `<div class="empty"><span class="ico">⚠️</span>Render-Fehler: ${esc(e.message)}</div>`;
    }
  }

  _toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    this.shadowRoot.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }
}

if (!customElements.get("bcs-app")) {
  customElements.define("bcs-app", BcsApp);
}
