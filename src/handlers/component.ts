import { ComponentHandlers, ComponentInteraction } from "../types/command";

export async function handleComponent<T extends ComponentInteraction>(
  interaction: T,
): Promise<unknown> {
  const kind: keyof ComponentHandlers = interaction.isButton()
    ? "buttons"
    : interaction.isModalSubmit()
      ? "modals"
      : "selects";

  const [namespace, ...args] = interaction.customId.split(":");
  const command = interaction.client.commands.get(namespace);
  const handler = command?.components?.[kind];

  if (!handler) {
    return console.error(
      `[Err]: No '${kind}' handler registered for namespace '${namespace}'.`,
    );
  }

  try {
    return await handler(interaction as any, args);
  } catch (err) {
    console.error(`[Err]: '${kind}' handler for '${namespace}' threw: ${err}`);
  }
}
