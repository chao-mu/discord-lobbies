// Discord.js
import { Events } from "discord.js";

// Ours
import type { Event } from "@/discord/events";
import {
  getLobbyIdFromCustomId,
  leaveLobbyButtonIdPrefix,
} from "@/features/lobby/discord/ui";
import { getLobby, leaveLobby } from "@/features/lobby/model";
import { db } from "@/db";
import { getOrUpsertUser } from "@/features/user/model";
import { broadcastLobbyUpdate } from "../util";

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
