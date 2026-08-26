import { Command } from "../../../types/command";

export function parseUsage(command: Command): string[] {
  const rawData = command.data.toJSON();
  const usagePermutations: string[] = [];

  usagePermutations.push(
    `\`/${command.data.name}\` *${command.data.description}*`,
  );

  if (command.usage) {
    rawData.options
      ?.map((opt) =>
        command.usage![opt.name].required
          ? `\`/${command.data.name} ${opt.name}:<${command.usage![opt.name].value}>\` *${opt.description}*`
          : `\`/${command.data.name} ${opt.name}:[${command.usage![opt.name].value}]\` *${opt.description}*`,
      )
      .forEach((opt) => usagePermutations.push(opt));
  }

  return usagePermutations;
}
