import { REST, Routes } from "discord.js";
import { discoverCommands } from "./utils/discover-commands";
import { log, LogModes } from "./utils/log";

if (!process.env.APPLICATION_ID)
  throw new Error("APPLICATION_ID is missing from the environment configuration.");

const commands = discoverCommands(__dirname).map((cmd) => cmd.toJSON());
const rest = new REST().setToken(process.env.CLIENT_TOKEN!);
const isDevBuild = process.env.IS_DEVELOPMENT_BUILD == "true";
const deploymentScope = isDevBuild ? "DEV" : "GLOBAL";

(async () => {
  try {
    log(LogModes.DEP, `Started reloading ${commands.length} ${deploymentScope} commands...`);

    const route = isDevBuild
        ? Routes.applicationGuildCommands(process.env.APPLICATION_ID!, process.env.GUILD_ID!)
        : Routes.applicationCommands(process.env.APPLICATION_ID!),
      data = <unknown[]>await rest.put(route, {
        body: commands,
      });

    log(LogModes.DEP, `Finished reloading ${data.length} commands.`);
  } catch (error) {
    log(LogModes.ERR, `Failed to reload commands.`);
  }
})();
