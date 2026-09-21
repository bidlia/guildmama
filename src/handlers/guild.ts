import { Guild } from "discord.js";
import { ensureGuild, markGuildLeft } from "../utils/database/guild";
import { log, loggable, LogModes } from "../utils/log";
import { ensureGuildRoles } from "../utils/role";
import { reconcileGuildMembers } from "../utils/database/reconcile";

export async function guildJoinHandler(guild: Guild) {
  await ensureGuild(guild.id);
  await ensureGuildRoles(guild);
  const newMemberCount = await reconcileGuildMembers(guild);

  log(LogModes.APP, `Joined guild ${loggable(guild)}; Reconciled ${newMemberCount} members.`);
}

export async function guildLeaveHandler(guild: Guild) {
  await markGuildLeft(guild.id);

  log(LogModes.WARN, `Left guild ${loggable(guild)}.`);
}
