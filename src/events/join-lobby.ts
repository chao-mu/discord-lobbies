// Discord.js
import { Events } from "discord.js";

// Ours
import type { Event } from "@/types";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId != "join-lobby") return;

    const fields = interaction.fields;
    const timeInMinutesStr = fields.getTextInputValue("timeInput");

    const minutes = Number(timeInMinutesStr);
    if (!minutes) {
      interaction.reply(
        `❌ Error! Invalid number of minutes specified. Was expecting a positive integer, e.g. 90. You supplied: ${timeInMinutesStr}`,
      );
      return;
    }

    interaction.reply("✅ Success!");
  },
} satisfies Event<Events.InteractionCreate>;
