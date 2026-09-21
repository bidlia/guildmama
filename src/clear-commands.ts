import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { log, loggable, LogModes } from "./utils/log";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST().setToken(process.env.CLIENT_TOKEN!);

client.once(Events.ClientReady, async (client) => {
  log(LogModes.DEP, `Logged in as ${loggable(client.user)}. Clearing all guild commands...`);

  for (const [guildId, guild] of client.guilds.cache)
    try {
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] });
      log(LogModes.DEP, `Cleared commands for guild ${loggable(guild)}`);
    } catch (err) {
      log(LogModes.ERR, `Failed to clear commands for guild ${loggable(guild)}: ${err}`);
    }

  log(LogModes.DEP, "Finished clearing all guild commands.");

  await client.destroy();
});

client.login(process.env.CLIENT_TOKEN!);
