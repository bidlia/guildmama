import { InGameAccount } from "@prisma/client";
import { CommandNode } from "../../../wrappers/command/core";
import { confirmPrompt } from "../../../wrappers/components/confirm";
import { defineDraftState } from "../../../wrappers/components/draft";
import { getAccount, updateAccount } from "../../../utils/database/account";
import {
  ButtonBuilder,
  ButtonStyle,
  LabelBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { buildHunterAccount, domainChoices, rankTiers } from "./formats";
import { buttonRows, selectMenuRow } from "../../../wrappers/components/layout";
import { DOMAINS } from "../../../utils/domain";

export async function attachAccountView(command: CommandNode<any>) {
  const confirmRank = confirmPrompt(command, "rank", {
    onConfirm: async (interaction, args) => {
      const [accountId, ...draftArgs] = args;
      const draft = draftWithDefaults(draftArgs);
      await updateAccount(accountId, {
        baseScore: Number(draft.hunterRank),
        expacScore: Number(draft.masterRank),
      });
      return { page: "base", args: [accountId] };
    },
    onCancel: async (interaction, args) => {
      return { page: "base", args };
    },
  });

  const confirmPlatform = confirmPrompt(command, "platform", {
    onConfirm: async (interaction, args) => {
      const [accountId, ...draftArgs] = args;
      const draft = platformDraft.decode(draftArgs);
      await updateAccount(accountId, {
        platformKey: draft.platformKey,
      });
      return { page: "base", args: [accountId] };
    },
    onCancel: async (interaction, args) => {
      return { page: "base", args };
    },
  });

  return command
    .addPage("base", async (interaction, args) => {
      const [accountId] = args;
      const account = (await getAccount(accountId))!;

      const initialRankDraft = rankDraft.encode({
        hunterRank: String(account.baseScore),
        masterRank: String(account.expacScore),
      });

      const buttons = [
        command.gotoButton("rank", "Set Rank", ButtonStyle.Primary, accountId, ...initialRankDraft),
        command.gotoButton("platform", "Set Platform", ButtonStyle.Primary, accountId),
      ];

      if (account.gameKey === "MHWSA")
        buttons.push(
          new ButtonBuilder()
            .setCustomId(command.customId("id.open", accountId))
            .setLabel("Set Hunter ID")
            .setStyle(ButtonStyle.Primary)
        );
      return {
        embeds: [await buildHunterAccount(interaction, args[0]!)],
        components: buttonRows(buttons),
      };
    })
    .addButton("id.open", {
      restrictToInvoker: true,
      handler: async (interaction, args) => {
        const [accountId] = args;
        const modal = new ModalBuilder()
          .setCustomId(command.customId("id.submit", accountId))
          .setTitle("Set your Wilds Hunter ID")
          .addLabelComponents(
            new LabelBuilder()
              .setLabel("ID")
              .setTextInputComponent(
                new TextInputBuilder()
                  .setCustomId("hunterId")
                  .setStyle(TextInputStyle.Short)
                  .setMaxLength(8)
                  .setRequired(true)
              )
          );
        await interaction.showModal(modal);
      },
    })
    .addModal("id.submit", {
      handler: async (interaction, args) => {
        const [accountId] = args;
        const hunterId = interaction.fields.getTextInputValue("hunterId").trim();

        await updateAccount(accountId, { hunterId });

        if (interaction.isFromMessage()) {
          return { page: "base", args: [accountId] };
        }
        await interaction.reply({ content: "Hunter ID saved.", ephemeral: true });
      },
    })
    .addPage("rank", async (interaction, args) => {
      const [accountId, ...draftArgs] = args;
      const draft = draftWithDefaults(draftArgs);

      return {
        embeds: [await buildHunterAccount(interaction, accountId)],
        components: [
          selectMenuRow(
            new StringSelectMenuBuilder()
              .setCustomId(command.customId("rankHunter.select", accountId, ...draftArgs))
              .setPlaceholder("Hunter rank")
              .addOptions(
                rankTiers.map((opt) => ({
                  ...{ label: `HR: ${opt.label}`, value: opt.value },
                  default: opt.value === draft.hunterRank,
                }))
              )
          ),
          selectMenuRow(
            new StringSelectMenuBuilder()
              .setCustomId(command.customId("rankMaster.select", accountId, ...draftArgs))
              .setPlaceholder("Master rank")
              .addOptions(
                rankTiers.map((opt) => ({
                  ...{ label: `MR: ${opt.label}`, value: opt.value },
                  default: opt.value === draft.masterRank,
                }))
              )
          ),
          confirmRank(accountId, ...draftArgs),
        ],
      };
    })
    .addPage("platform", async (interaction, args) => {
      const [accountId, ...draftArgs] = args;
      const draft = platformDraft.decode(draftArgs);
      const current = draft.platformKey ?? "";

      return {
        embeds: [await buildHunterAccount(interaction, accountId)],
        components: [
          selectMenuRow(
            new StringSelectMenuBuilder()
              .setCustomId(command.customId("platform.select", accountId, ...draftArgs))
              .setPlaceholder("Platform")
              .addOptions(
                domainChoices(DOMAINS.PLATFORMS).map((chc) => ({
                  label: chc.name,
                  value: chc.value,
                  default: chc.value === current,
                }))
              )
          ),
          confirmPlatform(accountId, ...draftArgs),
        ],
      };
    })

    .addSelectMenu("rankHunter.select", {
      handler: async (interaction, args, values) => {
        const [accountId, ...draftArgs] = args;
        const draft = rankDraft.decode(draftArgs);
        return {
          page: "rank",
          args: [accountId, ...rankDraft.encode({ ...draft, hunterRank: values![0] })],
        };
      },
    })
    .addSelectMenu("rankMaster.select", {
      handler: async (interaction, args, values) => {
        const [accountId, ...draftArgs] = args;
        const draft = rankDraft.decode(draftArgs);
        return {
          page: "rank",
          args: [accountId, ...rankDraft.encode({ ...draft, masterRank: values![0] })],
        };
      },
    })
    .addSelectMenu("platform.select", {
      handler: async (interaction, args, values) => {
        const [accountId, ...draftArgs] = args;
        const draft = platformDraft.decode(draftArgs);
        return {
          page: "platform",
          args: [accountId, ...platformDraft.encode({ ...draft, platformKey: values![0] })],
        };
      },
    });
}

function draftWithDefaults(args: string[]) {
  const draft = rankDraft.decode(args);
  return {
    hunterRank: draft.hunterRank ?? 0,
    masterRank: draft.masterRank ?? 0,
  };
}

const rankDraft = defineDraftState(["hunterRank", "masterRank"] as const);
const platformDraft = defineDraftState(["platformKey"] as const);
