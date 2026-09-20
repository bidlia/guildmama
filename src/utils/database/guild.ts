import { Prisma } from "@prisma/client";
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

export async function getGuildProfile(guildId: string, userId: string) {
  return db.guildProfile.findUnique({
    where: { guildId_userId: { guildId, userId } },
    include: { user: true },
  });
}

const guildMembersCache = new Map<string, { data: GuildMemberWithAccounts[]; expires: number }>();
const CACHE_TTL_MS = 10_000;

type GuildMemberWithAccounts = Prisma.UserProfileGetPayload<{
  include: { accounts: true };
}>;

export async function getCachedGuildMembers(guildId: string): Promise<GuildMemberWithAccounts[]> {
  const cached = guildMembersCache.get(guildId);
  if (cached && cached.expires > Date.now()) return cached.data;

  const members = await db.guildProfile.findMany({
    where: { guildId },
    include: { user: { include: { accounts: true } } },
  });
  const users = members.map((m) => m.user);

  guildMembersCache.set(guildId, { data: users, expires: Date.now() + CACHE_TTL_MS });
  return users;
}

export function invalidateGuildMembersCache(userId: string) {
  guildMembersCache.delete(userId);
}
