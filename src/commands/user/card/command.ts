import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../types/command";
import { upsertProfile } from "../../../utils/database";
import {
  buildMainEditorRow,
  buildUserProfileCard,
  getNickname,
} from "./formats";
import { handleCardButtons } from "./buttons";
import { handleCardModals } from "./modals";
import { handleCardSelects } from "./selects";

const command: Command = {
  usage: {
    name: "card",
    description: "View and edit your personal guild card",
    children: [
      {
        description: "View a specific member's guild card",
        options: [
          {
            name: "get",
            arg: "@user",
          },
        ],
      },
    ],
  },
  data: new SlashCommandBuilder()
    .setName("card")
    .setDescription("View member guild cards, or manage your own")
    .addUserOption((option) =>
      option
        .setName("get")
        .setDescription("Get a specific member's guild card")
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const getOption = interaction.options.getUser("get");

    const targetUser = getOption ? getOption : interaction.user;
    const profile = await upsertProfile(targetUser.id);

    const nickname = await getNickname(targetUser, interaction);

    if (targetUser.id != interaction.user.id)
      return await interaction.reply({
        embeds: [await buildUserProfileCard(targetUser, nickname, profile)],
        flags: MessageFlags.Ephemeral,
      });

    return interaction.reply({
      embeds: [await buildUserProfileCard(targetUser, nickname, profile)],
      components: buildMainEditorRow(),
      flags: MessageFlags.Ephemeral,
    });
  },
  components: {
    buttons: handleCardButtons,
    modals: handleCardModals,
    selects: handleCardSelects,
  },
};

export default command;
