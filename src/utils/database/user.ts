import { InGameAccount, UserProfile } from "@prisma/client";
import { db } from "../../database";

export async function getUser(userId: string) {
  return db.userProfile.findUnique({
    where: { id: userId },
  });
}

export async function ensureUser(
  userId: string,
  update?: Partial<Omit<UserProfile, "id" | "createdAt" | "accounts" | "guilds">>
) {
  return db.userProfile.upsert({
    where: { id: userId },
    update: update ?? {},
    create: { id: userId, ...update },
  });
}

export async function deleteUser(userId: string) {
  return db.userProfile
    .delete({
      where: { id: userId },
    })
    .catch(() => null);
}

export async function getUserWithRelations(userId: string) {
  return db.userProfile.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      guilds: true,
    },
  });
}

const accountsCache = new Map<
  string,
  { data: (UserProfile & { accounts: InGameAccount[] }) | null; expires: number }
>();

const CACHE_TTL_MS = 20000;

export async function getCachedUserWithAccounts(userId: string) {
  const cached = accountsCache.get(userId);
  if (cached && cached.expires > Date.now()) return cached.data;

  const user = await db.userProfile.findUnique({
    where: { id: userId },
    include: { accounts: true },
  });

  accountsCache.set(userId, { data: user, expires: Date.now() + CACHE_TTL_MS });
  return user;
}

export function invalidateAccountsCache(userId: string) {
  accountsCache.delete(userId);
}
