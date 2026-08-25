import { EmbedBuilder, Interaction, User } from "discord.js";
import { RELEASE } from "../../../utils/constants";
import { Profile } from "@prisma/client";
import { Record } from "@prisma/client/runtime/library";
import { db } from "../../../database";

export function buildGlobalTimecard(
  interaction: Interaction,
  profiles: Profile[],
): EmbedBuilder {
  const userProfile = profiles.find((prf) => prf.id == interaction.user.id);
  const userLocalTime = userProfile
    ? userProfile.timezone
    : "not tracked.  •  Configure your timezone with '/time set:<IANA timezone>'";

  const groups: Record<string, string[]> = {};
  profiles.forEach((prf) => {
    const localeString = getLocaleString(prf.timezone);

    if (!groups[localeString]) groups[localeString] = [];
    groups[localeString].push(`<@${prf.id}>`);
  });

  const timefields = Object.entries(groups).map(([localeString, members]) => {
    return { name: localeString, value: members.join("\n"), inline: true };
  });

  const embed = new EmbedBuilder()
    .setTitle("Server Global Timecard")
    .setColor(RELEASE.TINT)
    .addFields(timefields)
    .setFooter({ text: `Your timezone is ${userLocalTime}` });

  return embed;
}

export async function buildSingleTimecard(
  user: User,
  userProfile: Profile,
): Promise<EmbedBuilder> {
  return new EmbedBuilder()
    .setAuthor({ name: `${user.displayName}'s local time` })
    .setTitle(getLocaleString(userProfile.timezone))
    .setColor(RELEASE.TINT);
}

function getLocaleString(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "Invalid Timezone";
  }
}
