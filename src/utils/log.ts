import { Guild, GuildMember, PartialGuildMember, User } from "discord.js";

export enum LogModes {
  BOOT = "\x1b[32mBoot\x1b[0m",
  KILL = "\x1b[31mKill\x1b[0m",
  WARN = "\x1b[33mWarn\x1b[0m",
  ERR = "\x1b[35mErr\x1b[0m",
  APP = "\x1b[36mApp\x1b[0m",
}

export function log(mode: LogModes, content: string) {
  if (mode == LogModes.ERR)
    return console.error(`[${LogModes.ERR}]: ${content}`);
  console.log(`[${mode}]: ${content}`);
}

export function loggable(
  offering: User | Guild | GuildMember | PartialGuildMember,
) {
  if (offering instanceof Guild)
    return `\x1b[32m${offering.name}\x1b[0m [\x1b[36m${offering.id}\x1b[0m]`;
  if (offering instanceof User)
    return `\x1b[33m${offering.username}\x1b[0m [\x1b[36m${offering.id}\x1b[0m]`;
  return `\x1b[33m${offering.user.username}\x1b[0m [\x1b[36m${offering.user.id}\x1b[0m]`;
}
