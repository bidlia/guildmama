import { ChatInputCommandInteraction } from "discord.js";
import { client } from "../main";
import { log, loggableUser, LogModes } from "../utils/log";

export async function handleChatInput(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  log(
    LogModes.APP,
    `${loggableUser(interaction.user)} used /${interaction.commandName}`,
  );

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    log(LogModes.WARN, `No command registered for /${interaction.commandName}`);
    return;
  }
  await command.execute(interaction);
}
