// Discord.js
import { Events } from "discord.js";

// Ours
import type { Event } from "@/types";
import {
  buildJoinModal,
  getLobbyIdFromCustomId,
  joinLobbyButtonIdPrefix,
} from "@/ui/lobby";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isMessageComponent()) return;
    if (!interaction.customId.startsWith(joinLobbyButtonIdPrefix)) return;

    const lobbyId = getLobbyIdFromCustomId(interaction.customId);
    const modal = buildJoinModal(lobbyId);
    await interaction.showModal(modal);
  },
} satisfies Event<Events.InteractionCreate>;
