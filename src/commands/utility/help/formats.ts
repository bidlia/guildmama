import { Client, EmbedBuilder } from "discord.js";
import { RELEASE, VERSION } from "../../../utils/constants";
import { Command } from "../../../types/command";
import { parseUsage } from "./usage";

export function buildGeneralHelpEmbed(client: Client<true>): EmbedBuilder {
  const commandList = client.commands
    .map((cmd) => `\`/${cmd.data.name}\` *${cmd.data.description}*`)
    .join("\n");
  const versionHex = `0x${RELEASE.TINT.toString(16).toUpperCase().padStart(6, "0")}`;

  return new EmbedBuilder()
    .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
    .setTitle("Hey Doodle!")
    .setColor(RELEASE.TINT)
    .addFields({
      name: "Available commands",
      value: commandList.concat(
        `\n\nUse \`/help with:<command>\` for more info on a given command!\n`,
      ),
    })
    .setFooter({
      text: `Version ${VERSION}  •  ${process.env.IS_DEVELOPMENT_BUILD ? "Development build" : "Public release"}  •  Build tint: ${versionHex}`,
    });
}

export function buildCommandHelpEmbed(command: Command): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({ name: `${command.category} category` })
    .setTitle(`\`${command.data.name}\``)
    .setColor(RELEASE.TINT);

  if (command.data.options.length > 0)
    embed
      .addFields({
        name: "Usage",
        value: parseUsage(command).join("\n"),
      })
      .setFooter({
        text: "<required>  •  [optional]",
      });
  else embed.setDescription(command.data.description);
  return embed;
}
