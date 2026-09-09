import {
  ButtonInteraction,
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { getProfile, upsertProfile } from "../../../utils/database";
import {
  buildMainEditorRow,
  buildUserProfileCard,
  getNickname,
} from "./formats";

const HEX_PATTERN = /^#?[0-9a-fA-F]{6}$/;

function intToHex(value: number): string {
  return `#${value.toString(16).padStart(6, "0")}`;
}

function hexToInt(hex: string): number {
  return parseInt(hex.replace(/^#/, ""), 16);
}

export async function showInfoModal(interaction: ButtonInteraction) {
  const profile = await getProfile(interaction.user.id);

  const commentInput = new TextInputBuilder()
    .setCustomId("comment")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(100)
    .setRequired(false)
    .setValue(profile?.customComment ?? "");

  const commentLabel = new LabelBuilder()
    .setLabel("Comment")
    .setTextInputComponent(commentInput);

  const titleInput = new TextInputBuilder()
    .setCustomId("title")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(50)
    .setRequired(false)
    .setValue(profile?.customTitle ?? "");

  const titleLabel = new LabelBuilder()
    .setLabel("Title")
    .setTextInputComponent(titleInput);

  const idInput = new TextInputBuilder()
    .setCustomId("id")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(8)
    .setRequired(false)
    .setValue(profile?.inGameId ?? "");

  const idLabel = new LabelBuilder()
    .setLabel("Wilds Hunter ID")
    .setTextInputComponent(idInput);

  const colourInput = new TextInputBuilder()
    .setCustomId("colour")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(7)
    .setRequired(false)
    .setValue(profile?.customColour ? intToHex(profile.customColour) : "");

  const colourLabel = new LabelBuilder()
    .setLabel("Custom colour code (hexadecimal)")
    .setTextInputComponent(colourInput);

  const modal = new ModalBuilder()
    .setCustomId("card:info")
    .setTitle("Edit Card Info")
    .addLabelComponents(titleLabel, commentLabel, idLabel, colourLabel);

  return interaction.showModal(modal);
}

export async function handleCardModals(
  interaction: ModalSubmitInteraction,
  args: string[],
) {
  const [field] = args;
  if (field !== "info") return;

  if (!interaction.isFromMessage()) {
    return interaction.reply({
      content: "Something went wrong. Please try again!",
      ephemeral: true,
    });
  }

  const comment = interaction.fields.getTextInputValue("comment").trim();
  const title = interaction.fields.getTextInputValue("title").trim();
  const id = interaction.fields.getTextInputValue("id").trim();
  const rawColour = interaction.fields.getTextInputValue("colour").trim();

  const colourUpdate = HEX_PATTERN.test(rawColour)
    ? { customColour: hexToInt(rawColour) }
    : {};

  const profile = await upsertProfile(interaction.user.id, {
    customComment: comment,
    customTitle: title,
    inGameId: id,
    ...colourUpdate,
  });

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
