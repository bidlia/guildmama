import { ApplicationEmoji, Client } from "discord.js";
import { DomainDef, DOMAINS } from "./domain";
import { log, LogModes } from "./log";

class EmojiCache {
  private _cache = new Map<string, ApplicationEmoji>();
  private _isLoaded = false;

  async load(client: Client) {
    log(LogModes.BOOT, `Fetching application emojis...`);

    if (!client.application) {
      throw new Error("Emoji load called before application is available");
    }

    const emojis = await client.application.emojis.fetch();

    for (const { emoji } of allEmojiNames(DOMAINS)) {
      const match = emojis.find((emj) => emj.name === emoji);
      if (match) this._cache.set(emoji, match);
      else log(LogModes.WARN, `No application emoji found matching "${emoji}"`);
    }

    log(LogModes.BOOT, `Cached ${this._cache.size} emojis.`);
    this._isLoaded = true;
  }

  get<D extends keyof typeof DOMAINS>(
    domainKey: D,
    entryKey: keyof (typeof DOMAINS)[D]["entries"]
  ) {
    const name = (DOMAINS[domainKey].entries as Record<string, { emoji: string }>)[
      entryKey as string
    ].emoji;
    return this._cache.get(name);
  }

  getByName(name: string) {
    return this._cache.get(name);
  }

  get isLoaded() {
    return this._isLoaded;
  }
}

export const emojiCache = new EmojiCache();

export function emojisFromMask(domainKey: keyof typeof DOMAINS, domain: DomainDef, mask: number) {
  return Object.entries(domain.entries)
    .filter(([, entry]) => entry.index !== undefined && (mask & (1 << entry.index)) !== 0)
    .map(([key]) => emojiCache.get(domainKey, key as never)?.toString() ?? key);
}

function allEmojiNames(domains: Record<string, DomainDef>) {
  const result: EmojiRef[] = [];

  for (const [domainKey, domain] of Object.entries(domains)) {
    for (const [entryKey, entry] of Object.entries(domain.entries)) {
      result.push({ domainKey, entryKey, emoji: entry.emoji });
    }
  }

  return result;
}

interface EmojiRef {
  domainKey: string;
  entryKey: string;
  emoji: string;
}
