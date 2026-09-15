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
  options: UsageOption[];
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
    return node.permutations.map((prm) => renderPermutation(prefix, prm));

  if (node.children.length > 0)
    return node.children.flatMap((chd) =>
      renderNode(chd, `${prefix} ${chd.name}`),
    );

  return [];
}

function renderPermutation(
  prefix: string,
  permutation: UsagePermutation,
): UsageLine {
  const options = permutation.options
    .map((opt) => renderOption(opt.argument, opt))
    .join(" ");
  return {
    syntax: [prefix, options].filter(Boolean).join(" "),
    explanation: permutation.explanation,
  };
}

function renderOption(label: string, option: UsageOption) {
  return `${label}:<${option.valueHint}>`;
}
