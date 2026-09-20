import { LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ensureUser, getUser } from "../../../utils/database/user";
import { CommandNode } from "../../../wrappers/command/core";

const HEX_PATTERN = /^#?[0-9a-fA-F]{6}$/;

export function attachPersonalizeModal(command: CommandNode<any>) {
  command.addButton("personalize.open", {
    restrictToInvoker: true,
    handler: async (interaction, [targetUserId]) => {
      const profile = await getUser(targetUserId);

      const modal = new ModalBuilder()
        .setCustomId(command.customId("personalize.submit", targetUserId))
        .setTitle("Personalize Card")
        .addLabelComponents(
          new LabelBuilder().setLabel("Title").setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("title")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(50)
              .setRequired(false)
              .setValue(profile?.customTitle ?? "")
          ),
          new LabelBuilder().setLabel("Comment").setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("comment")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(100)
              .setRequired(false)
              .setValue(profile?.customComment ?? "")
          ),
          new LabelBuilder().setLabel("Custom colour (hex)").setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("colour")
              .setStyle(TextInputStyle.Short)
              .setMaxLength(7)
              .setRequired(false)
              .setValue(
                profile?.customColour
                  ? `#${profile.customColour.toString(16).padStart(6, "0")}`
                  : ""
              )
          )
        );

      await interaction.showModal(modal);
    },
  });

  command.addModal("personalize.submit", {
    handler: async (interaction, [targetUserId]) => {
      const title = interaction.fields.getTextInputValue("title").trim();
      const comment = interaction.fields.getTextInputValue("comment").trim();
      const rawColour = interaction.fields.getTextInputValue("colour").trim();

      const colourUpdate = HEX_PATTERN.test(rawColour)
        ? { customColour: parseInt(rawColour.replace(/^#/, ""), 16) }
        : {};

      await ensureUser(targetUserId, {
        customTitle: title,
        customComment: comment,
        ...colourUpdate,
      });

      if (interaction.isFromMessage()) {
        return { page: "base", args: [targetUserId] };
      }
      await interaction.reply({ content: "Card updated.", ephemeral: true });
    },
  });
}
