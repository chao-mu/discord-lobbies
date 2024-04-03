// Discord.js
import { Events } from "discord.js";

// Ours
import type { Event } from "@/types";
import { getLobbyIdFromCustomId, joinLobbyModalIdPrefix } from "@/ui/lobby";
import { getLobby, joinLobby } from "@/model/lobby";
import { db } from "@/db";
import { getOrUpsertUser } from "@/model/user";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.guildId) return;
    if (!interaction.customId.startsWith(joinLobbyModalIdPrefix)) return;

    const lobbyId = getLobbyIdFromCustomId(interaction.customId);
    const lobby = await getLobby(db, lobbyId);

    const fields = interaction.fields;
    const timeInMinutesStr = fields.getTextInputValue("timeInput");

    const minutes = Number(timeInMinutesStr);
    if (!minutes) {
      await interaction.reply(
        `❌ Error! Invalid number of minutes specified. Was expecting a positive integer, e.g. 90. You supplied: ${timeInMinutesStr}`,
      );

      return;
    }

    const bulletin = fields.getTextInputValue("bulletin");

    const user = await getOrUpsertUser(db, interaction.user);
    await joinLobby({
      db,
      lobbyId,
      bulletin,
      discordGuildId: interaction.guildId,
      userId: user.id,
    });

    await interaction.reply(`✅ You have joined the ${lobby.name} lobby.`);
  },
} satisfies Event<Events.InteractionCreate>;
