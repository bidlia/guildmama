import { Guild } from "discord.js";
import { ensureGuild, markGuildLeft } from "../utils/database/guild";
import { log, loggable, LogModes } from "../utils/log";
import { ensureGuildRoles } from "../utils/role";

export async function guildJoinHandler(guild: Guild) {
  await ensureGuild(guild.id);
  await ensureGuildRoles(guild);

  log(LogModes.APP, `Joined guild ${loggable(guild)}.`);
}

export async function guildLeaveHandler(guild: Guild) {
  await markGuildLeft(guild.id);

  log(LogModes.WARN, `Left guild ${loggable(guild)}.`);
}
