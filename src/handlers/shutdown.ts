import { Client } from "discord.js";

export function handleShutdown(client: Client): void {
  const handleEvent = async (signal: string) => {
    try {
      console.log(`[Kill]: Received ${signal}. Attempting graceful shutdown.`);

      if (client && client.readyAt) {
        await client.destroy();
        console.log(`[Kill]: Gracefully disconnected from Discord.`);
      }

      console.log("[Kill]: Shutdown gracefully.");
      process.exit(0);
    } catch (err) {
      console.error(`[Err]: Failed to gracefully shutdown; ${err}`);

      process.exit(1);
    }
  };

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      handleEvent(signal).catch(() => process.exit(1));
    });
  });
}
