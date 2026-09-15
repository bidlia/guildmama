import {
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { log, LogModes } from "../utils/log";

export async function handleComponent(
  interaction: MessageComponentInteraction | ModalSubmitInteraction,
): Promise<void> {
  log(
    LogModes.WARN,
    `No component handler registered for customId "${interaction.customId}"`,
  );
}
