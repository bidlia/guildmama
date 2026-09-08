import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  parseEmoji,
} from "discord.js";
import type { Profile } from "@prisma/client";
import { buildUserProfileCard, buildMainEditorRow } from "./formats";
import { EMOJIS } from "../../../utils/emoji";
import { getProfile, upsertProfile } from "../../../utils/database";
import { toggleBit } from "../../../utils/bitmask";
import { DOMAINS } from "../../../utils/constants";
import { GridCategory } from "../../../types/command";

const CATEGORY_FIELD: Record<GridCategory, keyof Profile> = {
  WEAPONS: "weaponsBitmask",
  PLATFORMS: "platformsBitmask",
  GAMES: "gamesBitmask",
};

const snapshots = new Map<string, number>();
const snapshotKey = (userId: string, category: GridCategory) =>
  `${userId}:${category}`;

function buildGridRows(
  category: GridCategory,
  mask: number,
): ActionRowBuilder<ButtonBuilder>[] {
  const domain = DOMAINS[category];
  const emojiMap = EMOJIS[category];
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let current = new ActionRowBuilder<ButtonBuilder>();

  for (const [name, index] of Object.entries(domain) as [
    keyof typeof domain,
    number,
  ][]) {
    const isOn = (mask & (1 << index)) !== 0;
    const button = new ButtonBuilder()
      .setCustomId(`card:toggle:${category}:${index}`)
      .setStyle(isOn ? ButtonStyle.Success : ButtonStyle.Secondary);

    const emojiString = emojiMap?.[name];
    const parsed = emojiString ? parseEmoji(emojiString) : null;

    if (parsed?.id) {
      button.setEmoji({
        id: parsed.id,
        name: parsed.name ?? undefined,
        animated: parsed.animated,
      });
    } else {
      button.setLabel(name as string);
    }

    current.addComponents(button);
    if (current.components.length === 5) {
      rows.push(current);
      current = new ActionRowBuilder<ButtonBuilder>();
    }
  }
  if (current.components.length > 0) rows.push(current);

  rows.push(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`card:submit:${category}`)
        .setLabel("Submit")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`card:cancel:${category}`)
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger),
    ),
  );

  return rows;
}

export async function showGrid(
  interaction: ButtonInteraction,
  category: GridCategory,
) {
  const profile = await getProfile(interaction.user.id);
  const mask = (profile?.[CATEGORY_FIELD[category]] as number) ?? 0;
  snapshots.set(snapshotKey(interaction.user.id, category), mask);
  return interaction.update({ components: buildGridRows(category, mask) });
}

export async function toggleGridItem(
  interaction: ButtonInteraction,
  category: GridCategory,
  index: number,
) {
  const profile = await getProfile(interaction.user.id);
  const currentMask = (profile?.[CATEGORY_FIELD[category]] as number) ?? 0;
  const newMask = toggleBit(currentMask, index);

  await upsertProfile(interaction.user.id, {
    [CATEGORY_FIELD[category]]: newMask,
  } as Partial<Profile>);
  return interaction.update({ components: buildGridRows(category, newMask) });
}

export async function submitGrid(
  interaction: ButtonInteraction,
  category: GridCategory,
) {
  snapshots.delete(snapshotKey(interaction.user.id, category));
  const profile = await getProfile(interaction.user.id);
  return interaction.update({
    embeds: [await buildUserProfileCard(interaction.user, profile!)],
    components: buildMainEditorRow(),
  });
}

export async function cancelGrid(
  interaction: ButtonInteraction,
  category: GridCategory,
) {
  const originalMask =
    snapshots.get(snapshotKey(interaction.user.id, category)) ?? 0;
  snapshots.delete(snapshotKey(interaction.user.id, category));

  const profile = await upsertProfile(interaction.user.id, {
    [CATEGORY_FIELD[category]]: originalMask,
  } as Partial<Profile>);
  return interaction.update({
    embeds: [await buildUserProfileCard(interaction.user, profile)],
    components: buildMainEditorRow(),
  });
}
