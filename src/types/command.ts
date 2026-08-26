import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command {
  usage?: UsageDeclaration;
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  category?: string;
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>;
}

export interface UsageDeclaration {
  [option: string]: { value: string; required: boolean };
}
