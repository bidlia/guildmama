import { InGameAccount } from "@prisma/client";

export const DOMAINS = buildDomains({
  WEAPONS: {
    hasBitmask: true,
    entries: {
      GREAT_SWORD: {
        shorthand: "gs",
        role: { name: "🔪 Great Sword", colour: 0x7d2323 },
      },
      LONG_SWORD: {
        shorthand: "ls",
        role: { name: "🗡️ Long Sword", colour: 0xa14e0f },
      },
      SWORD_AND_SHIELD: {
        shorthand: "sns",
        role: { name: "🗡️🛡️ Sword & Shield", colour: 0xc19a03 },
      },
      DUAL_BLADES: {
        shorthand: "db",
        role: { name: "⚔️ Dual Blades", colour: 0xb8e05b },
      },
      HAMMER: { shorthand: "ham", role: { name: "🔨 Hammer", colour: 0x639e29 } },
      HUNTING_HORN: {
        shorthand: "hh",
        role: { name: "🎺 Hunting Horn", colour: 0x1f8942 },
      },
      LANCE: { shorthand: "lnc", role: { name: "🔱 Lance", colour: 0x167c58 } },
      GUNLANCE: {
        shorthand: "gl",
        role: { name: "🔫🔱 Gunlance", colour: 0x0b6b6b },
      },
      SWITCH_AXE: {
        shorthand: "sa",
        role: { name: "🔄🪓 Switch Axe", colour: 0x15629c },
      },
      CHARGE_BLADE: {
        shorthand: "cb",
        role: { name: "♻️🗡️ Charge Blade", colour: 0x323d84 },
      },
      INSECT_GLAIVE: {
        shorthand: "ig",
        role: { name: "🐞🚁 Insect Glaive", colour: 0x66519f },
      },
      BOW: { shorthand: "bow", role: { name: "🏹 Bow", colour: 0x612539 } },
      LIGHT_BOWGUN: {
        shorthand: "lbg",
        role: { name: "⌐╦ᡁ᠊╾━ Light Bowgun", colour: 0x86639a },
      },
      HEAVY_BOWGUN: {
        shorthand: "hbg",
        role: { name: "ᡕᠵデᡁ᠊╾━ Heavy Bowgun", colour: 0x893a74 },
      },
      MAGNET_SPIKE: { shorthand: "ms", role: { name: "🧲 Magnet Spike", colour: 0xd6b1be } },
      TONFA: { shorthand: "tnf", role: { name: "🪃 Tonfa", colour: 0xa1c996 } },
      ACCEL_AXE: { shorthand: "aa", role: { name: "🪓💨 Accel Axe", colour: 0xe7e0c3 } },
      PROWLER: { shorthand: "plr", role: { name: "🐱 Prowler", colour: 0xfab886 } },
    },
  },

  EQUIPMENT: {
    entries: {
      HELM: { shorthand: "helm" },
      MAIL: { shorthand: "mail" },
      VAMBRACES: { shorthand: "vambraces" },
      COIL: { shorthand: "coil" },
      GREAVES: { shorthand: "greaves" },
      PENDANT: { shorthand: "pendant" },
    },
  },

  PLATFORMS: {
    hasBitmask: true,
    entries: {
      STEAM: { shorthand: "steam", role: { name: "Steam", colour: 0x1b2838 } },
      WINDOWS: {
        shorthand: "windows",
        role: { name: "Windows", colour: 0x0078d4 },
      },
      PLAYSTATION: {
        shorthand: "playstation",
        role: { name: "Playstation", colour: 0x003087 },
      },
      XBOX: { shorthand: "xbox", role: { name: "XBOX", colour: 0x107c10 } },
      SWITCH: {
        shorthand: "switch",
        role: { name: "Switch", colour: 0xe60012 },
      },
      DS: {
        shorthand: "3ds",
        role: {
          name: "3DS",
          colour: 0xbc181a,
        },
      },
    },
  },

  GAMES: {
    hasBitmask: true,
    entries: {
      MH3U: {
        shorthand: "mh3u",
        role: { name: "Monster Hunter 3 Ultimate", colour: 0x00a8e8 },
      },
      MH4U: {
        shorthand: "mh4u",
        role: { name: "Monster Hunter 4 Ultimate", colour: 0xf0b028 },
      },
      MHGU: {
        shorthand: "mhgu",
        role: { name: "Monster Hunter Generations Ultimate", colour: 0xed2400 },
      },
      MHWIB: {
        shorthand: "mhwib",
        role: { name: "Monster Hunter World: Iceborne", colour: 0xa2d2ff },
      },
      MHRSB: {
        shorthand: "mhrsb",
        role: { name: "Monster Hunter Rise: Sunbreak", colour: 0x9b000e },
      },
      MHWSA: {
        shorthand: "mhwsa",
        role: { name: "Monster Hunter Wilds: Ascendance", colour: 0xfcd116 },
      },
    },
  },
} as const);

function buildDomains<T extends Record<string, RawDomain>>(raw: T) {
  const domains = {} as { [K in keyof T]: DomainDef };

  for (const domainName of Object.keys(raw) as (keyof T)[]) {
    const domain = raw[domainName];
    const prefix = String(domainName).toLowerCase();
    const entries: Record<string, DomainEntry> = {};
    let indexer = 0;

    for (const [key, entry] of Object.entries(domain.entries)) {
      const resolved: DomainEntry = { emoji: `${prefix}_${entry.shorthand}` };

      if (domain.hasBitmask) resolved.index = indexer++;
      if (entry.role) resolved.role = entry.role;
      entries[key] = resolved;
    }

    domains[domainName] = { bitmask: !!domain.hasBitmask, entries };
  }

  return domains;
}

export function orderByGame(accounts: InGameAccount[]) {
  const fetchGameIndex = (key: string) => GAME_ORDER.get(key) ?? Number.MAX_SAFE_INTEGER;

  return accounts.sort(
    (a, b) => fetchGameIndex(b.gameKey) - fetchGameIndex(a.gameKey) || a.name.localeCompare(b.name)
  );
}

const GAME_ORDER = new Map(Object.keys(DOMAINS.GAMES.entries).map((key, index) => [key, index]));

export interface DomainDef {
  bitmask: boolean;
  entries: Record<string, DomainEntry>;
}

interface DomainEntry {
  emoji: string;
  index?: number;
  role?: Role;
}

interface RawDomain {
  entries: Record<string, RawEntry>;
  hasBitmask?: boolean;
}

interface RawEntry {
  shorthand: string;
  role?: Role;
}

interface Role {
  name: string;
  colour: number;
}
