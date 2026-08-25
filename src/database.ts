import { PrismaClient } from "@prisma/client";
import { GUILD_ID } from "./utils/constants";

export const db: PrismaClient = new PrismaClient();

(async () => {
  await db.guild.upsert({
    where: { id: GUILD_ID },
    update: {},
    create: { id: GUILD_ID },
  });
})();
