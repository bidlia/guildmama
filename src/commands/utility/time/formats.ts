import { UserProfile } from "@prisma/client";
import { ChatInputCommandInteraction, EmbedBuilder, User } from "discord.js";
import { getColourPreference } from "../../../utils/colour";
import {
  convertOffsetToGlobeEmoji,
  convertTimeToClockEmoji,
  getTimezoneUtcOffset,
} from "../../../utils/time";

export async function buildServerTimecard(
  interaction: ChatInputCommandInteraction,
  users: UserProfile[]
) {
  const caller = users.find((usr) => usr.id == interaction.user.id);
  const notice =
    caller && caller.timezone != ""
      ? `Your timezone is currently set to \`${caller.timezone}\``
      : "Add your timezone with \`/time set:<timezone>\`";

  const groups: Record<string, string[]> = {};
  getUserTimes(users).forEach((usr) => {
    if (!groups[usr.time]) groups[usr.time] = [];
    groups[usr.time].push(`<@${usr.user.id}>`);
  });

  const timezones = Object.entries(groups).map(([timeString, members]) => ({
    name: timeString,
    value: members.sort().join("\n"),
    inline: true,
  }));

  return new EmbedBuilder()
    .setTitle("Server Timecard  🗺️")
    .setColor(await getColourPreference(interaction.user.id))
    .addFields(...timezones, {
      name: "",
      value: notice,
    });
}

export async function buildUserTimecard(user: User, userProfile: UserProfile) {
  return new EmbedBuilder()
    .setAuthor({
      name: `${user.displayName}'s local time`,
    })
    .setTitle(getUserTimes([userProfile])[0].time)
    .setColor(await getColourPreference(userProfile));
}

export async function buildFailureCard(userId: string, attempt: string, resetWord: string) {
  return new EmbedBuilder()
    .setAuthor({ name: "Invalid timezone" })
    .setTitle(`\`${attempt}\` isn't a recognized IANA timezone.`)
    .setDescription(
      `Please choose an option directly from the suggestions.\n\nYou can also use \`/time set:${resetWord}\` to erase your existing timezone.`
    )
    .setColor(await getColourPreference(userId));
}

function getUserTimes(users: UserProfile[]) {
  const rawLocalStrings = [];

  for (const user of users) {
    const utcOffset = getTimezoneUtcOffset(user.timezone);

    if (utcOffset === null) continue;

    rawLocalStrings.push({
      offset: utcOffset,
      string: new Intl.DateTimeFormat("en-US", {
        timeZone: user.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date()),
      user: user,
    });
  }

  return rawLocalStrings
    .sort((a, b) => b.offset - a.offset)
    .map((loc) => ({
      time: `${convertOffsetToGlobeEmoji(loc.offset)} ${loc.string}`,
      user: loc.user,
    }));
}
