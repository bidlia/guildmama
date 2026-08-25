import { Profile } from "@prisma/client";
import { db } from "../database";
import { GUILD_ID } from "./constants";

export async function getProfile(userId: string): Promise<Profile> {
  return db.profile.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, guildId: GUILD_ID },
  });
}
