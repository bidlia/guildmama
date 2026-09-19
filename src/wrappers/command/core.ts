import {
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import {
  ArgAttachmentOption,
  ArgBooleanOption,
  ArgChannelOption,
  ArgIntegerOption,
  ArgMentionableOption,
  ArgNumberOption,
  ArgRoleOption,
  ArgStringOption,
  ArgUserOption,
} from "./arg";
import { renderUsageLines, UsageCommand, UsageOption, UsagePermutation } from "./usage";
import {
  ActionResult,
  AnyCommandInteraction,
  ComponentDefinition,
  ComponentInteraction,
  PageRenderer,
} from "../components/types";
import { buildCustomId, defineComponent } from "../components/registry";

const GOTO_ACTION = "__goto";

async function updateMessage(
  interaction: ComponentInteraction,
  content: { content?: string; embeds?: any[]; components: any[] }
) {
  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    await interaction.update(content);
    return;
  }
  if (interaction.isModalSubmit() && interaction.isFromMessage()) {
    await interaction.update(content);
    return;
  }
}

export interface Executable {
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

type Executor = (interaction: ChatInputCommandInteraction) => Promise<unknown>;

type Builder = SlashCommandBuilder | SlashCommandSubcommandBuilder;

type AutocompleteHandler = (interaction: AutocompleteInteraction) => Promise<void>;

function hasAutocompleteHandler(
  value: unknown
): value is { getAutocompleteHandler(): AutocompleteHandler | undefined } {
  return typeof value === "object" && value !== null && "getAutocompleteHandler" in value;
}

abstract class OptionHost<TBuilder extends Builder> {
  protected abstract _builder: TBuilder;
  protected _capturedOptions: UsageOption[] = [];
  protected _permutations: UsagePermutation[] = [];
  protected _autocompleteHandlers = new Map<string, AutocompleteHandler>();

  addAttachmentOption(input: (option: ArgAttachmentOption) => ArgAttachmentOption) {
    this._builder.addAttachmentOption(this.captureOption(new ArgAttachmentOption(), input));
    return this;
  }

  addBooleanOption(input: (option: ArgBooleanOption) => ArgBooleanOption) {
    this._builder.addBooleanOption(this.captureOption(new ArgBooleanOption(), input));
    return this;
  }

  addChannelOption(input: (option: ArgChannelOption) => ArgChannelOption) {
    this._builder.addChannelOption(this.captureOption(new ArgChannelOption(), input));
    return this;
  }

  addIntegerOption(input: (option: ArgIntegerOption) => ArgIntegerOption) {
    this._builder.addIntegerOption(this.captureOption(new ArgIntegerOption(), input));
    return this;
  }

  addMentionableOption(input: (option: ArgMentionableOption) => ArgMentionableOption) {
    this._builder.addMentionableOption(this.captureOption(new ArgMentionableOption(), input));
    return this;
  }

  addNumberOption(input: (option: ArgNumberOption) => ArgNumberOption) {
    this._builder.addNumberOption(this.captureOption(new ArgNumberOption(), input));
    return this;
  }

  addRoleOption(input: (option: ArgRoleOption) => ArgRoleOption) {
    this._builder.addRoleOption(this.captureOption(new ArgRoleOption(), input));
    return this;
  }

  addStringOption(input: (option: ArgStringOption) => ArgStringOption) {
    this._builder.addStringOption(this.captureOption(new ArgStringOption(), input));
    return this;
  }

  addUserOption(input: (option: ArgUserOption) => ArgUserOption) {
    this._builder.addUserOption(this.captureOption(new ArgUserOption(), input));
    return this;
  }

  private captureOption<T extends CapturableOption>(empty: T, input: (option: T) => T): T {
    const built = input(empty);
    const json = built.toJSON();
    this._capturedOptions.push({
      argument: built.getArgument() || json.name,
      required: json.required ?? false,
      valueHint: built.getHint()
        ? built.getHint()
        : json.choices?.length
          ? json.choices.map((c) => c.name).join("|")
          : typeLabel(json.type),
    });
    if (hasAutocompleteHandler(built)) {
      const handler = built.getAutocompleteHandler();
      if (handler) this._autocompleteHandlers.set(json.name, handler);
    }
    return built;
  }

  describe(explanation: string, ...argumentNames: string[]) {
    this._permutations.push({ ...this.buildDescription(explanation, argumentNames) });
    return this;
  }

