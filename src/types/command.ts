import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export interface Command {
  usage: Usage;
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  category?: string;
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>;
}

export interface Usage {
  name: string;
  description?: string;
  arg?: string;
  children?: OptionChains[] | Usage[];
}

export interface OptionChains {
  description: string;
  options: Option[];
}

export interface Option {
  name: string;
  arg: string;
}
