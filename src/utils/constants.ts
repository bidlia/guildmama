import { execSync } from "node:child_process";
import { version } from "../../package.json";
import { generateReleaseTint } from "./release-tint";

export const VERSION = version;

export const GUILD_ID = (() => {
  if (!process.env.GUILD_ID)
    throw new Error("GUILD_ID is missing from the environment configuration.");
  return process.env.GUILD_ID as string;
})();

const commitHash = (() => {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: "ignore" })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
})();

export const RELEASE = {
  HASH: commitHash,
  TINT: generateReleaseTint(commitHash),
} as const;