  legalize(...argumentNames: string[]) {
    this._permutations.push({
      ...this.buildDescription("", argumentNames),
      isHidden: true,
    });
    return this;
  }

  private buildDescription(explanation: string, argumentNames: string[]): UsagePermutation {
    const options = argumentNames.map((name) => {
      const found = this._capturedOptions.find((opt) => opt.argument === name);
      if (!found) {
        throw new Error(
          `describe()/describeHidden(): no option with arg "${name}" has been added yet — call add<Type>Option first`
        );
      }
      return found;
    });
    return { explanation, options };
  }

  protected async runValidated(
    interaction: ChatInputCommandInteraction,
    handler: Executor,
    usage: UsageCommand
  ): Promise<void> {
    if (!this.isValidCombination(interaction)) {
      const lines = renderUsageLines(usage);
      const body =
        lines.length > 0
          ? `That combination of options isn't valid! Try:\n${lines.map((l) => l.syntax).join("\n")}`
          : `That combination of options isn't valid!`;
      await interaction.reply({ content: body, ephemeral: true });
      return;
    }
    await handler(interaction);
  }

  protected isValidCombination(interaction: ChatInputCommandInteraction): boolean {
    if (this._permutations.length === 0) return true;
    const present = new Set(
      this._capturedOptions
        .filter((opt) => interaction.options.get(opt.argument) !== null)
        .map((opt) => opt.argument)
    );
    return this._permutations.some((prm) => {
      const required = new Set(prm.options.map((opt) => opt.argument));
      return required.size === present.size && [...required].every((arg) => present.has(arg));
    });
  }
}

interface CapturableOption {
  toJSON(): BuiltOptionJSON;
  getArgument(): string;
  getHint(): string;
}

interface BuiltOptionJSON {
  name: string;
  required?: boolean;
  type: ApplicationCommandOptionType;
  choices?: { name: string }[];
}

function typeLabel(type: ApplicationCommandOptionType) {
  return TYPE_LABELS[type] ?? "value";
}

const TYPE_LABELS: Partial<Record<ApplicationCommandOptionType, string>> = {
  [ApplicationCommandOptionType.Attachment]: "attachment",
  [ApplicationCommandOptionType.Boolean]: "boolean",
  [ApplicationCommandOptionType.Channel]: "channel",
  [ApplicationCommandOptionType.Integer]: "integer",
  [ApplicationCommandOptionType.Mentionable]: "mentionable",
  [ApplicationCommandOptionType.Number]: "number",
  [ApplicationCommandOptionType.Role]: "role",
  [ApplicationCommandOptionType.String]: "string",
  [ApplicationCommandOptionType.User]: "user",
} as const;

export abstract class CommandNode<TBuilder extends Builder>
  extends OptionHost<TBuilder>
  implements Executable
{
  protected _usage: UsageCommand;
  protected _handler: Executor = async () => {};
  private _pages = new Map<string, PageRenderer>();

  constructor() {
    super();
    this._usage = {
      name: "",
      description: "",
      options: this._capturedOptions,
      permutations: this._permutations,
      children: [],
    };
  }

  setName(name: string) {
    this._builder.setName(name);
    this._usage.name = name;
    return this;
  }

  setDescription(description: string) {
    this._builder.setDescription(description);
    this._usage.description = description;
    return this;
  }

  get description(): string {
    return this._usage.description;
  }

  onExecute(handler: Executor): this {
    this._handler = handler;
    return this;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    await this.resolve(interaction).execute(interaction);
  }

  protected resolve(_interaction: ChatInputCommandInteraction): Executable {
    return {
      execute: (int) => this.runValidated(int, this._handler, this._usage),
    };
  }

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focused = interaction.options.getFocused(true);
    const handler = this._autocompleteHandlers.get(focused.name);
    if (handler) await handler(interaction);
  }

  protected abstract getComponentNamespace(): string;

  addButton<I extends ButtonInteraction = ButtonInteraction>(
    action: string,
    def: Omit<ComponentDefinition<I>, "namespace" | "action">
  ): this {
    this.registerComponent<I>(action, def);
    return this;
  }

  addSelectMenu<I extends StringSelectMenuInteraction = StringSelectMenuInteraction>(
    action: string,
    def: Omit<ComponentDefinition<I>, "namespace" | "action">
  ): this {
    this.registerComponent<I>(action, def);
    return this;
  }

