import { db } from "../../database";

export async function getRole(roleId: string) {
  return db.role.findUnique({
    where: { id: roleId },
  });
}

export async function getRoleByKey(guildId: string, key: string) {
  return db.role.findUnique({
    where: { guildId_key: { guildId, key } },
  });
}

export async function getRolesForGuild(guildId: string) {
  return db.role.findMany({
    where: { guildId },
  });
}

export async function createRoleRecord(
  roleId: string,
  guildId: string,
  key: string,
) {
  return db.role.create({
    data: { id: roleId, guildId, key },
  });
}

export async function untrackRole(roleId: string) {
  return db.role.deleteMany({ where: { id: roleId } });
}

export async function untrackRoleByKey(guildId: string, key: string) {
  return db.role.deleteMany({ where: { guildId, key } });
}
