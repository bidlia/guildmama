import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import { Command } from "../types/command";

export function discoverCommands(operatingDir: string): Command[] {
  const commands: Command[] = [];
  const commandRoot = join(operatingDir, "commands");

  for (const commandCategory of readdirSync(commandRoot, {
    withFileTypes: true,
  })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name)) {
    const commandCategoryPath = join(commandRoot, commandCategory);
    for (const categoryEntry of readdirSync(commandCategoryPath, {
      withFileTypes: true,
    })) {
      if (categoryEntry.isFile() && categoryEntry.name.endsWith(".js"))
        verifyCommandIntegrity(
          join(commandCategoryPath, categoryEntry.name),
          commandCategory,
          commands,
        );
      else if (categoryEntry.isDirectory()) {
        const probableCommandPath = join(
          commandCategoryPath,
          categoryEntry.name,
          "command.js",
        );
        if (existsSync(probableCommandPath))
          verifyCommandIntegrity(
            probableCommandPath,
            commandCategory,
            commands,
          );
      }
    }
  }

  return commands;
}

function verifyCommandIntegrity(
  commandPath: string,
  commandCategory: string,
  commands: Command[],
): void {
  const commandModule = require(commandPath);
  const command: Command = commandModule.default ?? commandModule;
  if (!command.category) command.category = commandCategory;

  if ("data" in command && "execute" in command) commands.push(command);
  else
    console.error(
      `Err: Command at ${commandPath} has missing or malformed fields (data, execute).`,
    );
}
