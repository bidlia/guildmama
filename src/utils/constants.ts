import { execSync } from "node:child_process";
import { version } from "../../package.json";
import { generateReleaseTint } from "./release-tint";

export const VERSION = version;
export const GUILD_ID = deriveEnvConstants("GUILD_ID");
export const DEVELOPER_ID = deriveEnvConstants("DEVELOPER_ID");
export const APPLICATION_ID = deriveEnvConstants("APPLICATION_ID");

const commitHash = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    process.kill(1);
  }
})();

export const RELEASE = {
  HASH: commitHash,
  TINT: commitHash ? generateReleaseTint(commitHash) : 10092441,
} as const;

function deriveEnvConstants(constant: string): string {
  if (!process.env[constant])
    throw new Error(
      `${constant} is missing from the environment configuration.`,
    );
  return process.env[constant] as string;
}