  addModal<I extends ModalSubmitInteraction = ModalSubmitInteraction>(
    action: string,
    def: Omit<ComponentDefinition<I>, "namespace" | "action">
  ): this {
    this.registerComponent<I>(action, def);
    return this;
  }

  customId(action: string, ...args: string[]): string {
    return buildCustomId(this.getComponentNamespace(), action, ...args);
  }

  buildModal(action: string, title: string, ...labels: LabelBuilder[]): ModalBuilder {
    return new ModalBuilder()
      .setCustomId(this.customId(action))
      .setTitle(title)
      .addLabelComponents(...labels);
  }
  addPage(name: string, renderer: PageRenderer): this {
    if (this._pages.size === 0) {
      this.registerComponent<ButtonInteraction | StringSelectMenuInteraction>(GOTO_ACTION, {
        handler: async (_interaction, [pageName, ...args]) => ({ page: pageName, args }),
      });
    }
    this._pages.set(name, renderer);
    return this;
  }

  gotoButton(
    pageName: string,
    label: string,
    style: ButtonStyle,
    ...args: string[]
  ): ButtonBuilder {
    return new ButtonBuilder()
      .setCustomId(this.customId(GOTO_ACTION, pageName, ...args))
      .setLabel(label)
      .setStyle(style);
  }

  async renderPage(pageName: string, interaction: AnyCommandInteraction, ...args: string[]) {
    const renderer = this._pages.get(pageName);
    if (!renderer)
      throw new Error(`Unknown page "${pageName}" on "${this.getComponentNamespace()}"`);
    return renderer(interaction, args);
  }

  private registerComponent<I extends ComponentInteraction>(
    action: string,
    def: Omit<ComponentDefinition<I>, "namespace" | "action">
  ) {
    const namespace = this.getComponentNamespace();

    defineComponent<I>({
      namespace,
      action,
      restrictToInvoker: def.restrictToInvoker,
      handler: async (interaction, args, values) => {
        const result: ActionResult = await def.handler(interaction, args, values);
        if (result?.page) {
          const content = await this.renderPage(result.page, interaction, ...(result.args ?? []));
          await updateMessage(interaction, content);
        }
      },
    });
  }
}

export class Command extends CommandNode<SlashCommandBuilder> {
  protected _builder = new SlashCommandBuilder();
  private _subcommands = new Map<string, SubcommandBuilder>();
  private _category = "";

  setCategory(category: string): this {
    this._category = category;
    return this;
  }

  get category(): string {
    return this._category;
  }

  addSubcommand(input: (subcommand: SubcommandBuilder) => SubcommandBuilder) {
    const sub = input(new SubcommandBuilder(this));
    const { builder, usage } = sub.finalize();

    this._builder.addSubcommand(builder);
    this._usage.children.push(usage);
    this._subcommands.set(usage.name, sub);
    return this;
  }

  get name() {
    return this._builder.name;
  }

  toJSON() {
    return this._builder.toJSON();
  }

  getUsageTree() {
    return this._usage;
  }

  protected getComponentNamespace(): string {
    if (!this.name) {
      throw new Error("setName() must be called before registering components on this command");
    }
    return this.name;
  }

  protected resolve(interaction: ChatInputCommandInteraction): Executable {
    if (this._subcommands.size === 0) return super.resolve(interaction);
    const subName = interaction.options.getSubcommand(false);
    return (subName && this._subcommands.get(subName)) || { execute: async () => {} };
  }

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    if (this._subcommands.size === 0) return super.autocomplete(interaction);
    const subName = interaction.options.getSubcommand(false);
    const sub = subName && this._subcommands.get(subName);
    if (sub) await sub.autocomplete(interaction);
  }
}

export class SubcommandBuilder extends CommandNode<SlashCommandSubcommandBuilder> {
  protected _builder = new SlashCommandSubcommandBuilder();

  constructor(private _parent: Command) {
    super();
  }

  protected getComponentNamespace(): string {
    if (!this._parent.name) {
      throw new Error(
        "Parent command must have setName() called before subcommand components can be registered"
      );
    }
    if (!this._usage.name) {
      throw new Error("SubcommandBuilder.setName() must be called before registering components");
    }
    return `${this._parent.name}.${this._usage.name}`;
  }

  finalize(): { builder: SlashCommandSubcommandBuilder; usage: UsageCommand } {
    return { builder: this._builder, usage: this._usage };
  }
}
