import { AutocompleteInteraction } from "discord.js";

export async function handleAutocomplete(
  interaction: AutocompleteInteraction,
): Promise<unknown> {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command || !command.autocomplete) return;

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(
      `[Err]: Autocomplete failed for the command '${interaction.commandName}'`,
      error,
    );
  }
}
