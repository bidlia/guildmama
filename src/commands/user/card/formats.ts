import { Profile } from "@prisma/client";
import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  User,
} from "discord.js";
import { addOrdinalSuffix } from "../../../utils/format";
import { getColourPreference } from "../../../utils/database";
import { emojisFromBitmask } from "../../../utils/bitmask";
import { DOMAINS } from "../../../utils/constants";
import { EMOJIS } from "../../../utils/emoji";

export async function buildUserProfileCard(
  user: User,
  profile: Profile,
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${user.displayName}${profile.authorityLevel == 0 ? "  •  Guildmaster" : ""}`,
    })
    .setThumbnail(user.displayAvatarURL())
    .setColor(await getColourPreference(user.id));

  embed.setTitle(
    profile.customComment.length > 0
      ? `*"${profile.customComment}"*`
      : ":wave:  Hello there!",
  );

  const header: string[] = [user.displayName];

  if (profile.authorityLevel == 0) header.push("Guildmaster");
  if (profile.customTitle.length > 0) header.push(profile.customTitle);

  embed.setAuthor({ name: header.join("  •  ") });

  const fields: APIEmbedField[] = [];

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
      inline: true,
    });

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
    });

  if (fields.length > 0) embed.addFields(...fields);

  const footer: string[] = [];

  if (profile.timezone.length > 0)
    footer.push(
      "Local time " +
        new Intl.DateTimeFormat("en-US", {
          timeZone: profile.timezone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date()),
    );

  if (profile.generation > 0)
    footer.push(`${addOrdinalSuffix(profile.generation)} generation`);
  if (profile.customColour > 0)
    footer.push(
      `Custom tint #${profile.customColour.toString(16).toUpperCase().padStart(6, "0")}`,
    );

  if (footer.length > 0) embed.setFooter({ text: footer.join("  •  ") });

  return embed;
}

export function buildMainEditorRow(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("card:open:info")
      .setLabel("Edit Info")
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
