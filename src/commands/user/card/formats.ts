import { EmbedBuilder, Interaction, User } from "discord.js";
import { getColourPreference } from "../../../utils/colour";
import { DOMAINS, orderByGame } from "../../../utils/domain";
import { emojiCache, emojisFromMask } from "../../../utils/emoji";
import { convertTimeToClockEmoji } from "../../../utils/time";
import { addOrdinalSuffix } from "../../../utils/format";
import { db } from "../../../database";
import { AnyCommandInteraction } from "../../../wrappers/components/types";
import { renderRank } from "../hunter/formats";

export async function buildMemberCard(interaction: AnyCommandInteraction, userId: string) {
  const user = await interaction.client.users.fetch(userId);
  const displayName = await getNickname(interaction, user);

  const member = (await db.guildProfile.findUnique({
    where: { guildId_userId: { guildId: interaction.guild!.id, userId } },
    include: { user: true },
  }))!;

  const embed = new EmbedBuilder()
    .setThumbnail(user.displayAvatarURL({ size: 1024 }))
    .setColor(await getColourPreference(userId));

  embed.setTitle(
    member.user.customComment.length ? `*"${member.user.customComment}"*` : ":wave:  Hello there!"
  );

  const header: string[] = [displayName];

  if (member.user.customTitle.length) header.push(member.user.customTitle);
  if (!member!.authority) header.push("Guildmaster");

  embed.setAuthor({ name: header.join("  •  ") });

  const fields = [];

  if (member.user.gamesMask)
    fields.push({
      name: "Games",
      value: foldContents(emojisFromMask("GAMES", DOMAINS.GAMES, member.user.gamesMask), 3),
      inline: true,
    });

  if (member.user.weaponsMask > 0)
    fields.push({
      name: "Plays with",
      value: foldContents(emojisFromMask("WEAPONS", DOMAINS.WEAPONS, member.user.weaponsMask), 7),
      inline: true,
    });

  if (member.user.platformsMask > 0)
    fields.push({
      name: "Platforms",
      value: foldContents(
        emojisFromMask("PLATFORMS", DOMAINS.PLATFORMS, member.user.platformsMask),
        3
      ),
    });

  if (fields.length) embed.addFields(...fields);

  const footer: string[] = [];

  if (member.user.timezone.length > 0) {
    const emoji = convertTimeToClockEmoji(member.user.timezone);

    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: member.user.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    footer.push(`${emoji}  ${time}`);
  }

  if (member.user.generationJoined)
    footer.push(`${addOrdinalSuffix(member.user.generationJoined)} Generation Hunter`);
  if (member.user.customColour)
    footer.push(`*#${member.user.customColour.toString(16).toUpperCase().padStart(6, "0")}*`);

  if (footer.length) embed.addFields({ name: "", value: footer.join("  •  ") });

  return embed;
}

export async function buildAccountList(interaction: AnyCommandInteraction, userId: string) {
  const user = await interaction.client.users.fetch(userId);
  const displayName = await getNickname(interaction, user);

  const member = (await db.guildProfile.findUnique({
    where: { guildId_userId: { guildId: interaction.guild!.id, userId } },
    include: { user: { include: { accounts: true } } },
  }))!;

  const embed = new EmbedBuilder()
    .setThumbnail(user.displayAvatarURL({ size: 1024 }))
    .setColor(await getColourPreference(userId));

  embed.setTitle("Hunters");

  const header: string[] = [displayName];

  if (member.user.customTitle.length) header.push(member.user.customTitle);
  if (!member!.authority) header.push("Guildmaster");

  embed.setAuthor({ name: header.join("  •  ") });

  embed.setDescription(
    orderByGame(member.user.accounts)
      .map(
        (act) =>
          `${act.gameKey ? emojiCache.get("GAMES", act.gameKey)?.toString() : ""} ${act.platformKey ? emojiCache.get("PLATFORMS", act.platformKey)?.toString() : ""} **${act.name}** ${act.baseScore || act.expacScore ? `**${renderRank(act)}**` : ""} ${act.hunterId.length ? `\`${act.hunterId}\`` : ""}`
      )
      .join("\n")
  );

  const footer: string[] = [];

  if (member.user.timezone.length > 0) {
    const emoji = convertTimeToClockEmoji(member.user.timezone);

    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: member.user.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    footer.push(`${emoji}  ${time}`);
  }

  if (member.user.generationJoined)
    footer.push(`${addOrdinalSuffix(member.user.generationJoined)} Generation Hunter`);
  if (member.user.customColour)
    footer.push(`*#${member.user.customColour.toString(16).toUpperCase().padStart(6, "0")}*`);

  if (footer.length) embed.addFields({ name: "", value: footer.join("  •  ") });

  return embed;
}

function foldContents(contents: string[], foldLength: number): string {
  const foldedContents: string[] = [];
  for (let i = 0; i < contents.length; i++)
    if (i > 0 && i % foldLength == 0) foldedContents.push(`\n${contents[i]}`);
    else foldedContents.push(contents[i]);
  return foldedContents.join("  ");
}

export async function getNickname(interaction: Interaction, user: User) {
  const member = interaction.guild
    ? await interaction.guild.members.fetch(user.id).catch(() => null)
    : null;
  return member?.displayName ?? user.displayName;
}
