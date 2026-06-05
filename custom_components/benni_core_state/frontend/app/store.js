// Datenschicht: WS-Status-Snapshot + Bio-Service-Aktionen.
// Schreibende Aktionen laufen über die regulären Services (mark_sleep/awake,
// set_bio_state) — kein eigener WS-Setter nötig.

const DOMAIN = "benni_core_state";

export class Store {
  constructor() {
    this.hass = null;
    this.status = null;
  }

  _ws(msg) {
    if (!this.hass) return Promise.reject(new Error("no hass"));
    return this.hass.connection.sendMessagePromise(msg);
  }

  async refresh() {
    this.status = await this._ws({ type: `${DOMAIN}/get_status` })
      .catch((e) => ({ _error: String(e.message || e) }));
    return this;
  }

  // ----- Bio-Aktionen (über reguläre Services) -----
  async markSleep() { return this.hass.callService(DOMAIN, "mark_sleep", {}); }
  async markAwake() { return this.hass.callService(DOMAIN, "mark_awake", {}); }
  async setBio(state) { return this.hass.callService(DOMAIN, "set_bio_state", { state }); }
}
