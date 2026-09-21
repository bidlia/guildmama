export interface UsageCommand {
  name: string;
  description: string;
  options: UsageOption[];
  permutations: UsagePermutation[];
  children: UsageCommand[];
}

export interface UsageOption {
  argument: string;
  required: boolean;
  valueHint: string;
}

export interface UsagePermutation {
  explanation: string;
  required: UsageOption[];
  optional: UsageOption[];
  isHidden?: boolean;
}

export interface UsageLine {
  syntax: string;
  explanation: string;
}

export function renderUsage(node: UsageCommand) {
  return renderUsageLines(node)[0]?.syntax ?? `/${node.name}`;
}

export function renderUsageLines(node: UsageCommand): UsageLine[] {
  return renderNode(node, `/${node.name}`);
}

function renderNode(node: UsageCommand, prefix: string): UsageLine[] {
  if (node.permutations.length > 0)
    return node.permutations
      .filter((prm) => !prm.isHidden)
      .map((prm) => renderPermutation(prefix, prm));

  if (node.children.length > 0)
    return node.children.flatMap((chd) => renderNode(chd, `${prefix} ${chd.name}`));

  return [];
}

function renderPermutation(prefix: string, permutation: UsagePermutation): UsageLine {
  const requiredText = permutation.required
    .map((opt) => renderOption(opt.argument, opt, false))
    .join(" ");
  const optionalText = permutation.optional
    .map((opt) => renderOption(opt.argument, opt, true))
    .join(" ");
  const options = [requiredText, optionalText].filter(Boolean).join(" ");
  return {
    syntax: [prefix, options].filter(Boolean).join(" "),
    explanation: permutation.explanation,
  };
}
function renderOption(label: string, option: UsageOption, optional: boolean) {
  const rendered = `${label}:<${option.valueHint}>`;
  return optional ? `[${rendered}]` : rendered;
}
