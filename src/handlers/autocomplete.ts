import { AutocompleteInteraction } from "discord.js";

export async function handleAutocomplete(
  interaction: AutocompleteInteraction,
): Promise<unknown> {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command || !command.autocomplete) return;

  await command.autocomplete(interaction);
}
