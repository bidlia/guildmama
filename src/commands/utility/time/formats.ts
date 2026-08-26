import { EmbedBuilder, Interaction, User } from "discord.js";
import { RELEASE } from "../../../utils/constants";
import { Profile } from "@prisma/client";
import { Record } from "@prisma/client/runtime/library";
import {
  convertOffsetToGlobeEmoji,
  getTimezoneUtcOffset,
} from "../../../utils/time";

export function buildGlobalTimecard(
  interaction: Interaction,
  profiles: Profile[],
): EmbedBuilder {
  const userProfile = profiles.find((prf) => prf.id == interaction.user.id);
  const userNote =
    userProfile && userProfile.timezone != ""
      ? `Your timezone is currently set to \`${userProfile.timezone}\``
      : "Add your timezone with \`/time set:<timezone>\`";

  const groups: Record<string, string[]> = {};
  getProfileTimes(profiles).forEach((prf) => {
    if (!groups[prf.time]) groups[prf.time] = [];
    groups[prf.time].push(`<@${prf.user.id}>`);
  });

  const timefields = Object.entries(groups).map(([timeString, members]) => {
    return { name: timeString, value: members.sort().join("\n"), inline: true };
  });

  const embed = new EmbedBuilder()
    .setTitle("Global Timecard  🗺️")
    .setColor(RELEASE.TINT)
    .addFields(...timefields, {
      name: "",
      value: userNote,
    });

  return embed;
}

export async function buildSingleTimecard(
  user: User,
  userProfile: Profile,
): Promise<EmbedBuilder> {
  return new EmbedBuilder()
    .setAuthor({ name: `${user.displayName}'s local time  ⏰` })
    .setTitle(getProfileTimes([userProfile])[0].time)
    .setColor(RELEASE.TINT);
}

function getProfileTimes(
  profiles: Profile[],
): { time: string; user: Profile }[] {
  const rawLocale: { offset: number; string: string; user: Profile }[] = [];

  for (const profile of profiles) {
    const utcOffset = getTimezoneUtcOffset(profile.timezone);

    if (utcOffset === null) continue;
    rawLocale.push({
      offset: utcOffset,
      string: new Intl.DateTimeFormat("en-US", {
        timeZone: profile.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date()),
      user: profile,
    });
  }

  return rawLocale
    .sort((a, b) => b.offset - a.offset)
    .map((loc) => ({
      time: `${convertOffsetToGlobeEmoji(loc.offset)}  ${loc.string}`,
      user: loc.user,
    }));
}
