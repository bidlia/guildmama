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

export function prettifyGameRank(tier: number): string {
  const levelingEmoji = ":star:";
  const maxLevelEmoji = ":sparkles:";

  switch (tier) {
    case 0:
      return "none";
    case 1:
      return `${levelingEmoji}  HR < 100`;
    case 11:
      return `${maxLevelEmoji}  HR **999**`;
    default:
      return `${levelingEmoji}  HR ${tier - 1}00+`;
  }
}
