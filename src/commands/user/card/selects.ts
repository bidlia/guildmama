import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { buildUserProfileCard, buildMainEditorRow } from "./formats";
import { upsertProfile } from "../../../utils/database";

const GENERATION_OPTIONS = [
  { label: "Do not set", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
] as const;

function buildGenerationRow(current: number) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("card:generation")
    .setPlaceholder("Select a generation")
    .addOptions(
      GENERATION_OPTIONS.map((opt) => ({
        ...opt,
        default: Number(opt.value) === current,
      })),
    );

  const cancelButton = new ButtonBuilder()
    .setCustomId("card:cancel:generation")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Danger);

  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
    new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton),
  ];
}

export async function showGenerationSelect(interaction: ButtonInteraction) {
  const profile = await upsertProfile(interaction.user.id);
  return interaction.update({
    components: buildGenerationRow(profile.generation),
  });
}

export async function handleCardSelects(
  interaction: StringSelectMenuInteraction,
  args: string[],
) {
  const [field] = args;
  if (field !== "generation") return;

  const [value] = interaction.values;
  const profile = await upsertProfile(interaction.user.id, {
    generation: Number(value),
  });

  return interaction.update({
    embeds: [await buildUserProfileCard(interaction.user, profile)],
    components: buildMainEditorRow(),
  });
}
