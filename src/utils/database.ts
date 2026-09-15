import { Profile } from "@prisma/client";
import { db } from "../database";
import { RELEASE } from "./constants";

type ProfileFields = Partial<Omit<Profile, "id" | "createdAt">>;

export async function upsertProfile(
  userId: string,
  update?: ProfileFields,
): Promise<Profile> {
  return db.profile.upsert({
    where: { id: userId },
    update: update ?? {},
    create: { id: userId, ...update },
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
