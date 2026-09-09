import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import type { Profile } from "@prisma/client";
import {
  buildUserProfileCard,
  buildMainEditorRow,
  getNickname,
} from "./formats";
import { upsertProfile } from "../../../utils/database";
import { SelectField } from "../../../types/command";

const fieldToProfileKey: Record<SelectField, keyof Profile> = {
  GENERATION: "generation",
  RANK: "gameBaseScore",
};

const rankOptions = [
  { label: "Do not set", value: "0" },
  { label: "< 100", value: "1" },
  { label: "100+", value: "2" },
  { label: "200+", value: "3" },
  { label: "300+", value: "4" },
  { label: "400+", value: "5" },
  { label: "500+", value: "6" },
  { label: "600+", value: "7" },
  { label: "700+", value: "8" },
  { label: "800+", value: "9" },
  { label: "900+", value: "10" },
  { label: "999", value: "11" },
];

const generationOptions = [
  { label: "Do not set", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
];

const fieldOptions: Record<SelectField, { label: string; value: string }[]> = {
  GENERATION: generationOptions,
  RANK: rankOptions,
};

const fieldPlaceholder: Record<SelectField, string> = {
  GENERATION: "Select a generation",
  RANK: "Select a rank",
};

const snapshots = new Map<string, number>();
const snapshotKey = (userId: string, field: SelectField) =>
  `${userId}:${field}`;

function buildSelectFieldRows(field: SelectField, current: number) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`card:select:${field}`)
    .setPlaceholder(fieldPlaceholder[field])
    .addOptions(
      fieldOptions[field].map((opt) => ({
        ...opt,
        default: Number(opt.value) === current,
      })),
    );

  const setButton = new ButtonBuilder()
    .setCustomId(`card:submit:${field}`)
    .setLabel("Set")
    .setStyle(ButtonStyle.Primary);

  const cancelButton = new ButtonBuilder()
    .setCustomId(`card:cancel:${field}`)
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Danger);

  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      setButton,
      cancelButton,
    ),
  ];
}

export async function showSelectField(
  interaction: ButtonInteraction,
  field: SelectField,
) {
  const profile = await upsertProfile(interaction.user.id);
  const current = (profile[fieldToProfileKey[field]] as number) ?? 0;
  snapshots.set(snapshotKey(interaction.user.id, field), current);
  return interaction.update({
    components: buildSelectFieldRows(field, current),
  });
}

export async function handleCardSelects(
  interaction: StringSelectMenuInteraction,
  args: string[],
) {
  const [, field] = args;
  if (field !== "GENERATION" && field !== "RANK") return;

  const [value] = interaction.values;
  await upsertProfile(interaction.user.id, {
    [fieldToProfileKey[field]]: Number(value),
  } as Partial<Profile>);

  return interaction.update({
    components: buildSelectFieldRows(field, Number(value)),
  });
}

export async function submitSelectField(
  interaction: ButtonInteraction,
  field: SelectField,
) {
  snapshots.delete(snapshotKey(interaction.user.id, field));
  const profile = await upsertProfile(interaction.user.id);
  return interaction.update({
    embeds: [
      await buildUserProfileCard(
        interaction.user,
        await getNickname(interaction.user, interaction),
        profile,
      ),
    ],
    components: buildMainEditorRow(),
  });
}

export async function cancelSelectField(
  interaction: ButtonInteraction,
  field: SelectField,
) {
  const original = snapshots.get(snapshotKey(interaction.user.id, field)) ?? 0;
  snapshots.delete(snapshotKey(interaction.user.id, field));

  const profile = await upsertProfile(interaction.user.id, {
    [fieldToProfileKey[field]]: original,
  } as Partial<Profile>);

  return interaction.update({
    embeds: [
      await buildUserProfileCard(
        interaction.user,
        await getNickname(interaction.user, interaction),
        profile,
      ),
    ],
    components: buildMainEditorRow(),
  });
}
