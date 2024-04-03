// Discord.js
import { Events } from "discord.js";

// Ours
import type { Event } from "@/types";
import { getLobbyIdFromCustomId, leaveLobbyButtonIdPrefix } from "@/ui/lobby";
import { getLobby, leaveLobby } from "@/model/lobby";
import { db } from "@/db";
import { getOrUpsertUser } from "@/model/user";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isMessageComponent()) return;
    if (!interaction.customId.startsWith(leaveLobbyButtonIdPrefix)) return;

    const lobbyId = getLobbyIdFromCustomId(interaction.customId);
    const lobby = await getLobby(db, lobbyId);
    const user = await getOrUpsertUser(db, interaction.user);

    await leaveLobby(db, user.id, lobbyId);

    interaction.reply(`✅ You are no longer in the ${lobby.name} lobby.`);
  },
} satisfies Event<Events.InteractionCreate>;
