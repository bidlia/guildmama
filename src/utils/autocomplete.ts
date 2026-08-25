import { AutocompleteInteraction } from "discord.js";

export async function provideAutocompleteChoices(
  interaction: AutocompleteInteraction,
  totalChoices: string[],
  strict: boolean,
): Promise<void> {
  const partialChoice = interaction.options.getFocused().toLowerCase();

  const filteredChoices = totalChoices
    .filter((choice) =>
      strict
        ? choice.toLowerCase().startsWith(partialChoice)
        : choice.toLowerCase().includes(partialChoice),
    )
    .slice(0, 25);
  await interaction.respond(
    filteredChoices.map((choice) => ({ name: choice, value: choice })),
  );
}
