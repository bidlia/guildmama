export const DOMAINS = buildDomains({
  WEAPONS: {
    hasBitmask: true,
    entries: {
      GREAT_SWORD: {
        shorthand: "gs",
        role: { name: "Great Sword", colour: 0x000000 },
      },
      LONG_SWORD: {
        shorthand: "ls",
        role: { name: "Long Sword", colour: 0x000000 },
      },
      SWORD_AND_SHIELD: {
        shorthand: "sns",
        role: { name: "Sword & Shield", colour: 0x000000 },
      },
      DUAL_BLADES: {
        shorthand: "db",
        role: { name: "Dual Blades", colour: 0x000000 },
      },
      HAMMER: { shorthand: "ham", role: { name: "Hammer", colour: 0x000000 } },
      HUNTING_HORN: {
        shorthand: "hh",
        role: { name: "Hunting Horn", colour: 0x000000 },
      },
      LANCE: { shorthand: "lnc", role: { name: "Lance", colour: 0x000000 } },
      GUNLANCE: {
        shorthand: "gl",
        role: { name: "Gunlance", colour: 0x000000 },
      },
      SWITCH_AXE: {
        shorthand: "sa",
        role: { name: "Switch Axe", colour: 0x000000 },
      },
      CHARGE_BLADE: {
        shorthand: "cb",
        role: { name: "Charge Blade", colour: 0x000000 },
      },
      INSECT_GLAIVE: {
        shorthand: "ig",
        role: { name: "Insect Glaive", colour: 0x000000 },
      },
      BOW: { shorthand: "bow", role: { name: "Bow", colour: 0x000000 } },
      LIGHT_BOWGUN: {
        shorthand: "lbg",
        role: { name: "Light Bowgun", colour: 0x000000 },
      },
      HEAVY_BOWGUN: {
        shorthand: "hbg",
        role: { name: "Heavy Bowgun", colour: 0x000000 },
      },
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
      STEAM: { shorthand: "steam", role: { name: "Steam", colour: 0x000000 } },
      WINDOWS: {
        shorthand: "windows",
        role: { name: "Windows", colour: 0x000000 },
      },
      PLAYSTATION: {
        shorthand: "playstation",
        role: { name: "Playstation", colour: 0x000000 },
      },
      XBOX: { shorthand: "xbox", role: { name: "XBox", colour: 0x000000 } },
      SWITCH: {
        shorthand: "switch",
        role: { name: "Switch", colour: 0x000000 },
      },
      DS: {
        shorthand: "3ds",
        role: {
          name: "3DS",
          colour: 0x000000,
        },
      },
    },
  },

  GAMES: {
    hasBitmask: true,
    entries: {
      MH3U: {
        shorthand: "mh3u",
        role: { name: "Monster Hunter 3 Ultimate", colour: 0x000000 },
      },
      MH4U: {
        shorthand: "mh4u",
        role: { name: "Monster Hunter 4 Ultimate", colour: 0x000000 },
      },
      MHGU: {
        shorthand: "mhgu",
        role: { name: "Monster Hunter Generations Ultimate", colour: 0x000000 },
      },
      MHWIB: {
        shorthand: "mhwib",
        role: { name: "Monster Hunter World: Iceborne", colour: 0x000000 },
      },
      MHRSB: {
        shorthand: "mhrsb",
        role: { name: "Monster Hunter Rise: Sunbreak", colour: 0x000000 },
      },
      MHWSA: {
        shorthand: "mhwsa",
        role: { name: "Monster Hunter Wilds: Ascendance", colour: 0x000000 },
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
