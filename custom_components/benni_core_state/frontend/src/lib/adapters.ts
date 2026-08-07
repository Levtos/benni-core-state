import type { CommandAck, Projection, Snapshot } from "./contracts";

export interface HassConnection {
  sendMessagePromise?<T>(message: Record<string, unknown>): Promise<T>;
  subscribeMessage?(
    callback: (message: Record<string, unknown>) => void,
    message: Record<string, unknown>,
  ): Promise<(() => void) | undefined>;
}

export interface HassLike {
  connection?: HassConnection;
}

export interface CoreStateAdapter {
  readonly kind: "ha-panel" | "standalone";
  snapshot(): Promise<Snapshot>;
  projection(days: number): Promise<Projection>;
  command(
    requestId: string,
    command: string,
    payload?: Record<string, unknown>,
  ): Promise<CommandAck>;
  subscribe(onSnapshot: (snapshot: Snapshot) => void): Promise<() => void>;
}

export abstract class HostAdapter implements CoreStateAdapter {
  abstract readonly kind: "ha-panel" | "standalone";
  abstract snapshot(): Promise<Snapshot>;
  abstract projection(days: number): Promise<Projection>;
  abstract command(
    requestId: string,
    command: string,
    payload?: Record<string, unknown>,
  ): Promise<CommandAck>;

  async subscribe(_onSnapshot: (snapshot: Snapshot) => void): Promise<() => void> {
    void _onSnapshot;
    return () => undefined;
  }
}

export class HaPanelAdapter extends HostAdapter {
  readonly kind = "ha-panel" as const;

  constructor(private readonly hass: HassLike) {
    super();
  }

  private get connection(): HassConnection {
    if (!this.hass.connection?.sendMessagePromise) {
      throw new Error("HA-Verbindung für Core State ist nicht verfügbar.");
    }
    return this.hass.connection;
  }

  snapshot(): Promise<Snapshot> {
    return this.connection.sendMessagePromise!({ type: "benni_core_state/ux_snapshot" });
  }

  projection(days: number): Promise<Projection> {
    return this.connection.sendMessagePromise!({
      type: "benni_core_state/ux_projection",
      days,
    });
  }

  command(
    requestId: string,
    command: string,
    payload: Record<string, unknown> = {},
  ): Promise<CommandAck> {
    return this.connection.sendMessagePromise!({
      type: "benni_core_state/ux_command",
      request_id: requestId,
      command,
      payload,
    });
  }

  async subscribe(onSnapshot: (snapshot: Snapshot) => void): Promise<() => void> {
    if (!this.connection.subscribeMessage) return () => undefined;
    const unsubscribe = await this.connection.subscribeMessage(
      (message) => {
        const envelope = (message.event ?? message) as { snapshot?: Snapshot };
        const candidate = envelope.snapshot ?? (envelope as Snapshot);
        if (candidate?.contract === "benni_core_state.snapshot") onSnapshot(candidate);
      },
      { type: "benni_core_state/ux_subscribe" },
    );
    return unsubscribe ?? (() => undefined);
  }
}

export class StandaloneAdapter extends HostAdapter {
  readonly kind = "standalone" as const;

  constructor(private readonly baseUrl = "") {
    super();
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      ...init,
    });
    if (!response.ok) throw new Error(`Core-State-Anfrage fehlgeschlagen (${response.status}).`);
    return response.json() as Promise<T>;
  }

  snapshot(): Promise<Snapshot> {
    return this.request<Snapshot>("/api/benni_core_state/snapshot");
  }

  projection(days: number): Promise<Projection> {
    return this.request<Projection>(`/api/benni_core_state/projection?days=${days}`);
  }

  command(
    requestId: string,
    command: string,
    payload: Record<string, unknown> = {},
  ): Promise<CommandAck> {
    return this.request<CommandAck>("/api/benni_core_state/commands", {
      method: "POST",
      body: JSON.stringify({ request_id: requestId, command, payload }),
    });
  }
}

export function createAdapter(hass: HassLike | null): CoreStateAdapter {
  return hass?.connection ? new HaPanelAdapter(hass) : new StandaloneAdapter();
}
