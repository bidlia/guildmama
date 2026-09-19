import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction } from "discord.js";
import { ActionResult } from "./types";
import { CommandNode } from "../command/core";

export function confirmPrompt(
  node: CommandNode<any>,
  actionPrefix: string,
  options: {
    confirmLabel?: string;
    cancelLabel?: string;
    restrictToInvoker?: boolean;
    onConfirm: (interaction: ButtonInteraction, args: string[]) => Promise<ActionResult>;
    onCancel?: (interaction: ButtonInteraction, args: string[]) => Promise<ActionResult>;
  }
) {
  node.addButton(`${actionPrefix}.confirm`, {
    restrictToInvoker: options.restrictToInvoker ?? true,
    handler: options.onConfirm,
  });

  node.addButton(`${actionPrefix}.cancel`, {
    restrictToInvoker: options.restrictToInvoker ?? true,
    handler:
      options.onCancel ??
      (async (interaction) => {
        await interaction.update({ content: "Cancelled.", components: [] });
      }),
  });

  return (...args: string[]) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(node.customId(`${actionPrefix}.confirm`, ...args))
        .setLabel(options.confirmLabel ?? "Confirm")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(node.customId(`${actionPrefix}.cancel`, ...args))
        .setLabel(options.cancelLabel ?? "Cancel")
        .setStyle(ButtonStyle.Secondary)
    );
}
