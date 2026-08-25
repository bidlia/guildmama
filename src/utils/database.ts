import { Prisma, Profile } from "@prisma/client";
import { db } from "../database";
import { GUILD_ID } from "./constants";

export async function upsertProfile(
  userId: string,
  update?: Prisma.ProfileUpdateInput,
): Promise<Profile> {
  return db.profile.upsert({
    where: { id: userId },
    update: update ? update : {},
    create: {
      ...(update as Prisma.ProfileCreateWithoutGuildInput),
      id: userId,
      guildId: GUILD_ID,
    },
  });
}

export async function getProfile(userId: string): Promise<Profile | null> {
  return db.profile.findUnique({
    where: {
      id: userId,
    },
  });
}
