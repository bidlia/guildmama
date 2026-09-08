import { Profile } from "@prisma/client";
import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Interaction,
  User,
} from "discord.js";
import { addOrdinalSuffix } from "../../../utils/format";
import { getColourPreference } from "../../../utils/database";
import { emojisFromBitmask } from "../../../utils/bitmask";
import { DOMAINS } from "../../../utils/constants";
import { EMOJIS } from "../../../utils/emoji";
import { convertTimeToClockEmoji } from "../../../utils/time";

export async function buildUserProfileCard(
  user: User,
  displayName: string,
  profile: Profile,
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder()
    .setThumbnail(user.displayAvatarURL())
    .setColor(await getColourPreference(user.id));

  embed.setTitle(
    profile.customComment.length > 0
      ? `*"${profile.customComment}"*`
      : ":wave:  Hello there!",
  );

  if (profile.inGameName.length > 0)
    embed.setDescription(
      `:identification_card:  Wilds Hunter ID \`${profile.inGameName}\``,
    );

  const header: string[] = [displayName];

  if (profile.customTitle.length > 0) header.push(profile.customTitle);
  if (profile.authorityLevel == 0) header.push("Guildmaster");

  embed.setAuthor({ name: header.join("  •  ") });

  const fields: APIEmbedField[] = [];

  if (profile.gamesBitmask > 0)
    fields.push({
      name: "Games",
      value: foldContents(
        emojisFromBitmask(DOMAINS.GAMES, EMOJIS.GAMES, profile.gamesBitmask),
        3,
      ),
      inline: true,
    });

  if (profile.weaponsBitmask > 0)
    fields.push({
      name: "Plays with",
      value: foldContents(
        emojisFromBitmask(
          DOMAINS.WEAPONS,
          EMOJIS.WEAPONS,
          profile.weaponsBitmask,
        ),
        7,
      ),
      inline: true,
    });

  if (profile.platformsBitmask > 0)
    fields.push({
      name: "Platforms",
      value: foldContents(
        emojisFromBitmask(
          DOMAINS.PLATFORMS,
          EMOJIS.PLATFORMS,
          profile.platformsBitmask,
        ),
        3,
      ),
    });

  if (fields.length > 0) embed.addFields(...fields);

  const footer: string[] = [];

  if (profile.timezone.length > 0) {
    const emoji = convertTimeToClockEmoji(profile.timezone);

    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: profile.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());

    footer.push(`${emoji}  ${time}`);
  }

  if (profile.generation > 0)
    footer.push(`${addOrdinalSuffix(profile.generation)} Generation Hunter`);
  if (profile.customColour > 0)
    footer.push(
      `*#${profile.customColour.toString(16).toUpperCase().padStart(6, "0")}*`,
    );

  if (footer.length > 0)
    embed.addFields({ name: "", value: footer.join("  •  ") });

  return embed;
}

export function buildMainEditorRow(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("card:open:info")
      .setLabel("Customize")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("card:open:generation")
      .setLabel("Set Generation joined")
      .setStyle(ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("card:open:PLATFORMS")
      .setLabel("Platforms")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("card:open:GAMES")
      .setLabel("Games")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("card:open:WEAPONS")
      .setLabel("Weapons")
      .setStyle(ButtonStyle.Secondary),
  );
  return [row1, row2];
}
function foldContents(contents: string[], foldLength: number): string {
  const foldedContents: string[] = [];
  for (let i = 0; i < contents.length; i++)
    if (i > 0 && i % foldLength == 0) foldedContents.push(`\n${contents[i]}`);
    else foldedContents.push(contents[i]);
  return foldedContents.join("  ");
}

export async function getNickname(
  user: User,
  interaction: Interaction,
): Promise<string> {
  const member = interaction.guild
    ? await interaction.guild.members.fetch(user.id).catch(() => null)
    : null;
  return member?.displayName ?? user.displayName;
}
