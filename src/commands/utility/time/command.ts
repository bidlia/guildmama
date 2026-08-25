import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { Command } from "../../../types/command";
import { db } from "../../../database";
import { DEVELOPER_ID, GUILD_ID } from "../../../utils/constants";
import { buildGlobalTimecard, buildSingleTimecard } from "./formats";
import { provideAutocompleteChoices } from "../../../utils/autocomplete";
import { getProfile, upsertProfile } from "../../../utils/database";

const resetUserTimezoneKeyword = "none";

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
        .setDescription(
          `Set your personal IANA timezone. Entering "${resetUserTimezoneKeyword}" will delete your timecard`,
        )
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
        return await updateTimezone(
          interaction,
          getOption,
          setOption,
          resetUserTimezoneKeyword,
          false,
        );
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
      return await updateTimezone(
        interaction,
        interaction.user,
        setOption,
        resetUserTimezoneKeyword,
        true,
      );
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
          "No one has a timecard yet! Set yours with `/time set:<IANA timezone>`!",
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
      [...Intl.supportedValuesOf("timeZone"), resetUserTimezoneKeyword],
      false,
    );
  },
};

export default command;

function verifyTimezoneIntegrity(
  interaction: ChatInputCommandInteraction,
  timezone: string,
  resetKeyword: string,
) {
  try {
    if (timezone != resetKeyword)
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    return interaction.reply({
      content: `The provided option, **${timezone}**, is not a valid IANA timezone.\nPlease choose an option directly from the drop-down menu.\n(Tip: Use \`/time set:${resetUserTimezoneKeyword}\` to reset your timecard.)`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function updateTimezone(
  interaction: ChatInputCommandInteraction,
  user: User,
  timezone: string,
  resetKeyword: string,
  settingSelf: boolean,
) {
  verifyTimezoneIntegrity(interaction, timezone, resetKeyword);

  await upsertProfile(user.id, {
    timezone: timezone,
  });

  return interaction.reply({
    content: `${settingSelf ? "Your" : `**${user.displayName}**'s`} timecard has been ${timezone == resetKeyword ? "removed" : `updated to \`${timezone}\``}.`,
    flags: MessageFlags.Ephemeral,
  });
}
