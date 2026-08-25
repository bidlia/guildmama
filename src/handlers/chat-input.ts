import {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  MessageFlags,
} from "discord.js";

export async function handleChatInput(
  interaction: ChatInputCommandInteraction,
): Promise<unknown> {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command)
    return console.error(
      `[Err]: Command '${interaction.commandName}' not found.`,
    );

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `[Err]: There was an error while executing the command '${command.data.name}'; ${error}`,
    );

    const apologyMessage: InteractionReplyOptions = {
      content: "There was an error while executing this command!",
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred)
      await interaction.followUp(apologyMessage);
    else await interaction.reply(apologyMessage);
  }
}
