import { Guild, GuildMember } from "discord.js";
import { createRoleRecord, getRoleByKey, getRolesForGuild } from "./database/role";
import { DOMAINS } from "./domain";
import { UserProfile } from "@prisma/client";

export async function ensureGuildRoles(guild: Guild) {
  for (const [domainKey, domain] of Object.entries(DOMAINS)) {
    for (const [entryKey, entry] of Object.entries(domain.entries)) {
      if (!entry.role) continue;

      const key = `${domainKey}.${entryKey}`;
      await ensureRole(guild, key, entry.role);
    }
  }
}

async function ensureRole(guild: Guild, key: string, roleData: { name: string; colour: number }) {
  const existing = await getRoleByKey(guild.id, key);
  if (existing) return existing;

  const discordRole = await guild.roles.create({
    name: roleData.name,
    colors: { primaryColor: roleData.colour },
  });

  try {
    return await createRoleRecord(discordRole.id, guild.id, key);
  } catch (err) {
    await discordRole.delete().catch(() => {});
    throw err;
  }
}

export async function syncMemberRoles(member: GuildMember, profile: UserProfile) {
  const wanted = computeWantedRoleKeys(profile);
  const guildRoles = await getRolesForGuild(member.guild.id);

  for (const role of guildRoles) {
    const should = wanted.has(role.key);
    const has = member.roles.cache.has(role.id);

    if (should && !has) await member.roles.add(role.id).catch(() => {});
    if (!should && has) await member.roles.remove(role.id).catch(() => {});
  }
}

function computeWantedRoleKeys(profile: UserProfile): Set<string> {
  const wanted = new Set<string>();

  for (const [domainKey, domain] of Object.entries(DOMAINS)) {
    if (!domain.bitmask) continue;

    const mask = profile[maskFieldFor(domainKey)] as number;

    for (const [entryKey, entry] of Object.entries(domain.entries)) {
      if (entry.index === undefined || !entry.role) continue;
      if ((mask & (1 << entry.index)) !== 0) {
        wanted.add(`${domainKey}.${entryKey}`);
      }
    }
  }

  return wanted;
}

function maskFieldFor(domainKey: string): keyof UserProfile {
  return `${domainKey.toLowerCase()}Mask` as keyof UserProfile;
}
