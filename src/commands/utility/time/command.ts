import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../types/command";
import { db } from "../../../database";
import { GUILD_ID } from "../../../utils/constants";
import { buildGlobalTimecard, buildSingleTimecard } from "./formats";
import { provideAutocompleteChoices } from "../../../utils/autocomplete";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription(
      "View a global or user specific timecard, or set your own timezone",
    )
    .addUserOption((option) =>
      option
        .setName("get")
        .setDescription("Get a specific user's timecard")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("set")
        .setDescription("Set your personal IANA timezone")
        .setRequired(false)
        .setAutocomplete(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const getOption = interaction.options.getUser("get");
    const setOption = interaction.options.getString("set");

    if (setOption && getOption)
      return interaction.reply({
        content: "Please submit one sub-command at a time!",
        flags: MessageFlags.Ephemeral,
      });

    if (getOption) {
      const targetProfile = await db.profile.findUnique({
        where: { id: getOption.id },
      });

      if (!targetProfile || !targetProfile.timezone)
        return interaction.reply({
          content: `${getOption.displayName} has not configured their timezone.`,
          flags: MessageFlags.Ephemeral,
        });

      return interaction.reply({
        embeds: [await buildSingleTimecard(getOption, targetProfile)],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (setOption) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: setOption });
      } catch {
        return interaction.reply({
          content: `The provided option, **${setOption}**, is not a valid IANA timezone. Please choose an option directly from the drop-down menu.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await db.profile.upsert({
        where: { id: interaction.user.id },
        update: { timezone: setOption },
        create: {
          id: interaction.user.id,
          guildId: GUILD_ID,
          timezone: setOption,
        },
      });

      return interaction.reply({
        content: `Your timezone was updated to ${setOption}`,
        flags: MessageFlags.Ephemeral,
      });
    }
    const allProfiles = await db.profile.findMany({
      where: {
        guildId: GUILD_ID,
        timezone: { not: "" },
      },
    });

    if (allProfiles.length == 0) {
      return interaction.reply({
        content:
          "No one has set a timezone yet! Set yours with `/time set:<IANA timezone>`!",
        flags: MessageFlags.Ephemeral,
      });
    }

    return interaction.reply({
      embeds: [buildGlobalTimecard(interaction, allProfiles)],
      flags: MessageFlags.Ephemeral,
    });
  },
  async autocomplete(interaction: AutocompleteInteraction) {
    provideAutocompleteChoices(
      interaction,
      Intl.supportedValuesOf("timeZone"),
      false,
    );
  },
};

export default command;
