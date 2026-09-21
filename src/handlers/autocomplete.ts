import { AutocompleteInteraction } from "discord.js";
import { log, LogModes } from "../utils/log";

export async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    log(LogModes.WARN, `No command registered for autocomplete on "${interaction.commandName}"`);
    return;
  }
  await command.autocomplete(interaction);
}
