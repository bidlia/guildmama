import { MessageFlags } from "discord.js";
import { client } from "../../../main";
import { provideAutocompleteChoices } from "../../../utils/autocomplete";
import { Command } from "../../../utils/command/core";
import { buildCommandHelpEmbed, buildGeneralHelpEmbed } from "./formats";

const command = new Command()
  .setName("help")
  .setDescription("View my info card, or get usage for a specific command")
  .describe("Peep my 'about me'!")
  .addStringOption((opt) =>
    opt
      .setName("with")
      .setDescription("Get help with a specific command")
      .onAutocomplete(async (interaction) => {
        await provideAutocompleteChoices(
          interaction,
          [...client.commands.keys()],
          false,
        );
      }),
  )
  .describe("Get help with a specific command", "with")
  .onExecute(async (interaction) => {
    const targetName = interaction.options.getString("with")?.toLowerCase();

    if (targetName) {
      const target = client.commands.get(targetName);

      if (!target)
        return await interaction.reply({
          content: `Unable to find a command by the name of \`${targetName}\`.`,
          flags: MessageFlags.Ephemeral,
        });

      return await interaction.reply({
        embeds: [await buildCommandHelpEmbed(interaction, target)],
        flags: MessageFlags.Ephemeral,
      });
    }

    return await interaction.reply({
      embeds: [buildGeneralHelpEmbed(interaction.client)],
      flags: MessageFlags.Ephemeral,
    });
  });

export default command;
