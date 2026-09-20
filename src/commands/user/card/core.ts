import { ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import { Command } from "../../../wrappers/command/core";
import { wireMaskGrid } from "./mask-grid";
import { DOMAINS } from "../../../utils/domain";
import { buttonRows, buttonGrid } from "../../../wrappers/components/layout";
import { db } from "../../../database";
import { buildAccountList, buildMemberCard } from "./formats";
import { addGenerationSelector } from "./generation";
import { attachPersonalizeModal } from "./personalize";
import { getAccountsForUser } from "../../../utils/database/account";

const command: Command = new Command()
  .setName("card")
  .setDescription("View member Guild cards, or manage your own")
  .addUserOption((opt) => opt.setName("get").setDescription("The target user").setHint("@user"))
  .addPage("base", async (interaction, args) => {
    const [targetUserId = interaction.user.id] = args;
    const user = await db.userProfile.findUnique({
      where: { id: targetUserId },
      include: { accounts: true },
    });
    const isOwnCard = targetUserId === interaction.user.id;

    const hunterCount = user?.accounts.length ?? 0;
    const hunterButton: ButtonBuilder[] = hunterCount
      ? [command.gotoButton("accounts", "View Hunters", ButtonStyle.Secondary, targetUserId)]
      : [];

    const components = buttonGrid([
      [
        new ButtonBuilder()
          .setCustomId(command.customId("personalize.open", targetUserId))
          .setLabel("Personalize")
          .setStyle(ButtonStyle.Secondary),
        command.gotoButton("generation", "Set Generation", ButtonStyle.Secondary, targetUserId),
        ...hunterButton,
      ],
      [
        command.gotoButton("platforms", "Set Platforms", ButtonStyle.Secondary, targetUserId),
        command.gotoButton("games", "Set Games", ButtonStyle.Secondary, targetUserId),
        command.gotoButton("weapons", "Set Weapons", ButtonStyle.Secondary, targetUserId),
      ],
    ]);

    return {
      embeds: [await buildMemberCard(interaction, targetUserId)],
      components: isOwnCard ? components : buttonRows(hunterButton),
    };
  })
  .describe("Manage your Guild card")
  .describe("View a specific user's Guild card", ["get"])
  .addPage("accounts", async (interaction, args) => {
    const [targetUserId] = args;

    return {
      embeds: [await buildAccountList(interaction, targetUserId)],
      components: buttonRows([
        command.gotoButton("base", "Back", ButtonStyle.Secondary, targetUserId),
      ]),
    };
  })
  .onExecute(async (interaction) => {
    if (!interaction.guild)
      return await interaction.reply({
        content: "Sorry, but this command is only usable in servers!",
        flags: MessageFlags.Ephemeral,
      });

    const target = interaction.options.getUser("get") ?? interaction.user;
    if (target.bot)
      return await interaction.reply({
        content: "Bot's don't hunt, silly!",
        flags: MessageFlags.Ephemeral,
      });

    const content = await command.renderPage("base", interaction, target.id);
    return await interaction.reply({ ...content, flags: MessageFlags.Ephemeral });
  });

wireMaskGrid(command, "platforms", "PLATFORMS", DOMAINS.PLATFORMS, "base", buildMemberCard);
wireMaskGrid(command, "games", "GAMES", DOMAINS.GAMES, "base", buildMemberCard);
wireMaskGrid(command, "weapons", "WEAPONS", DOMAINS.WEAPONS, "base", buildMemberCard);
addGenerationSelector(command);
attachPersonalizeModal(command);

export default command;
