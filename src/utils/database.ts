import { Prisma, Profile } from "@prisma/client";
import { db } from "../database";
import { GUILD_ID, RELEASE } from "./constants";

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

export async function getColourPreference(
  user: string | Profile,
): Promise<number> {
  const profile = typeof user === "string" ? await getProfile(user) : user;

  if (!profile || profile.customColour === 0) return RELEASE.TINT;
  return profile.customColour;
}
