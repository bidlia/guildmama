import { provideAutocompleteChoices } from "../../../utils/autocomplete";
import { Command } from "../../../types/command";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { buildCommandHelpEmbed, buildGeneralHelpEmbed } from "./formats";

const command: Command = {
  usage: {
    with: { value: "command", required: true },
  },
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Provides general bot information, or usage for a specific command",
    )
    .addStringOption((option) =>
      option
        .setName("with")
        .setDescription("Get help with a specific command")
        .setAutocomplete(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetCommand = interaction.options.getString("with")?.toLowerCase();

    if (targetCommand) {
      const command = interaction.client.commands.get(targetCommand);

      if (!command) {
        return interaction.reply({
          content: `Unable to find a command by the name of \`${targetCommand}\`.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      return interaction.reply({
        embeds: [buildCommandHelpEmbed(command)],
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({
      embeds: [buildGeneralHelpEmbed(interaction.client)],
      flags: MessageFlags.Ephemeral,
    });
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    await provideAutocompleteChoices(
      interaction,
      [...interaction.client.commands.keys()],
      false,
    );
  },
};

export default command;
