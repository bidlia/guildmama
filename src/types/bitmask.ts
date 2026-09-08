export type EnumLike = Record<string, number>;
export type IndexOf<T extends EnumLike> = T[keyof T];
