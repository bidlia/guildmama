import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { DOMAINS } from "../utils/constants";

export interface Command {
  usage: Usage;
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  category?: string;
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>;
  components?: ComponentHandlers;
}

export interface ComponentHandlers {
  buttons?: (
    interaction: ButtonInteraction,
    args: string[],
  ) => Promise<unknown>;
  modals?: (
    interaction: ModalSubmitInteraction,
    args: string[],
  ) => Promise<unknown>;
  selects?: (
    interaction: StringSelectMenuInteraction,
    args: string[],
  ) => Promise<unknown>;
}

export type ComponentInteraction =
  | ButtonInteraction
  | ModalSubmitInteraction
  | StringSelectMenuInteraction;

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

export type SelectField = "GENERATION" | "RANK";

export type GridCategory = Extract<
  keyof typeof DOMAINS,
  "WEAPONS" | "PLATFORMS" | "GAMES"
>;
