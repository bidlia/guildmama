import { MessageFlags } from "discord.js";
import { provideAutocompleteChoices } from "../../../utils/autocomplete";
import { Command } from "../../../wrappers/command/core";
import { buildCommandHelpEmbed, buildGeneralHelpEmbed } from "./formats";

const command = new Command()
  .setName("help")
  .setDescription("View my about-me, or get help with a specific command")
  .addStringOption((opt) =>
    opt
      .setName("with")
      .setDescription("Get help with a specific command")
      .setHint("command")
      .onAutocomplete(async (interaction) =>
        provideAutocompleteChoices(interaction, [...interaction.client.commands.keys()])
      )
  )
  .describe("Peep my about-me!")
  .describe("Get help with a specific command!", ["with"])
  .onExecute(async (interaction) => {
    const targetCommand = interaction.options.getString("with")?.toLowerCase();

    if (targetCommand) {
      const command = interaction.client.commands.get(targetCommand);

      if (!command)
        return await interaction.reply({
          content: `Unable to find a command by the name of \`${targetCommand}\`.`,
          flags: MessageFlags.Ephemeral,
        });

      return await interaction.reply({
        embeds: [await buildCommandHelpEmbed(interaction, command)],
        flags: MessageFlags.Ephemeral,
      });
    }

    return await interaction.reply({
      embeds: [buildGeneralHelpEmbed(interaction.client, command)],
      flags: MessageFlags.Ephemeral,
    });
  });

export default command;
