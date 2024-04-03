// Discord.js
import { DiscordAPIError, Guild, TextChannel } from "discord.js";

// Ours
import { DB } from "@/db";
import {
  Lobby,
  deleteLobbyEmbeds,
  getLobbyBulletins,
  getLobbyEmbeds,
} from "../model";
import { buildLobbyEmbed, buildLobbyActions } from "./ui";

export async function purgeLobbyMessages({
  db,
  lobby,
  channel,
}: {
  db: DB;
  lobby: Lobby;
  channel: TextChannel;
}) {
  const existingEmbeds = await getLobbyEmbeds(db, lobby.id);
  for (const { discordChannelId, discordMessageId } of existingEmbeds) {
    if (discordChannelId != channel.id) {
      continue;
    }

    const message = await channel.messages.fetch(discordMessageId);
    await message.delete();
  }

  await deleteLobbyEmbeds(db, lobby.id, channel.id);
}

export async function broadcastLobbyUpdate({
  db,
  lobby,
  guild,
}: {
  db: DB;
  lobby: Lobby;
  guild: Guild;
}) {
  const bulletins = await getLobbyBulletins(db, guild.id, lobby.name);
  const payload = {
    embeds: [buildLobbyEmbed(lobby, bulletins)],
    components: [buildLobbyActions(lobby)],
  };

  const existingEmbeds = await getLobbyEmbeds(db, lobby.id);
  for (const { discordChannelId, discordMessageId } of existingEmbeds) {
    const channel = await guild.channels
      .fetch(discordChannelId)
      .catch((err) => {
        // Unknown Channel (channel potentially deleted)
        if ("code" in err && err.code == 10003) {
          deleteLobbyEmbeds(db, lobby.id, discordChannelId);
          return;
        }

        throw err;
      });
    if (!channel) {
      continue;
    }

    if (!channel.isTextBased()) {
      continue;
    }

    const message = await channel.messages.fetch(discordMessageId);
    await message.edit(payload);
  }
}
