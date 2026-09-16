import { UserProfile } from "@prisma/client";
import { db } from "../../database";

export async function getUser(userId: string) {
  return db.userProfile.findUnique({
    where: { id: userId },
  });
}

export async function ensureUser(
  userId: string,
  update?: Partial<
    Omit<UserProfile, "id" | "createdAt" | "accounts" | "guilds">
  >,
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
