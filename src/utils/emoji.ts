import { ApplicationEmoji, Client, Collection } from "discord.js";
import { DOMAINS } from "./constants";
import { EmojiMap, Emojis } from "../types/emoji";
import { EnumLike } from "../types/bitmask";

export let EMOJIS: Emojis;

export async function fetchApplicationEmojis(client: Client<true>) {
  const fetched = await client.application.emojis.fetch();

  const result = {} as Emojis;
  for (const key of Object.keys(DOMAINS) as (keyof typeof DOMAINS)[]) {
    (result as any)[key] = buildEmojiMap(DOMAINS[key], fetched);
  }

  EMOJIS = result;
}

export function buildEmojiMap<T extends EnumLike>(
  domain: T,
  fetched: Collection<string, ApplicationEmoji>,
): EmojiMap<T> {
  const byName = new Map(fetched.map((e) => [e.name, e]));
  const emojiCache = {} as EmojiMap<T>;

  for (const key of Object.keys(domain) as (keyof T)[]) {
    const emoji = byName.get(key as string);
    if (!emoji) {
      throw new Error(
        `[Err]: No matching application emoji found for key "${String(key)}"`,
      );
    }
    emojiCache[key] = emoji.toString();
  }

  return emojiCache;
}
