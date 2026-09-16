import { Client } from "discord.js";
import {
  ensureGuild,
  getAllGuildIds,
  markGuildLeft,
  purgeStaleGuilds,
} from "./guild";
import { log, loggable, LogModes } from "../log";
import { ensureGuildRoles } from "../role";
import { STALE_GRACE_MS } from "../constants";

export async function reconcileGuilds(client: Client<true>) {
  log(LogModes.BOOT, "Reconciling guilds...");

  const trackedGuildIds = new Set(await getAllGuildIds());
  const actualGuildIds = new Set(client.guilds.cache.keys());
  const newlyJoined = [...actualGuildIds].filter(
    (id) => !trackedGuildIds.has(id),
  );

  for (const guild of client.guilds.cache.values()) await ensureGuild(guild.id);

  for (const guildId of newlyJoined) {
    const guild = client.guilds.cache.get(guildId)!;

    await ensureGuildRoles(guild);

    log(
      LogModes.WARN,
      `Joined guild ${loggable(guild)} while offline; Initialized.`,
    );
  }

  for (const guildId of trackedGuildIds)
    if (!actualGuildIds.has(guildId)) {
      await markGuildLeft(guildId);

      log(LogModes.WARN, `Left guild ${guildId} while offline.`);
    }

  const cutoff = new Date(Date.now() - STALE_GRACE_MS);
  const purged = await purgeStaleGuilds(cutoff);

  log(
    LogModes.BOOT,
    `Reconciled ${actualGuildIds.size} guilds (${purged.count} purged).`,
  );
}
