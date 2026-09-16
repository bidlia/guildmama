import { GuildMember, PartialGuildMember } from "discord.js";
import { ensureUser } from "../utils/database/user";
import { ensureGuildProfile } from "../utils/database/guild";
import { log, loggable, LogModes } from "../utils/log";
import { syncMemberRoles } from "../utils/role";

export async function memberJoinHandler(member: GuildMember) {
  const profile = await ensureUser(member.user.id);
  await ensureGuildProfile(member.guild.id, member.user.id);
  await syncMemberRoles(member, profile);

  log(
    LogModes.APP,
    `User ${loggable(member)} joined guild ${loggable(member.guild)}`,
  );
}

export async function memberLeaveHandler(
  member: GuildMember | PartialGuildMember,
) {
  log(
    LogModes.WARN,
    `User ${loggable(member)} left guild ${loggable(member.guild)}.`,
  );
}
