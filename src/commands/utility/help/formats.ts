import { ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { RELEASE, VERSION } from "../../../utils/constants";
import { Command } from "../../../utils/command/core";
import { capitalize } from "../../../utils/format";
import { getColourPreference } from "../../../utils/database";
import { renderUsageLines } from "../../../utils/command/usage";

export function buildGeneralHelpEmbed(client: Client<true>): EmbedBuilder {
  const commandList = client.commands
    .map((cmd) => `\`/${cmd.name}\` *${cmd.description}*`)
    .join("\n");
  const versionHex = `#${RELEASE.TINT.toString(16).toUpperCase().padStart(6, "0")}`;

  return new EmbedBuilder()
    .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
    .setTitle("Hey Doodle!  📚")
    .setDescription("Looking for something?")
    .setColor(RELEASE.TINT)
    .addFields({
      name: "My commands are",
      value: commandList.concat(
        `\n\nUse \`/help with:<command>\` for more info on a given command!`,
      ),
    })
    .setFooter({
      text: `Version ${VERSION}  •  ${process.env.IS_DEVELOPMENT_BUILD ? "Development build" : "Public release"}  •  Build tint ${versionHex}`,
    });
}

export async function buildCommandHelpEmbed(
  interaction: ChatInputCommandInteraction,
  command: Command,
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder()
    .setAuthor({ name: `${capitalize(command.category)} command` })
    .setTitle(`\`/${command.name}\``)
    .setDescription(`*${command.description}*`)
    .setColor(await getColourPreference(interaction.user.id));

  const lines = renderUsageLines(command.getUsageTree());
  const bareSyntax = `/${command.name}`;
  const hasRealUsage = lines.some((l) => l.syntax !== bareSyntax);

  if (hasRealUsage) {
    embed.addFields({
      name: "Usage",
      value: lines
        .map((lin) => `\`${lin.syntax}\` *${lin.explanation}*`)
        .join("\n"),
    });
  }

  return embed;
}
