import { StringSelectMenuBuilder } from "discord.js";
import { ensureUser, getUser } from "../../../utils/database/user";
import { CommandNode } from "../../../wrappers/command/core";
import { confirmPrompt } from "../../../wrappers/components/confirm";
import { selectMenuRow } from "../../../wrappers/components/layout";
import { buildMemberCard } from "./formats";

export function addGenerationSelector(command: CommandNode<any>) {
  const confirmGeneration = confirmPrompt(command, "generation", {
    onConfirm: async (interaction, [targetUserId, draftGen]) => {
      await ensureUser(targetUserId, { generationJoined: Number(draftGen ?? 0) });
      return { page: "base", args: [targetUserId] };
    },
    onCancel: async (interaction, [targetUserId]) => {
      return { page: "base", args: [targetUserId] };
    },
  });

  command.addPage("generation", async (interaction, args) => {
    const [targetUserId, draftGenArg] = args;
    const draftGen = draftGenArg ?? String((await getUser(targetUserId))?.generationJoined ?? 0);

    return {
      embeds: [await buildMemberCard(interaction, targetUserId)],
      components: [
        selectMenuRow(
          new StringSelectMenuBuilder()
            .setCustomId(command.customId("generation.select", targetUserId))
            .setPlaceholder("Generation")
            .addOptions(
              generationOptions.map((opt) => ({ ...opt, default: opt.value === draftGen }))
            )
        ),
        confirmGeneration(targetUserId, draftGen),
      ],
    };
  });

  command.addSelectMenu("generation.select", {
    restrictToInvoker: true,
    handler: async (interaction, [targetUserId], values) => {
      return { page: "generation", args: [targetUserId, values![0]] };
    },
  });
}

const generationOptions = [
  { label: "Do not disclose", value: "0" },
  { label: "1st Generation", value: "1" },
  { label: "2nd Generation", value: "2" },
  { label: "3rd Generation", value: "3" },
  { label: "4th Generation", value: "4" },
  { label: "5th Generation", value: "5" },
  { label: "6th Generation", value: "6" },
];
