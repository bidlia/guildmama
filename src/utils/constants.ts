import { execSync } from "node:child_process";
import { version } from "../../package.json";
import { createHash } from "node:crypto";

export const VERSION = version;
export const CLIENT_TOKEN = deriveEnvConstants("CLIENT_TOKEN") as string;
export const IS_DEV_BUILD = (deriveEnvConstants("IS_DEVELOPMENT_BUILD") as string) == "true";
export const GUILD_ID = IS_DEV_BUILD ? (deriveEnvConstants("GUILD_ID") as string) : false;
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
    throw new Error(`${constant} is missing from the environment configuration.`);
  return process.env[constant];
}

export function generateReleaseTint(donor: string): number {
  const objectString = JSON.stringify(donor);
  const sha256Hex = createHash("sha256").update(objectString).digest("hex");
  const hashInteger = parseInt(sha256Hex.slice(0, 8), 16);
  const hue = hashInteger % 360;

  return hslToHex(hue, 75, 55);
}

function hslToHex(hue: number, saturation: number, lightness: number): number {
  lightness *= 0.01;
  const delta = saturation * Math.min(lightness, 1 - lightness) * 0.01;
  const getComp = (num: number) => {
    const hueSector = (num + hue / 30) % 12;
    const colorChannel =
      lightness - delta * Math.max(Math.min(hueSector - 3, 9 - hueSector, 1), -1);
    return Math.round(255 * colorChannel);
  };

  return (getComp(0) << 16) + (getComp(8) << 8) + getComp(4);
}
