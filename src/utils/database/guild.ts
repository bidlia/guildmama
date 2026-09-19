import { db } from "../../database";

export async function getGuild(guildId: string) {
  return db.guild.findUnique({
    where: { id: guildId },
  });
}

export async function ensureGuild(guildId: string) {
  return db.guild.upsert({
    where: { id: guildId },
    update: { leftAt: null },
    create: { id: guildId },
  });
}

export async function markGuildLeft(guildId: string) {
  return db.guild.update({
    where: { id: guildId },
    data: { leftAt: new Date() },
  });
}

export async function getGuildWithRelations(guildId: string) {
  return db.guild.findUnique({
    where: { id: guildId },
    include: {
      roles: true,
      users: true,
    },
  });
}

export async function getAllGuildIds() {
  const guilds = await db.guild.findMany({
    where: { leftAt: null },
    select: { id: true },
  });
  return guilds.map((gld) => gld.id);
}

export async function purgeStaleGuilds(olderThan: Date) {
  return db.guild.deleteMany({
    where: { leftAt: { lt: olderThan } },
  });
}

export async function ensureGuildProfile(guildId: string, userId: string) {
  const guild = (await db.guild.findUnique({
    where: { id: guildId },
    select: { defaultAuthority: true },
  }))!;

  return db.guildProfile.upsert({
    where: { guildId_userId: { guildId, userId } },
    update: {},
    create: { guildId, userId, authority: guild?.defaultAuthority },
  });
}
