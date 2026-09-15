import { User } from "discord.js";

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

export function loggableUser(user: User) {
  return `\x1b[33m${user.username}\x1b[0m [\x1b[36m${user.id}\x1b[0m]`;
}
