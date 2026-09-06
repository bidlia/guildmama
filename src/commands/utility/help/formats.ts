import { Client, EmbedBuilder } from "discord.js";
import { RELEASE, VERSION } from "../../../utils/constants";
import { Command } from "../../../types/command";
import { parseUsageStrings } from "./usage";

export function buildGeneralHelpEmbed(client: Client<true>): EmbedBuilder {
  const commandList = client.commands
    .map((cmd) => `\`/${cmd.data.name}\` *${cmd.data.description}*`)
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

export function buildCommandHelpEmbed(command: Command): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({ name: `${command.category} command` })
    .setTitle(`\`/${command.data.name}\``)
    .setDescription(`*${command.data.description}*`)
    .setColor(RELEASE.TINT);

  if (command.usage.children)
    embed.addFields({
      name: "Usage",
      value: parseUsageStrings(command).join("\n"),
    });
  else embed.setDescription(command.data.description);
  return embed;
}
