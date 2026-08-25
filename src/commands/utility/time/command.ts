import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../types/command";
import { db } from "../../../database";
import { DEVELOPER_ID, GUILD_ID } from "../../../utils/constants";
import { buildGlobalTimecard, buildSingleTimecard } from "./formats";
import { provideAutocompleteChoices } from "../../../utils/autocomplete";
import { getProfile, upsertProfile } from "../../../utils/database";

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

    if (setOption && getOption) {
      if (DEVELOPER_ID !== interaction.user.id) {
        return interaction.reply({
          content: "Please submit one sub-command at a time!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: setOption });
        } catch {
          return interaction.reply({
            content: `The provided option, **${setOption}**, is not a valid IANA timezone. Please choose an option directly from the drop-down menu.`,
            flags: MessageFlags.Ephemeral,
          });
        }

        await upsertProfile(getOption.id, {
          timezone: setOption,
        });

        return interaction.reply({
          content: `**${getOption.displayName}**'s timezone was updated to \`${setOption}\`.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    if (getOption) {
      const profile = await getProfile(getOption.id);
      if (!profile || !profile.timezone)
        return interaction.reply({
          content: `${getOption.displayName} has not configured their timezone.`,
          flags: MessageFlags.Ephemeral,
        });

      return interaction.reply({
        embeds: [await buildSingleTimecard(getOption, profile)],
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

      await upsertProfile(interaction.user.id, {
        timezone: setOption,
      });

      return interaction.reply({
        content: `Your timezone was updated to \`${setOption}\`.`,
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
