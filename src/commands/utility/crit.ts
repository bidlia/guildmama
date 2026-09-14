import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../types/command";
import { EmbedBuilder } from "@discordjs/builders";
import { getColourPreference } from "../../utils/database";

const critCharts = [
  chartCritModifiers(1.25),
  chartCritModifiers(1.28),
  chartCritModifiers(1.31),
  chartCritModifiers(1.34),
  chartCritModifiers(1.37),
  chartCritModifiers(1.4),
] as const;

const command: Command = {
  usage: {
    name: "crit",
    children: [
      {
        description: "Calculate the average crit multiplier",
        options: [
          {
            name: "affinity",
            arg: "0-100",
          },
          {
            name: "boost",
            arg: "level",
          },
        ],
      },
    ],
  },
  data: new SlashCommandBuilder()
    .setName("crit")
    .setDescription("Quick calculator for crit multipliers")
    .addNumberOption((option) =>
      option
        .setName("affinity")
        .setDescription("The reference affinity (0-100)")
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName("boost")
        .setDescription("The reference crit boost level")
        .setRequired(true)
        .addChoices(
          { name: "None", value: 0 },
          { name: "Level 1", value: 1 },
          { name: "Level 2", value: 2 },
          { name: "Level 3", value: 3 },
          { name: "Level 4", value: 4 },
          { name: "Level 5", value: 5 },
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const affinity = interaction.options.getNumber("affinity")!;
    const boostLevel = interaction.options.getNumber("boost")!;
    const avgCritMod = critCharts[boostLevel][affinity];
    const alternatives = findAlternatives(avgCritMod, boostLevel);

    if (affinity > 100)
      return await interaction.reply({
        content:
          "Your affinity can't go over 100%  :head_shaking_horizontally:",
        flags: MessageFlags.Ephemeral,
      });
    else if (affinity === 0)
      return await interaction.reply({
        content: "0% affinity means no crits!  :worried:",
        flags: MessageFlags.Ephemeral,
      });

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Monster Hunter Wilds Critculator" })
      .setTitle(
        `\`${affinity}% affinity\` with\n${boostLevel ? `\`Crit. Boost lvl ${boostLevel}\`` : `\`no Crit. Boost\``}\nhas an average modifier of \`${avgCritMod}x\``,
      )
      .setColor(await getColourPreference(interaction.user.id));

    if (alternatives.length > 0)
      embed.addFields({
        name: "Stronger alternatives",
        value: alternatives
          .map(
            (alt) =>
              `\`${`${alt.affinity}% affinity`.padEnd(13, " ")}\`  w/  \`${alt.level ? `Crit. Boost lvl ${alt.level}` : `no Crit. Boost   `}\` **=** \`${alt.modifier}x\``,
          )
          .join("\n"),
      });

    return await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;

function chartCritModifiers(modifier: number): number[] {
  const modifiers: number[] = [];

  for (let i = 0; i <= 100; i++)
    modifiers.push(
      Number((Math.floor((100 - i + i * modifier) * 10) * 0.001).toFixed(3)),
    );

  return modifiers;
}

function findAlternatives(modifier: number, boostLevel: number) {
  const viableAlternatives: {
    level: number;
    affinity: number;
    modifier: number;
  }[] = [];

  for (let i = 0; i < critCharts.length; i++) {
    if (i === boostLevel) continue;
    const chart = critCharts[i];

    const alternative = chart.find((mod) => mod > modifier);
    const index = chart.indexOf(alternative!);

    if (alternative)
      viableAlternatives.push({
        level: i,
        affinity: index,
        modifier: alternative,
      });
  }

  return viableAlternatives;
}
