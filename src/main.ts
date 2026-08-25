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
import { discoverCommands } from "./utils/discover-commands";
import { VERSION } from "./utils/constants";
import { handleShutdown } from "./handlers/shutdown";
import { handleChatInput } from "./handlers/chat-input";
import { handleAutocomplete } from "./handlers/autocomplete";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.commands = new Collection();
for (const command of discoverCommands(__dirname)) {
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (client: Client<true>) => {
  console.log(
    `Awake and ready on client ${client.user.username}! (${client.user.id})`,
  );

  client.user.setActivity(
    `Version ${VERSION} ${process.env.IS_DEVELOPMENT_BUILD ? "🪲" : "⭐"}`,
    {
      type: ActivityType.Playing,
    },
  );
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    try {
      await handleChatInput(interaction);
    } catch (err) {
      console.error(
        `[Err]: There was an error while executing the command '${interaction.commandName}'; ${err}`,
      );

      const apologyMessage: InteractionReplyOptions = {
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred)
        await interaction.followUp(apologyMessage);
      else await interaction.reply(apologyMessage);
    }
  } else if (interaction.isAutocomplete()) {
    try {
      await handleAutocomplete(interaction);
    } catch (err) {
      console.error(
        `[Err]: Autocomplete failed for the command '${interaction.commandName}'`,
        err,
      );
    }
  }
});

client.login(process.env.CLIENT_TOKEN);

handleShutdown(client);
