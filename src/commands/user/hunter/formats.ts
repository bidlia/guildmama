import { DomainDef, DOMAINS } from "../../../utils/domain";
import { AnyCommandInteraction } from "../../../wrappers/components/types";
import { getColourPreference } from "../../../utils/colour";
import { getAccount } from "../../../utils/database/account";
import { EmbedBuilder } from "discord.js";
import { emojiCache } from "../../../utils/emoji";
import { InGameAccount } from "@prisma/client";

export async function buildHunterAccount(interaction: AnyCommandInteraction, accountId: string) {
  const account = (await getAccount(accountId))!;
  const gameEmoji = emojiCache.get("GAMES", account.gameKey);

  const embed = new EmbedBuilder()
    .setThumbnail(gameEmoji?.imageURL()!)
    .setFooter({
      text: `From ${DOMAINS.GAMES.entries[account.gameKey].role?.name ?? account.gameKey}`,
    })
    .setColor(await getColourPreference(interaction.user.id));

  if (account.platformKey)
    embed.setAuthor({
      name: account.name,
      iconURL: emojiCache.get("PLATFORMS", account.platformKey)?.imageURL(),
    });
  else embed.setAuthor({ name: account.name });

  if (account.hunterId.length)
    embed.setDescription(`:identification_card:  \`${account.hunterId}\``);

  const fields = [];

  if (account.baseScore)
    fields.push({
      name: "Hunter rank",
      value: rankLabel(account.baseScore.toString()),
      inline: true,
    });

  if (account.expacScore)
    fields.push({
      name: "Master rank",
      value: rankLabel(account.expacScore.toString()),
      inline: true,
    });

  fields.push({ name: "", value: `Played by <@${account.userId}>` });

  return embed.addFields(...fields);
}

export function domainChoices(domain: DomainDef) {
  return Object.entries(domain.entries).map(([key, entry]) => ({
    name: entry.role?.name ?? key,
    value: key,
  }));
}

export function renderRank(account: InGameAccount) {
  const ranks = [];

  if (account.baseScore) ranks.push(`HR${rankLabel(account.baseScore.toString(), false)}`);
  if (account.expacScore) ranks.push(`MR${rankLabel(account.expacScore.toString(), false)}`);

  if (ranks.length) return `(${ranks.join(" ")})`;
  return "";
}

export function rankLabel(value: string, flair = true): string {
  const tier = rankTiers.find((opt) => opt.value === value)?.label ?? "Unknown";

  if (!flair) return tier;
  if (value === "999") return `${tier}  :sparkles:`;
  return `${tier}  :star:`;
}

export const rankTiers = [
  { label: "Do not disclose", value: "0" },
  { label: "<100", value: "50" },
  { label: "100+", value: "100" },
  { label: "200+", value: "200" },
  { label: "300+", value: "300" },
  { label: "400+", value: "400" },
  { label: "500+", value: "500" },
  { label: "600+", value: "600" },
  { label: "700+", value: "700" },
  { label: "800+", value: "800" },
  { label: "900+", value: "900" },
  { label: "999", value: "999" },
];
