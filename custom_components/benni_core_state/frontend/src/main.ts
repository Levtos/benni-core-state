import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import App from "./App.svelte";
import type { HassLike } from "./lib/adapters";
import cssText from "./styles.css?inline";

const STYLE_ATTRIBUTE = "data-bcs-styles";
const MOUNT_ATTRIBUTE = "data-bcs-mount";

function ensureShadowMount(shadowRoot: ShadowRoot): HTMLElement {
  let style = shadowRoot.querySelector<HTMLStyleElement>(`style[${STYLE_ATTRIBUTE}]`);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute(STYLE_ATTRIBUTE, "");
    style.textContent = cssText;
    shadowRoot.append(style);
  }

  let mountTarget = shadowRoot.querySelector<HTMLElement>(`[${MOUNT_ATTRIBUTE}]`);
  if (!mountTarget) {
    mountTarget = document.createElement("div");
    mountTarget.setAttribute(MOUNT_ATTRIBUTE, "");
    shadowRoot.append(mountTarget);
  }

  return mountTarget;
}

export const hassStore = writable<HassLike | null>(null);

class CoreStateElement extends HTMLElement {
  private app: Record<string, unknown> | null = null;
  private _hass: HassLike | null = null;
  private unmountPromise: Promise<unknown> | null = null;
  private mountGeneration = 0;

  get hass(): HassLike | null {
    return this._hass;
  }

  set hass(value: HassLike | null) {
    this._hass = value;
    hassStore.set(value);
  }

  connectedCallback(): void {
    if (this.app) return;

    const generation = ++this.mountGeneration;
    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    const mountTarget = ensureShadowMount(shadowRoot);
    const mountApp = (): void => {
      if (!this.isConnected || this.app || generation !== this.mountGeneration) return;
      this.app = mount(App, { target: mountTarget });
    };

    if (this.unmountPromise) {
      const pendingUnmount = this.unmountPromise;
      this.unmountPromise = null;
      void pendingUnmount.then(mountApp, mountApp);
    } else {
      mountApp();
    }
  }

  disconnectedCallback(): void {
    this.mountGeneration += 1;
    if (this.app) this.unmountPromise = unmount(this.app);
    this.app = null;
  }
}

if (!customElements.get("bcs-app")) customElements.define("bcs-app", CoreStateElement);
