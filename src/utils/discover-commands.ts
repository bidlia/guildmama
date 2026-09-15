import { existsSync, readdirSync } from "node:fs";
import { Command } from "./command/core";
import { log, LogModes } from "./log";
import { join } from "node:path";

export function discoverCommands(operatingDir: string): Command[] {
  const commands: Command[] = [];
  const commandRoot = join(operatingDir, "commands");

  for (const category of readdirSync(commandRoot, {
    withFileTypes: true,
  })
    .filter((file) => file.isDirectory())
    .map((dir) => dir.name)) {
    const categoryPath = join(commandRoot, category);
    for (const entry of readdirSync(categoryPath, {
      withFileTypes: true,
    }))
      if (entry.isFile() && entry.name.endsWith(".js"))
        verifyCommandAndPush(
          join(categoryPath, entry.name),
          category,
          commands,
        );
      else if (entry.isDirectory()) {
        const probableCommandPath = join(categoryPath, entry.name, "core.js");
        if (existsSync(probableCommandPath))
          verifyCommandAndPush(probableCommandPath, category, commands);
      }
  }

  return commands;
}

function verifyCommandAndPush(
  commandPath: string,
  commandCategory: string,
  commands: Command[],
): void {
  const commandModule = require(commandPath);
  const command = commandModule.default ?? commandModule;

  if (!(command instanceof Command))
    return log(
      LogModes.ERR,
      `Command at ${commandPath} did not export a Command instance; Found ${typeof command}.`,
    );

  if (!command.category) command.setCategory(commandCategory);
  commands.push(command);
}
