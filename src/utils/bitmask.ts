import { EnumLike, IndexOf } from "../types/bitmask";

export function fromBitmask<T extends EnumLike>(
  domain: T,
  mask: number,
): IndexOf<T>[] {
  const indexes: IndexOf<T>[] = [];

  for (const index of Object.values(domain))
    if (mask & (1 << index)) indexes.push(index as IndexOf<T>);

  return indexes;
}

export function toBitmask(indexes: number[]): number {
  let mask = 0;
  for (const index of indexes) mask |= 1 << index;
  return mask;
}

export function nameFromIndex<T extends EnumLike>(
  domain: T,
  index: number,
): keyof T {
  const entry = Object.entries(domain).find(([, value]) => value === index);
  if (!entry) throw new Error(`[Err]: No key in domain for index ${index}.`);
  return entry[0] as keyof T;
}

export function namesFromBitmask<T extends EnumLike>(
  domain: T,
  mask: number,
): (keyof T)[] {
  return fromBitmask(domain, mask).map((index) => nameFromIndex(domain, index));
}

export function emojisFromBitmask<T extends EnumLike>(
  domain: T,
  emojiMap: { [K in keyof T]: string },
  mask: number,
): string[] {
  return fromBitmask(domain, mask)
    .map((idx) => nameFromIndex(domain, idx as number))
    .map((name) => (emojiMap as any)[name]);
}

export function toggleBit(mask: number, index: number): number {
  return mask ^ (1 << index);
}
