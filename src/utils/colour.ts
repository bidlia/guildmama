import { UserProfile } from "@prisma/client";
import { RELEASE } from "./constants";
import { getUser } from "./database/user";

export async function getColourPreference(user: string | UserProfile) {
  const profile = typeof user === "string" ? await getUser(user) : user;

  if (!profile || profile.customColour === 0) return RELEASE.TINT;
  return profile.customColour;
}
