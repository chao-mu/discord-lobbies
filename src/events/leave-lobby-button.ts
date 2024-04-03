// Discord.js
import { Events, Guild } from "discord.js";

// Ours
import type { Event } from "@/types";
import {
  buildLobbyActions,
  buildLobbyEmbed,
  getLobbyIdFromCustomId,
  leaveLobbyButtonIdPrefix,
} from "@/ui/lobby";
import {
  Lobby,
  getLobby,
  getLobbyBulletins,
  getLobbyEmbeds,
  leaveLobby,
} from "@/model/lobby";
import { type DB, db } from "@/db";
import { getOrUpsertUser } from "@/model/user";

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
    const channel = await guild.channels.fetch(discordChannelId);
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

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isMessageComponent()) return;
    if (!interaction.guild) return;
    if (!interaction.customId.startsWith(leaveLobbyButtonIdPrefix)) return;

    const lobbyId = getLobbyIdFromCustomId(interaction.customId);
    const lobby = await getLobby(db, lobbyId);
    const user = await getOrUpsertUser(db, interaction.user);

    await leaveLobby(db, user.id, lobbyId);
    await broadcastLobbyUpdate({ db, lobby, guild: interaction.guild });

    interaction.reply(`✅ You are no longer in the ${lobby.name} lobby.`);
  },
} satisfies Event<Events.InteractionCreate>;
