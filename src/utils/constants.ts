import { execSync } from "node:child_process";
import { generateReleaseTint } from "./colour";
import { version } from "../../package.json";

export const VERSION = version;
export const CLIENT_TOKEN = deriveEnvConstants("CLIENT_TOKEN") as string;
export const IS_DEV_BUILD = deriveEnvConstants(
  "IS_DEVELOPMENT_BUILD",
) as boolean;
export const GUILD_ID = IS_DEV_BUILD
  ? (deriveEnvConstants("GUILD_ID") as string)
  : false;
export const DEVELOPER_ID = deriveEnvConstants("DEVELOPER_ID") as string;
export const APPLICATION_ID = deriveEnvConstants("APPLICATION_ID") as string;

const commitHash = (() => {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    process.exit(1);
  }
})();

export const RELEASE = {
  HASH: commitHash,
  TINT: commitHash ? generateReleaseTint(commitHash) : 10092441,
} as const;

export const STALE_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

function deriveEnvConstants(constant: string): any {
  if (!process.env[constant])
    throw new Error(
      `${constant} is missing from the environment configuration.`,
    );
  return process.env[constant];
}
