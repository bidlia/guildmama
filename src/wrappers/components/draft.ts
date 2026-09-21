export function defineDraftState<K extends string>(keys: readonly K[]) {
  type Draft = Record<K, string | undefined>;

  return {
    encode(draft: Partial<Draft>): string[] {
      return keys.map((k) => draft[k] ?? "");
    },
    decode(args: string[]): Draft {
      const draft = {} as Draft;
      keys.forEach((k, i) => {
        draft[k] = args[i] || undefined;
      });
      return draft;
    },
  };
}
