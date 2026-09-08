import { DOMAINS } from "../utils/constants";
import { buildEmojiMap } from "../utils/emoji";
import { EnumLike } from "./bitmask";

export type EmojiMap<T extends EnumLike> = { [K in keyof T]: string };

export type Emojis = {
  [K in keyof typeof DOMAINS]: ReturnType<
    typeof buildEmojiMap<(typeof DOMAINS)[K]>
  >;
};
