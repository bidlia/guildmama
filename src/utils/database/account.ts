import { Prisma } from "@prisma/client";
import { DOMAINS } from "../domain";
import { db } from "../../database";
import { ensureUser } from "./user";

export async function getAccount(accountId: string) {
  return db.inGameAccount.findUnique({
    where: { id: accountId },
  });
}

export async function getAccountsForUser(userId: string) {
  return db.inGameAccount.findMany({
    where: { userId },
  });
}

export async function ensureAccount(
  accountId: string,
  userId: string,
  data: AccountData,
) {
  if (!isValidGameKey(data.gameKey)) {
    throw new Error(
      `Invalid gameKey "${data.gameKey}" — no matching GAMES entry`,
    );
  }
  if (data.platformKey !== undefined && !isValidPlatformKey(data.platformKey)) {
    throw new Error(
      `Invalid platformKey "${data.platformKey}" — no matching PLATFORMS entry`,
    );
  }

  return db.inGameAccount.upsert({
    where: { id: accountId },
    update: data,
    create: { id: accountId, userId, ...data },
  });
}

export async function transferAccount(accountId: string, newUserId: string) {
  await ensureUser(newUserId);

  return db.inGameAccount.update({
    where: { id: accountId },
    data: { userId: newUserId },
  });
}

export async function deleteAccount(accountId: string) {
  return db.inGameAccount
    .delete({
      where: { id: accountId },
    })
    .catch(() => null);
}

export async function deleteAccountsForUser(userId: string) {
  return db.inGameAccount.deleteMany({ where: { userId } });
}

function isValidGameKey(key: string): boolean {
  return key in DOMAINS.GAMES.entries;
}

function isValidPlatformKey(key: string): boolean {
  return key === "" || key in DOMAINS.PLATFORMS.entries;
}

type AccountData = Omit<
  Prisma.InGameAccountUncheckedCreateInput,
  "id" | "userId"
>;
