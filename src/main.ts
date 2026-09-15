/// <reference path="./types/discord.d.ts" />
import {
  ActivityType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Interaction,
  InteractionReplyOptions,
  MessageFlags,
} from "discord.js";
import { ShutdownManager } from "./handlers/shutdown";
import { log, loggableUser, LogModes } from "./utils/log";
import { CLIENT_TOKEN, IS_DEV_BUILD, VERSION } from "./utils/constants";
import { handleAutocomplete } from "./handlers/autocomplete";
import { handleComponent } from "./handlers/component";
import { handleChatInput } from "./handlers/chat-input";
import { discoverCommands } from "./utils/discover-commands";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();
for (const command of discoverCommands(__dirname))
  client.commands.set(command.name, command);

export const manager = new ShutdownManager(client);

client.once(Events.ClientReady, async (client) => {
  log(LogModes.BOOT, `Awake and ready on client ${loggableUser(client.user)}!`);

  client.user.setActivity(`Version ${VERSION}  ${IS_DEV_BUILD ? "🪲" : "📚"}`, {
    type: ActivityType.Playing,
  });

  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      try {
        manager.guardNecro();
      } catch (err) {
        if (interaction.isRepliable())
          interaction.reply({
            content:
              "Sorry, but I'm shutting down. Hold your requests for a moment please!  ☁️",
            flags: MessageFlags.Ephemeral,
          });
        return log(
          LogModes.ERR,
          `Discarded interaction from ${loggableUser(interaction.user)}: ${err}`,
        );
      }

      try {
        await handleChatInput(interaction);
      } catch (err) {
        log(
          LogModes.ERR,
          `There was an error while executing the command ${interaction.commandName}: ${err}`,
        );

        const apologyMessage: InteractionReplyOptions = {
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        };

        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(apologyMessage);
          } else {
            await interaction.reply(apologyMessage);
          }
        } catch (err) {
          log(
            LogModes.ERR,
            `Failed to forward error notice to user ${loggableUser(interaction.user)}`,
          );
        }
      }
    } else if (interaction.isAutocomplete())
      try {
        await handleAutocomplete(interaction);
      } catch (err) {}
    else if (
      interaction.isButton() ||
      interaction.isModalSubmit() ||
      interaction.isStringSelectMenu()
    ) {
      handleComponent(interaction);
    }
  });
});

client.login(CLIENT_TOKEN);
