import { ChatInputCommandInteraction } from "discord.js";

export async function handleChatInput(
  interaction: ChatInputCommandInteraction,
): Promise<unknown> {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command)
    return console.error(
      `[Err]: Command '${interaction.commandName}' not found.`,
    );

  await command.execute(interaction);
}
