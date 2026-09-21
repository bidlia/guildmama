import { CommandNode } from "../../../wrappers/command/core";
import { DomainDef } from "../../../utils/domain";
import { ActionResult, PageRenderer } from "../../../wrappers/components/types";
import { confirmPrompt } from "../../../wrappers/components/confirm";
import { ensureUser, getUser } from "../../../utils/database/user";
import { emojiCache } from "../../../utils/emoji";
import { ButtonBuilder, ButtonStyle } from "discord.js";
import { buttonRows } from "../../../wrappers/components/layout";
import { maskFieldFor, syncMemberRoles } from "../../../utils/role";

export function wireMaskGrid(
  node: CommandNode<any>,
  pageName: string,
  domainKey: string,
  domain: DomainDef,
  backPage: string,
  buildEmbed: (interaction: any, targetUserId: string) => Promise<any>
) {
  const maskField = maskFieldFor(domainKey);

  const confirmRow = confirmPrompt(node, pageName, {
    onConfirm: async (interaction, [targetUserId, draftMaskStr]): Promise<ActionResult> => {
      await ensureUser(targetUserId, { [maskField]: Number(draftMaskStr) });

      if (interaction.guildId) {
        const member = await interaction.guild?.members.fetch(targetUserId).catch(() => null);
        const profile = await getUser(targetUserId);
        if (member && profile) await syncMemberRoles(member, profile);
      }

      return { page: backPage, args: [targetUserId] };
    },
    onCancel: async (interaction, [targetUserId]): Promise<ActionResult> => {
      return { page: backPage, args: [targetUserId] };
    },
  });

  const renderer: PageRenderer = async (interaction, args) => {
    const [targetUserId, draftMaskStr] = args;
    const draftMask =
      draftMaskStr !== undefined
        ? Number(draftMaskStr)
        : (((await getUser(targetUserId))?.[maskField] as number) ?? 0);

    const buttons = Object.entries(domain.entries).map(([key, entry]) => {
      const isOn = entry.index !== undefined && (draftMask & (1 << entry.index)) !== 0;
      const emoji = emojiCache.getByName(entry.emoji);
      const button = new ButtonBuilder()
        .setCustomId(
          node.customId(`${pageName}.toggle`, targetUserId, String(draftMask), String(entry.index))
        )
        .setStyle(isOn ? ButtonStyle.Success : ButtonStyle.Secondary);
      if (emoji) button.setEmoji(emoji.id!);
      else button.setLabel(entry.role?.name ?? key);
      return button;
    });

    return {
      embeds: [await buildEmbed(interaction, targetUserId)],
      components: [...buttonRows(buttons), confirmRow(targetUserId, String(draftMask))],
    };
  };

  node.addPage(pageName, renderer).addButton(`${pageName}.toggle`, {
    restrictToInvoker: true,
    handler: async (interaction, [targetUserId, draftMaskStr, indexStr]): Promise<ActionResult> => {
      const newMask = Number(draftMaskStr) ^ (1 << Number(indexStr));
      return { page: pageName, args: [targetUserId, String(newMask)] };
    },
  });
}
