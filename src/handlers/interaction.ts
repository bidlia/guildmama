import { Interaction, InteractionReplyOptions, MessageFlags } from "discord.js";
import { log, loggable, LogModes } from "../utils/log";
import { handleChatInput } from "./chat-input";
import { handleAutocomplete } from "./autocomplete";
import { ensureGuildProfile } from "../utils/database/guild";
import { ensureUser } from "../utils/database/user";
import { dispatchComponent } from "../wrappers/components/registry";
import { manager } from "./shutdown";

export async function handleInteraction(interaction: Interaction) {
  if (interaction.guildId) {
    await ensureUser(interaction.user.id);
    await ensureGuildProfile(interaction.guildId, interaction.user.id);
  }

  if (interaction.isChatInputCommand()) {
    try {
      manager.guardNecro();
    } catch (err) {
      if (interaction.isRepliable())
        interaction.reply({
          content: "Sorry, but I'm shutting down. Hold your requests for a moment please!  ☁️",
          flags: MessageFlags.Ephemeral,
        });
      return log(LogModes.ERR, `Discarded interaction from ${loggable(interaction.user)}: ${err}`);
    }

    try {
      await handleChatInput(interaction);
    } catch (err) {
      log(
        LogModes.ERR,
        `There was an error while executing the command /${interaction.commandName}: ${err}`
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
        log(LogModes.ERR, `Failed to forward error notice to user ${loggable(interaction.user)}.`);
      }
    }
  } else if (interaction.isAutocomplete())
    try {
      await handleAutocomplete(interaction);
    } catch (err) {
      log(LogModes.ERR, `Failed to handle autocomplete request: ${err}`);
    }
  else if (
    interaction.isButton() ||
    interaction.isModalSubmit() ||
    interaction.isStringSelectMenu()
  ) {
    try {
      await dispatchComponent(interaction);
      return;
    } catch (err) {
      log(LogModes.ERR, `Failed during dispatch of component: ${err}`);
    }
  }
}
