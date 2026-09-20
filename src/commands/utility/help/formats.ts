import { ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";
import { Command } from "../../../wrappers/command/core";
import { renderUsageLines } from "../../../wrappers/command/usage";
import { IS_DEV_BUILD, RELEASE, VERSION } from "../../../utils/constants";
import { getColourPreference } from "../../../utils/colour";
import { capitalize } from "../../../utils/format";

export function buildGeneralHelpEmbed(client: Client<true>, command: Command) {
  const versionHex = `#${RELEASE.TINT.toString(16).toUpperCase().padStart(6, "0")}`;

  return new EmbedBuilder()
    .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
    .setTitle("Hey Doodle!  📚")
    .setDescription("Looking for something?")
    .setColor(RELEASE.TINT)
    .addFields({
      name: "My commands are",
      value: [...client.commands.values()]
        .map((cmd) => `\`/${cmd.name}\` *${cmd.description}*`)
        .join("\n")
        .concat(
          `\n\nUse \`/help with:<command>\` for more info on a given command!\n\nVersion ${VERSION}  •  ${IS_DEV_BUILD ? "Development build" : "Public release"}  •  Build tint *${versionHex}*`
        ),
    });
}

export async function buildCommandHelpEmbed(
  interaction: ChatInputCommandInteraction,
  command: Command
) {
  const usageLines = renderUsageLines(command.getUsageTree()).map(
    (usg) => `\`${usg.syntax}\` *${usg.explanation}*`
  );
  const embed = new EmbedBuilder()
    .setAuthor({ name: `${capitalize(command.category)} command` })
    .setTitle(`/${command.name}`)
    .setDescription(`*${command.description}*`)
    .setColor(await getColourPreference(interaction.user.id));

  if (usageLines.length === 0) return embed;
  return embed.addFields({
    name: "Usage",
    value: usageLines.join("\n"),
  });
}
