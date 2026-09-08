import { execSync } from "node:child_process";
import { version } from "../../package.json";
import { generateReleaseTint } from "./release-tint";

export const VERSION = version;
export const GUILD_ID = deriveEnvConstants("GUILD_ID");
export const DEVELOPER_ID = deriveEnvConstants("DEVELOPER_ID");
export const APPLICATION_ID = deriveEnvConstants("APPLICATION_ID");

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

const WEAPONS = {
  GREATSWORD: 0,
  LONGSWORD: 1,
  SWORD_AND_SHIELD: 2,
  DUAL_BLADES: 3,
  HAMMER: 4,
  HUNTING_HORN: 5,
  LANCE: 6,
  GUNLANCE: 7,
  SWITCHAXE: 8,
  CHARGEBLADE: 9,
  INSECT_GLAIVE: 10,
  BOW: 11,
  LIGHT_BOWGUN: 12,
  HEAVY_BOWGUN: 13,
} as const;

const EQUIPMENT = {
  HELM: 14,
  MAIL: 15,
  VAMBRACES: 16,
  COIL: 17,
  GREAVES: 18,
  PENDANT: 19,
} as const;

const PLATFORMS = {
  STEAM: 0,
  WINDOWS: 1,
  PLAYSTATION: 2,
  XBOX: 3,
  SWITCH: 4,
  DS: 5,
} as const;

const GAMES = {
  MH3U: 0,
  MH4U: 1,
  MHGU: 2,
  MHWIB: 3,
  MHRSB: 4,
  MHWSA: 5,
} as const;

export const DOMAINS = { WEAPONS, EQUIPMENT, PLATFORMS, GAMES };

function deriveEnvConstants(constant: string): string {
  if (!process.env[constant])
    throw new Error(
      `[Err]: ${constant} is missing from the environment configuration.`,
    );
  return process.env[constant] as string;
}
