import { Guild, GuildMember, Role } from "discord.js";
import { createRoleRecord, getRoleByKey, getRolesForGuild, untrackRole } from "./database/role";
import { DOMAINS } from "./domain";
import { UserProfile } from "@prisma/client";

export async function ensureGuildRoles(
  guild: Guild
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const [domainKey, domain] of Object.entries(DOMAINS)) {
    for (const [entryKey, entry] of Object.entries(domain.entries)) {
      if (!entry.role) continue;
      const key = `${domainKey}.${entryKey}`;
      const result = await ensureRole(guild, key, entry.role);
      if (result.created) created++;
      if (result.updated) updated++;
    }
  }

  return { created, updated };
}

async function ensureRole(
  guild: Guild,
  key: string,
  roleData: { name: string; colour: number }
): Promise<{ created: boolean; updated: boolean }> {
  const existing = await getRoleByKey(guild.id, key);

  if (existing) {
    const discordRole = await guild.roles.fetch(existing.id).catch(() => null);
    if (!discordRole) {
      await untrackRole(existing.id);
    } else {
      const stale =
        discordRole.name !== roleData.name || discordRole.colors.primaryColor !== roleData.colour;
      if (stale) {
        await discordRole.edit({ name: roleData.name, colors: { primaryColor: roleData.colour } });
        return { created: false, updated: true };
      }
      return { created: false, updated: false };
    }
  }

  const discordRole = await guild.roles.create({
    name: roleData.name,
    colors: { primaryColor: roleData.colour },
  });
  try {
    await createRoleRecord(discordRole.id, guild.id, key);
    return { created: true, updated: false };
  } catch (err) {
    await discordRole.delete().catch(() => {});
    throw err;
  }
}

export async function syncMemberRoles(member: GuildMember, profile: UserProfile): Promise<void> {
  const wanted = new Set<string>();

  for (const [domainKey, domain] of Object.entries(DOMAINS)) {
    if (!domain.bitmask) continue;
    const mask = profile[maskFieldFor(domainKey)] as number;

    for (const [entryKey, entry] of Object.entries(domain.entries)) {
      if (entry.index === undefined || !entry.role) continue;
      if ((mask & (1 << entry.index)) !== 0) wanted.add(`${domainKey}.${entryKey}`);
    }
  }

  const guildRoles = await getRolesForGuild(member.guild.id);
  const trackedRoleIds = new Set(guildRoles.map((r) => r.id));
  const wantedRoleIds = new Set(guildRoles.filter((r) => wanted.has(r.key)).map((r) => r.id));

  const untouchedRoleIds = member.roles.cache
    .filter((r) => !trackedRoleIds.has(r.id))
    .map((r) => r.id);
  const finalRoleIds = [...untouchedRoleIds, ...wantedRoleIds];

  await member.roles.set(finalRoleIds);
}

export function maskFieldFor(domainKey: string): keyof UserProfile {
  return `${domainKey.toLowerCase()}Mask` as keyof UserProfile;
}

export async function roleDeleteHandler(role: Role) {
  await untrackRole(role.id);
}
