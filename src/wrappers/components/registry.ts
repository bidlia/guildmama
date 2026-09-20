import { ComponentDefinition, ComponentInteraction } from "./types";
import { log, LogModes } from "../../utils/log";
import { manager } from "../../handlers/shutdown";
import { MessageFlags } from "discord.js";

const registry = new Map<string, ComponentDefinition<any>>();

function registryKey(namespace: string, action: string) {
  return `${namespace}:${action}`;
}

export async function dispatchComponent(interaction: ComponentInteraction) {
  const { namespace, action, args } = parseCustomId(interaction.customId);
  const def = registry.get(registryKey(namespace, action));

  if (!def) {
    log(LogModes.ERR, `No component exists for custom id "${interaction.customId}"`);
    return;
  }

  if (def.restrictToInvoker) {
    const invokerId = interaction.message?.interactionMetadata?.user.id;
    if (invokerId && interaction.user.id !== invokerId) {
      await interaction.reply({
        content: "This isn't for you, silly!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  try {
    manager.guardNecro();
  } catch {
    await interaction
      .reply({
        content: "Sorry, but I'm shutting down. Hold your requests for a moment please!  ☁️",
        flags: MessageFlags.Ephemeral,
      })
      .catch(() => {});
    return;
  }

  const values = interaction.isStringSelectMenu() ? interaction.values : undefined;

  const ticket = manager.openTicket();
  try {
    await def.handler(interaction, args, values);
  } finally {
    ticket.close();
  }
}

export function defineComponent<I extends ComponentInteraction>(def: ComponentDefinition<I>) {
  const key = registryKey(def.namespace, def.action);
  if (registry.has(key)) {
    throw new Error(`Duplicate component registered for ${key}`);
  }
  registry.set(key, def);
  return def;
}

export function buildCustomId(namespace: string, action: string, ...args: string[]) {
  for (const arg of args) {
    if (arg.includes(":")) {
      throw new Error(`Component arg "${arg}" contains ":" — reserved as the customId delimiter`);
    }
  }
  const id = [namespace, action, ...args].join(":");
  if (id.length > 100) {
    throw new Error(`customId "${id}" exceeds Discord's 100 character limit (${id.length})`);
  }
  return id;
}

function parseCustomId(customId: string) {
  const [namespace, action, ...args] = customId.split(":");
  return { namespace, action, args };
}
