import { Role } from "discord.js";
import { untrackRole } from "../utils/database/role";

export async function roleDeleteHandler(role: Role) {
  await untrackRole(role.id);
}
