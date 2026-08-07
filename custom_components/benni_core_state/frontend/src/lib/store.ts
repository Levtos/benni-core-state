import type { CoreStateAdapter } from "./adapters";
import type { CommandAck, DataStatus, Projection, Snapshot } from "./contracts";

export interface CoreStateViewState {
  snapshot: Snapshot | null;
  projection: Projection | null;
  status: DataStatus;
  error: string | null;
  pendingCommand: string | null;
  commandResult: CommandAck | null;
}

type Listener = (state: CoreStateViewState) => void;

export class CoreStateStore {
  state: CoreStateViewState = {
    snapshot: null,
    projection: null,
    status: "loading",
    error: null,
    pendingCommand: null,
    commandResult: null,
  };

  private adapter: CoreStateAdapter | null = null;
  private adapterKind: CoreStateAdapter["kind"] | null = null;
  private listeners = new Set<Listener>();
  private removeSubscription: (() => void) | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.state);
  }

  private patch(partial: Partial<CoreStateViewState>): void {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  setAdapter(adapter: CoreStateAdapter): void {
    if (this.adapterKind === adapter.kind) return;
    this.removeSubscription?.();
    this.removeSubscription = null;
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.adapter = adapter;
    this.adapterKind = adapter.kind;
    void this.connect(adapter);
  }

  private async connect(adapter: CoreStateAdapter): Promise<void> {
    try {
      this.removeSubscription = await adapter.subscribe((snapshot) => {
        this.patch({ snapshot, status: snapshot.status, error: null });
      });
      this.pollTimer = setInterval(() => void this.refresh(), 30_000);
      await this.refresh();
    } catch (error) {
      this.patch({ status: "reconnecting", error: this.message(error) });
    }
  }

  async refresh(): Promise<void> {
    if (!this.adapter) return;
    const hasSnapshot = this.state.snapshot !== null;
    this.patch({ status: hasSnapshot ? "reconnecting" : "loading", error: null });
    try {
      const snapshot = await this.adapter.snapshot();
      this.patch({ snapshot, status: snapshot.status, error: null });
    } catch (error) {
      this.patch({ status: hasSnapshot ? "offline" : "error", error: this.message(error) });
    }
  }

  async loadProjection(): Promise<void> {
    if (!this.adapter) return;
    try {
      const projection = await this.adapter.projection(14);
      this.patch({ projection, error: null });
    } catch (error) {
      this.patch({ error: this.message(error) });
    }
  }

  async command(command: string, payload: Record<string, unknown> = {}): Promise<CommandAck> {
    if (!this.adapter) {
      const result: CommandAck = {
        contract: "benni_core_state.command_ack",
        version: "1.0.0",
        request_id: "",
        command,
        status: "error",
        error: "adapter_unavailable",
      };
      this.patch({ commandResult: result, error: result.error });
      return result;
    }
    const requestId = `${command}:${crypto.randomUUID()}`;
    this.patch({ pendingCommand: command, commandResult: null, error: null });
    try {
      const result = await this.adapter.command(requestId, command, payload);
      if (result.status === "success") await this.refresh();
      else this.patch({ error: result.error ?? "Command fehlgeschlagen." });
      this.patch({ commandResult: result });
      return result;
    } catch (error) {
      const result: CommandAck = {
        contract: "benni_core_state.command_ack",
        version: "1.0.0",
        request_id: requestId,
        command,
        status: "error",
        error: this.message(error),
      };
      this.patch({ error: result.error, commandResult: result });
      return result;
    } finally {
      this.patch({ pendingCommand: null });
    }
  }

  dispose(): void {
    this.removeSubscription?.();
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.listeners.clear();
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : "Unbekannter Core-State-Fehler.";
  }
}
