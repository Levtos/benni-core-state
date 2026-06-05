// Tab 2 — Diagnose: Readiness der Eingangs-Entities + berechnete Attribute.
import { esc, chip } from "../styles.js";

export function render(el, ctx) {
  const { store } = ctx;
  const s = store.status;
  if (!s || s._error) {
    el.innerHTML = `<div class="empty"><span class="ico">⏳</span>${
      s && s._error ? esc(s._error) : "Lade …"}</div>`;
    return;
  }

  const inputs = s.inputs || [];
  const rows = inputs.length
    ? inputs.map((r) => `<tr>
        <td>${esc(r.label)}</td>
        <td class="mono">${esc(r.entity_id)}</td>
        <td>${esc(r.value ?? "—")}</td>
        <td>${chip(r.available ? "ok" : "warn", r.available ? "ok" : "fehlt")}</td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="muted">Keine Eingangs-Entities konfiguriert.</td></tr>`;

  const attrs = s.attrs || {};
  const attrCards = Object.keys(attrs).map((group) => {
    const obj = attrs[group] || {};
    const kvs = Object.keys(obj).map((k) =>
      `<div class="kv"><span class="k">${esc(k)}</span>
         <span class="v mono">${esc(fmt(obj[k]))}</span></div>`).join("");
    return `<div class="card"><h2><span class="ico">🔎</span>${esc(group)}</h2>${kvs || '<div class="muted">—</div>'}</div>`;
  }).join("");

  el.innerHTML = `
    <div class="card">
      <h2><span class="ico">🩺</span>Eingangs-Entities <span class="sub">${inputs.length} konfiguriert</span></h2>
      <table>
        <thead><tr><th>Slot</th><th>Entity</th><th>Wert</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="grid cols-3" style="margin-top:14px">${attrCards}</div>`;
}

function fmt(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}
