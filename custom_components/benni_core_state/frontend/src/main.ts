import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import App from "./App.svelte";
import type { HassLike } from "./lib/adapters";
import cssText from "./styles.css?inline";

if (typeof document !== "undefined" && !document.getElementById("bcs-ux-styles")) {
  const style = document.createElement("style");
  style.id = "bcs-ux-styles";
  style.textContent = cssText;
  document.head.appendChild(style);
}

export const hassStore = writable<HassLike | null>(null);

class CoreStateElement extends HTMLElement {
  private app: Record<string, unknown> | null = null;
  private _hass: HassLike | null = null;

  get hass(): HassLike | null {
    return this._hass;
  }

  set hass(value: HassLike | null) {
    this._hass = value;
    hassStore.set(value);
  }

  connectedCallback(): void {
    this.app = mount(App, { target: this });
  }

  disconnectedCallback(): void {
    if (this.app) void unmount(this.app);
    this.app = null;
  }
}

if (!customElements.get("bcs-app")) customElements.define("bcs-app", CoreStateElement);
