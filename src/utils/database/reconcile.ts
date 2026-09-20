import { Client, Guild } from "discord.js";
import {
  ensureGuild,
  ensureGuildProfile,
  getAllGuildIds,
  markGuildLeft,
  purgeStaleGuilds,
} from "./guild";
import { log, loggable, LogModes } from "../log";
import { ensureGuildRoles } from "../role";
import { STALE_GRACE_MS } from "../constants";
import { ensureUser } from "./user";

export async function reconcileMembers(client: Client) {
  log(LogModes.BOOT, "Reconciling members...");

  let touched = 0;

  for (const guild of client.guilds.cache.values()) touched += await reconcileGuildMembers(guild);

  log(LogModes.BOOT, `Reconciled ${touched} member(s) across all guilds.`);
}

export async function reconcileGuilds(client: Client<true>) {
  log(LogModes.BOOT, "Reconciling guilds...");

  const trackedGuildIds = new Set(await getAllGuildIds());
  const actualGuildIds = new Set(client.guilds.cache.keys());
  const newlyJoined = [...actualGuildIds].filter((id) => !trackedGuildIds.has(id));

  for (const guild of client.guilds.cache.values()) {
    await ensureGuild(guild.id);

    const { created, updated } = await ensureGuildRoles(guild);
    if (created || updated)
      log(
        LogModes.WARN,
        `Modified Roles for Guild ${loggable(guild)}: ${created} created, ${updated} updated.`
      );
  }

  for (const guildId of newlyJoined) {
    const guild = client.guilds.cache.get(guildId)!;

    await ensureGuildRoles(guild);

    log(LogModes.WARN, `Joined guild ${loggable(guild)} while offline; Initialized.`);
  }

  for (const guildId of trackedGuildIds)
    if (!actualGuildIds.has(guildId)) {
      await markGuildLeft(guildId);

      log(LogModes.WARN, `Left guild ${guildId} while offline.`);
    }

  const cutoff = new Date(Date.now() - STALE_GRACE_MS);
  const purged = await purgeStaleGuilds(cutoff);

  log(LogModes.BOOT, `Reconciled ${actualGuildIds.size} guild(s) (${purged.count} purged).`);
}

export async function reconcileGuildMembers(guild: Guild) {
  const members = await guild.members.fetch();

  let touched = 0;

  for (const member of members.values()) {
    if (member.user.bot) continue;
    await ensureUser(member.id);
    await ensureGuildProfile(guild.id, member.id);
    touched++;
  }

  return touched;
}
