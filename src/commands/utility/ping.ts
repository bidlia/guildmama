import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../types/command";
import { EmbedBuilder } from "@discordjs/builders";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Provides Bot latency and API ping"),
  async execute(interaction: ChatInputCommandInteraction) {
    const deferredReply = await interaction.deferReply({
      withResponse: true,
      flags: MessageFlags.Ephemeral,
    });
    const roundtripLatency =
      deferredReply.resource?.message?.createdTimestamp! -
      interaction.createdTimestamp;
    const websocketLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(pingToColour(roundtripLatency))
          .setAuthor({ name: "Pong!" })
          .setTitle(
            `Our connection is${pingToHealthMessage(roundtripLatency + websocketLatency)}`,
          )
          .setFooter({
            text: `Roundtrip: ${roundtripLatency} ms  •  Websocket: ${websocketLatency} ms`,
          }),
      ],
    });
  },
};

export default command;

function pingToColour(ping: number): number {
  const PING_MIN = 200;
  const PING_MAX = 600;
  const pingClamped = Math.max(PING_MIN, Math.min(ping, PING_MAX));
  const pingPercentage = pingClamped / PING_MAX;
  const r = Math.round(0 + (255 - 0) * pingPercentage);
  const b = Math.round(255 + (0 - 255) * pingPercentage);
  return (r << 16) + (200 << 8) + b;
}

function pingToHealthMessage(
  ping: number,
):
  | " great!"
  | " alright."
  | "n't great.\nSorry, I'm driving through a tunnel. 😔" {
  if (ping <= 250) return " great!";
  else if (ping > 250 && ping <= 600) return " alright.";
  return "n't great.\nSorry, I'm driving through a tunnel. 😔";
}
