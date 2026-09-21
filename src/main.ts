/// <reference path="./types/discord.d.ts" />
import { ActivityType, Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { manager } from "./handlers/shutdown";
import { log, loggable, LogModes } from "./utils/log";
import { CLIENT_TOKEN, IS_DEV_BUILD, VERSION } from "./utils/constants";
import { discoverCommands } from "./utils/discover-commands";
import { handleInteraction } from "./handlers/interaction";
import { emojiCache } from "./utils/emoji";
import { reconcileGuilds, reconcileMembers } from "./utils/database/reconcile";
import { guildJoinHandler, guildLeaveHandler } from "./handlers/guild";
import { memberJoinHandler, memberLeaveHandler } from "./handlers/guildmember";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();
for (const command of discoverCommands(__dirname)) client.commands.set(command.name, command);

log(LogModes.BOOT, "Connecting to discord...");

client.once(Events.ClientReady, async (client) => {
  log(LogModes.BOOT, "Connected.");
  manager.init(client);

  await Promise.all([reconcileMembers(client), reconcileGuilds(client), emojiCache.load(client)]);

  log(LogModes.BOOT, `Awake and ready on client ${loggable(client.user)}!`);

  client.user.setActivity(`Version ${VERSION}  ${IS_DEV_BUILD ? "🪲" : "📚"}`, {
    type: ActivityType.Playing,
  });

  client.on(Events.InteractionCreate, async (interaction) => await handleInteraction(interaction));

  client.on(Events.GuildCreate, async (guild) => guildJoinHandler(guild));
  client.on(Events.GuildDelete, async (guild) => guildLeaveHandler(guild));

  client.on(Events.GuildMemberAdd, async (member) => memberJoinHandler(member));
  client.on(Events.GuildMemberRemove, async (member) => memberLeaveHandler(member));
});

client.login(CLIENT_TOKEN);
