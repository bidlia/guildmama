import { ChatInputCommandInteraction, MessageFlags, User } from "discord.js";
import { provideAutocompleteChoices } from "../../../utils/autocomplete";
import { DEVELOPER_ID } from "../../../utils/constants";
import { ensureUser, getUser } from "../../../utils/database/user";
import { Command } from "../../../wrappers/command/core";
import { db } from "../../../database";
import { buildFailureCard, buildServerTimecard, buildUserTimecard } from "./formats";

const ZEROIZE_TIMEZONE_KW = "None";

const command = new Command()
  .setName("time")
  .setDescription("View member timecards, or manage your own timezone")
  .addUserOption((opt) =>
    opt.setName("get").setDescription("Get a specific user's timecard").setHint("@user")
  )
  .addStringOption((opt) =>
    opt
      .setName("set")
      .setDescription(
        `Set your personal IANA timezone; Entering "${ZEROIZE_TIMEZONE_KW}" will delete your tracked timezone`
      )
      .setHint("timezone")
      .onAutocomplete(async (interaction) =>
        provideAutocompleteChoices(interaction, [
          ...Intl.supportedValuesOf("timeZone"),
          ZEROIZE_TIMEZONE_KW,
        ])
      )
  )
  .describe("Get the server timecard")
  .describe("Get a specific member's timecard", ["get"])
  .describe("Set your timezone", ["set"])
  .legalize(["get", "set"])
  .onExecute(async (interaction) => {
    const targetUser = interaction.options.getUser("get");
    const targetTimezone = interaction.options.getString("set");

    if (targetUser) {
      if (targetTimezone) {
        if (interaction.user.id !== DEVELOPER_ID) {
          return await interaction.reply({ content: "Please submit one option at a time!" });
        }
        return await updateTimezone(interaction, targetUser, targetTimezone, false);
      }

      const user = await hasUserConfigured(interaction, targetUser);
      if (!user) return;

      return await interaction.reply({
        embeds: [await buildUserTimecard(targetUser, user)],
        flags: MessageFlags.Ephemeral,
      });
    } else if (targetTimezone)
      return await updateTimezone(interaction, interaction.user, targetTimezone, true);

    if (!interaction.guild) {
      const user = await hasUserConfigured(interaction, interaction.user);
      if (!user) return;

      return await interaction.reply({
        embeds: [await buildUserTimecard(interaction.user, user)],
        flags: MessageFlags.Ephemeral,
      });
    }

    const allUsers = (
      await db.guildProfile.findMany({
        where: { guildId: interaction.guild.id },
        include: { user: true },
      })
    )
      .map((mbr) => mbr.user)
      .filter((usr) => usr.timezone !== "");

    if (!allUsers.length)
      return await interaction.reply({
        content: "No one here has set a timecard yet! Be the first with `/time set:<timezone>`!",
      });

    return await interaction.reply({
      embeds: [await buildServerTimecard(interaction, allUsers)],
      flags: MessageFlags.Ephemeral,
    });
  });

export default command;

async function updateTimezone(
  interaction: ChatInputCommandInteraction,
  user: User,
  timezone: string,
  settingSelf: boolean
) {
  if (timezone !== ZEROIZE_TIMEZONE_KW && !verifyTimezoneIntegrity(timezone))
    return await interaction.reply({
      embeds: [await buildFailureCard(user.id, timezone, ZEROIZE_TIMEZONE_KW)],
      flags: MessageFlags.Ephemeral,
    });

  const isUpdating = timezone !== ZEROIZE_TIMEZONE_KW;

  await ensureUser(user.id, {
    timezone: isUpdating ? timezone : "",
  });

  return await interaction.reply({
    content: `${settingSelf ? "Your" : `**${user.displayName}**'s`} timezone has been ${isUpdating ? `updated to \`${timezone}\`` : "erased"}.`,
    flags: MessageFlags.Ephemeral,
  });
}

function verifyTimezoneIntegrity(timezone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

async function hasUserConfigured(interaction: ChatInputCommandInteraction, user: User) {
  const userProfile = await getUser(user.id);

  if (!userProfile || !userProfile.timezone) {
    await interaction.reply({
      content: `**${user.displayName}** has not configured their timezone.`,
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return userProfile;
}
