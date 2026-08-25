import { Client, EmbedBuilder } from "discord.js";
import { RELEASE, VERSION } from "../../../utils/constants";
import { Command } from "../../../types/command";

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
        `\n\nUse \`/help command:<name>\` for more info on a given command!\n`,
      ),
    })
    .setFooter({
      text: `Version ${VERSION}  •  ${process.env.IS_DEVELOPMENT_BUILD ? "Development build" : "Public release"}  •  Build tint: ${versionHex}`,
    });
}

export function buildCommandHelpEmbed(command: Command): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({ name: command.category! })
    .setTitle("/" + command.data.name)
    .setDescription(command.data.description)
    .setColor(RELEASE.TINT);

  if (command.data.options.length > 0)
    embed
      .addFields({
        name: "Usage",
        value: getUsageString(command),
      })
      .setFooter({ text: "<required>  •  [optional]" });
  return embed;
}

export function getUsageString(command: Command): string {
  const formattedArguments = command.data.options.map((option) => {
    const optionData = option.toJSON();

    return optionData.required
      ? `\`/${command.data.name} <${optionData.name}>\``
      : `\`/${command.data.name} [${optionData.name}]\``;
  });

  return formattedArguments.join("\n");
}
