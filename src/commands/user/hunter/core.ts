import { AutocompleteInteraction, flatten, MessageFlags } from "discord.js";
import { Command } from "../../../wrappers/command/core";
import { buildHunterAccount, domainChoices, rankLabel, renderRank } from "./formats";
import { DOMAINS } from "../../../utils/domain";
import { createAccount, deleteAccount, getAccount } from "../../../utils/database/account";
import { attachAccountView } from "./pages";
import { InGameAccount } from "@prisma/client";
import { getCachedUserWithAccounts } from "../../../utils/database/user";
import { getCachedGuildMembers } from "../../../utils/database/guild";

const command = new Command()
  .setName("hunter")
  .setDescription("Manage your in-game Hunters")
  .addSubcommand((cmd) => {
    cmd
      .setName("add")
      .setDescription("Add one of your Hunters")
      .addStringOption((opt) =>
        opt
          .setName("name")
          .setDescription("Your in-game Hunter name")
          .setHint("in-game name")
          .setMaxLength(12)
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("game")
          .setDescription("The game this Hunter is from")
          .setHint("MH3U to MHWSA")
          .setRequired(true)
          .addChoices(domainChoices(DOMAINS.GAMES))
      )
      .describe("Add an in-game Hunter", ["name", "game"])
      .onExecute(async (interaction) => {
        const inGameName = interaction.options.getString("name");
        const game = interaction.options.getString("game");

        if (!inGameName)
          return await interaction.reply({
            content: "Please supply your Hunter's name!",
            flags: MessageFlags.Ephemeral,
          });

        const account = await createAccount(interaction.user.id, {
          name: inGameName,
          gameKey: game!,
        });

        const content = await cmd.renderPage("base", interaction, account.id);
        return await interaction.reply({ ...content, flags: MessageFlags.Ephemeral });
      });

    attachAccountView(cmd);

    return cmd;
  })
  .addSubcommand((cmd) => {
    cmd
      .setName("edit")
      .setDescription("Edit one of your added Hunters")
      .addStringOption((opt) =>
        opt
          .setName("name")
          .setDescription("One of your added Hunters")
          .setHint("in-game name")
          .setRequired(true)
          .onAutocomplete(async (interaction) => {
            const user = await getCachedUserWithAccounts(interaction.user.id);
            const filteredChoices = filterHero(interaction, user!.accounts);
            return await interaction.respond(filteredChoices);
          })
      )
      .describe("Edit one of your Hunters", ["name"])
      .onExecute(async (interaction) => {
        const accountId = interaction.options.getString("name");

        if (accountId === "None")
          return await interaction.reply({
            content:
              "Before you can edit, you need to add one of your Hunters with:\n\`/hunter add name:<in-game name> game:<MH3U to MHWSA>\`",
            flags: MessageFlags.Ephemeral,
          });

        if (!accountId)
          return await interaction.reply({
            content: "Please supply your Hunter's name!",
            flags: MessageFlags.Ephemeral,
          });

        const account = await getAccount(accountId);

        const content = await cmd.renderPage("base", interaction, account!.id);
        return await interaction.reply({ ...content, flags: MessageFlags.Ephemeral });
      });

    attachAccountView(cmd);

    return cmd;
  })
  .addSubcommand((cmd) =>
    cmd
      .setName("remove")
      .setDescription("Remove one of your added Hunters")
      .addStringOption((opt) =>
        opt
          .setName("name")
          .setDescription("One of your added Hunters")
          .setHint("in-game name")
          .setRequired(true)
          .onAutocomplete(async (interaction) => {
            const user = await getCachedUserWithAccounts(interaction.user.id);
            const filteredChoices = filterHero(interaction, user!.accounts);
            return await interaction.respond(filteredChoices);
          })
      )
      .describe("Remove one of your Hunters", ["name"])
      .onExecute(async (interaction) => {
        const accountId = interaction.options.getString("name");

        if (accountId === "None")
          return await interaction.reply({
            content:
              "There's nothing to remove! You can add one of your Hunters with:\n\`/hunter add name:<in-game name> game:<MH3U to MHWSA>\`",
            flags: MessageFlags.Ephemeral,
          });

        if (!accountId)
          return await interaction.reply({
            content: "Please supply your Hunter's name!",
            flags: MessageFlags.Ephemeral,
          });

        await deleteAccount(accountId);

        return await interaction.reply({
          content: `The Hunter has been relieved of duty! Enjoy retirement!`,
          flags: MessageFlags.Ephemeral,
        });
      })
  )
  .addSubcommand((cmd) =>
    cmd
      .setName("view")
      .setDescription("View other user's hunters")
      .addStringOption((opt) =>
        opt
          .setName("name")
          .setDescription("The target hunter")
          .setHint("in-game name")
          .setRequired(true)
          .onAutocomplete(async (interaction) => {
            if (!interaction.guild)
              return await interaction.respond([
                { name: "Sorry, but viewing is only supported in servers!", value: "" },
              ]);

            const members = await getCachedGuildMembers(interaction.guild.id);
            const allAccounts = members.flatMap((usr) => usr.accounts);

            const filteredChoices = filterHero(interaction, allAccounts);
            return await interaction.respond(filteredChoices);
          })
      )

      .describe("View a user's Hunters", ["name"])
      .onExecute(async (interaction) => {
        const accountId = interaction.options.getString("name");

        if (accountId === "None")
          return await interaction.reply({
            content:
              "No one has added any Hunters yet! Add one of your Hunters with:\n\`/hunter add name:<in-game name> game:<MH3U to MHWSA>\`",
            flags: MessageFlags.Ephemeral,
          });

        if (!accountId)
          return await interaction.reply({
            content: "Please supply a Hunter's name!",
            flags: MessageFlags.Ephemeral,
          });

        return await interaction.reply({
          embeds: [await buildHunterAccount(interaction, accountId)],
          flags: MessageFlags.Ephemeral,
        });
      })
  );

export default command;

function filterHero(interaction: AutocompleteInteraction, accounts: InGameAccount[]) {
  const partialChoice = interaction.options.getFocused().toLowerCase();

  const formattedAccounts = accounts.length
    ? accounts.map((act) => ({
        name: `${act.name} ${renderRank(act)} ${act.gameKey}`,
        value: act.id,
      }))
    : [{ name: "None", value: "None" }];

  const filteredAccounts = formattedAccounts
    .filter((choice) => choice.name.toLowerCase().includes(partialChoice))
    .slice(0, 25);

  return filteredAccounts;
}
