import {
  AutocompleteInteraction,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "discord.js";

type Constructor<T = object> = new (...args: any[]) => T;

function withArgument<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private _argument = "";

    setArgument(argument: string) {
      this._argument = argument;
      return this;
    }

    getArgument() {
      return this._argument;
    }
  };
}

function expandWithAutocomplete<
  TBase extends Constructor<{ setAutocomplete(value: boolean): unknown }>,
>(Base: TBase) {
  return class extends Base {
    private _autocompleteHandler?: autocompleteHandler;

    onAutocomplete(handler: autocompleteHandler) {
      this._autocompleteHandler = handler;
      this.setAutocomplete(true);
      return this;
    }

    getAutocompleteHandler() {
      return this._autocompleteHandler;
    }
  };
}

type autocompleteHandler = (
  interaction: AutocompleteInteraction,
) => Promise<void>;

export const ArgAttachmentOption = withArgument(SlashCommandAttachmentOption);
export const ArgBooleanOption = withArgument(SlashCommandBooleanOption);
export const ArgChannelOption = withArgument(SlashCommandChannelOption);
export const ArgMentionableOption = withArgument(SlashCommandMentionableOption);
export const ArgRoleOption = withArgument(SlashCommandRoleOption);
export const ArgUserOption = withArgument(SlashCommandUserOption);

export const ArgIntegerOption = expandWithAutocomplete(
  withArgument(SlashCommandIntegerOption),
);
export const ArgNumberOption = expandWithAutocomplete(
  withArgument(SlashCommandNumberOption),
);
export const ArgStringOption = expandWithAutocomplete(
  withArgument(SlashCommandStringOption),
);

export type ArgAttachmentOption = InstanceType<typeof ArgAttachmentOption>;
export type ArgBooleanOption = InstanceType<typeof ArgBooleanOption>;
export type ArgChannelOption = InstanceType<typeof ArgChannelOption>;
export type ArgIntegerOption = InstanceType<typeof ArgIntegerOption>;
export type ArgMentionableOption = InstanceType<typeof ArgMentionableOption>;
export type ArgNumberOption = InstanceType<typeof ArgNumberOption>;
export type ArgRoleOption = InstanceType<typeof ArgRoleOption>;
export type ArgStringOption = InstanceType<typeof ArgStringOption>;
export type ArgUserOption = InstanceType<typeof ArgUserOption>;
