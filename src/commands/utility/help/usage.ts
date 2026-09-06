import { Command, Option, OptionChains, Usage } from "../../../types/command";

export function parseUsageStrings(command: Command): string[] {
  return parseLeaf("", command.usage);
}

function parseLeaf(base: string, usageLeaf: Usage): string[] {
  base = `${base}${handleOption(usageLeaf)}`;

  if (usageLeaf.children) {
    if ("options" in usageLeaf.children[0]) {
      return [
        parseCommandString(
          base,
          usageLeaf.description ? usageLeaf.description : "",
        ),
        ...parseOptions(base, usageLeaf.children as OptionChains[]),
      ];
    } else {
      const subLeafs: string[] = [];
      usageLeaf.children.forEach((leaf) =>
        subLeafs.push(...parseLeaf(base, leaf as Usage)),
      );
      return subLeafs;
    }
  } else {
    return [
      parseCommandString(
        base,
        usageLeaf.description ? usageLeaf.description : "",
      ),
    ];
  }
}

function parseOptions(base: string, options: OptionChains[]): string[] {
  const chains: string[] = [];

  for (const chain of options)
    chains.push(
      parseCommandString(
        `${base} ${chain.options.map((opt) => handleOption(opt)).join(" ")}`,
        chain.description,
      ),
    );

  return chains;
}

function handleOption(option: Option | Usage): string {
  return `${option.name}${option.arg ? `:<${option.arg}>` : ""}`;
}

function parseCommandString(base: string, description: string): string {
  return `\`/${base}\` *${description}*`;
}
