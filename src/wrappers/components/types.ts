import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";

export interface ComponentDefinition<I extends ComponentInteraction = ComponentInteraction> {
  namespace: string;
  action: string;
  restrictToInvoker?: boolean;
  handler: (interaction: I, args: string[], values?: string[]) => Promise<ActionResult>;
}

export type ComponentInteraction =
  | ButtonInteraction
  | StringSelectMenuInteraction
  | ModalSubmitInteraction;

export type ActionResult = { page: string; args?: string[] } | void;

export type PageRenderer = (
  interaction: AnyCommandInteraction,
  args: string[]
) => Promise<PageContent> | PageContent;

export interface PageContent {
  content?: string;
  embeds?: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
}

export type AnyCommandInteraction = ChatInputCommandInteraction | ComponentInteraction;

