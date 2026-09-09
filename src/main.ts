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
import { fetchApplicationEmojis } from "./utils/emoji";
import { handleComponent } from "./handlers/component";

let isFinishedStartup = false;

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

client.once(Events.ClientReady, async (client: Client<true>) => {
  console.log("[Boot]: Fetching application emojis...");
  await fetchApplicationEmojis(client);
  console.log("[Boot]: Emojis collected.");

  console.log(
    `[Boot]: Awake and ready on client ${client.user.username}! (${client.user.id})`,
  );

  isFinishedStartup = true;

  client.user.setActivity(
    `Version ${VERSION}  ${process.env.IS_DEVELOPMENT_BUILD ? "🪲" : "📚"}`,
    {
      type: ActivityType.Playing,
    },
  );
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!isFinishedStartup) {
    if (interaction.isRepliable())
      return interaction.reply({
        content:
          "Sorry, but I'm still waking up. Give me a few moments to shake off the rust!  ☁️",
      });
    return console.error(
      "[Err]: Received interaction while starting up. Discarding.",
    );
  } else if (interaction.isChatInputCommand()) {
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

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(apologyMessage);
        } else {
          await interaction.reply(apologyMessage);
        }
      } catch (err) {
        console.error("[Err]: Failed to forward error notice to user: ", err);
      }
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
  } else if (
    interaction.isButton() ||
    interaction.isModalSubmit() ||
    interaction.isStringSelectMenu()
  )
    handleComponent(interaction);
});

client.login(process.env.CLIENT_TOKEN);

handleShutdown(client);
