import {
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export async function replyEphemeralSuccess(
  interaction:
    | ChatInputCommandInteraction
    | MessageComponentInteraction
    | ModalSubmitInteraction,
  message?: string,
) {
  if (!message) {
    message = "Success!";
  }

  const payload = {
    content: `✅ ${message}\nThis message will self destruct.`,
    ephemeral: true,
  };

  await interaction.reply(payload);

  setTimeout(() => interaction.deleteReply(), 10000);
}
