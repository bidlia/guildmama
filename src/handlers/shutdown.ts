import { randomUUID } from "node:crypto";
import { createDeferral, Deferral } from "../utils/deferred";
import { Client } from "discord.js";
import { log, LogModes } from "../utils/log";

export class ShutdownManager {
  private _isRunning = true;
  private _tickets = new Map<string, Deferral>();
  private _deferredShutdownNotice = createDeferral();
  private _hardTimeoutMs = 15000;

  constructor(client: Client) {
    const handleShutdownEvent = async (signal: string) => {
      if (!this._isRunning) return;
      try {
        log(LogModes.KILL, `Received ${signal}. Attempting graceful shutdown.`);

        await this.shutdown();
        log(LogModes.KILL, "All pending tickets closed.");

        if (client.readyAt) {
          await client.destroy();
          log(LogModes.KILL, "Disconnected client from Discord.");
        }

        log(LogModes.KILL, "Shutdown gracefully.");
        process.exit(0);
      } catch (err) {
        log(LogModes.ERR, `Failed to gracefully shutdown; ${err}`);

        process.exit(1);
      }
    };

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => {
        handleShutdownEvent(signal).catch(() => process.exit(1));
      });
    });
  }

  get isLive() {
    return this._isRunning;
  }

  guardNecro() {
    if (!this._isRunning)
      throw new Error(
        "Client is shutting down; Not accepting any new requests.",
      );
  }

  openTicket(): { close: () => void; shutdownNotice: Promise<void> } {
    this.guardNecro();
    const id = randomUUID();
    const deferral = createDeferral();
    this._tickets.set(id, deferral);
    return {
      close: () => {
        deferral.resolve();
        this._tickets.delete(id);
      },
      shutdownNotice: this._deferredShutdownNotice.promise,
    };
  }

  private async shutdown() {
    this._isRunning = false;
    this._deferredShutdownNotice.resolve();

    const pendingTickets = [...this._tickets.values()].map(
      (tkt) => tkt.promise,
    );
    if (pendingTickets.length === 0) return;

    const timeout = new Promise<void>((resolve) =>
      setTimeout(resolve, this._hardTimeoutMs),
    );
    await Promise.race([Promise.all(pendingTickets), timeout]);
  }
}
