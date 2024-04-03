// Ours
import { Bulletin, Lobby } from "@/features/lobby/model";

// Discord.js
import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export const joinLobbyModalIdPrefix = "join-lobby-modal-";

export const joinLobbyButtonIdPrefix = "join-lobby-button-";
export const leaveLobbyButtonIdPrefix = "leave-lobby-button-";

export function getLobbyIdFromCustomId(customId: string) {
  const splitId = customId.split("-");

  return Number(splitId[splitId.length - 1]);
}

export function addIdSuffix(customIdPrefix: string, id: number) {
  return customIdPrefix + id.toString();
}

export function buildJoinModal(lobbyId: number) {
  const modal = new ModalBuilder()
    .setCustomId(addIdSuffix(joinLobbyModalIdPrefix, lobbyId))
    .setTitle("Join Lobby");

  const timeInput = new TextInputBuilder()
    .setCustomId("timeInput")
    .setRequired()
    .setLabel("How many minutes to remain in lobby")
    .setStyle(TextInputStyle.Short);

  const bulletin = new TextInputBuilder()
    .setCustomId("bulletin")
    .setRequired()
    .setLabel("What you're looking for")
    .setStyle(TextInputStyle.Paragraph);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(timeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(bulletin),
  );

  return modal;
}

const prettyBulletinBoard = (bulletins: Bulletin[]) =>
  bulletins
    .map((bulletin) => `<@!${bulletin.discordId}> - ${bulletin.bulletin}`)
    .join("\n");

export function buildLobbyActions(lobby: Lobby) {
  const joinButton = new ButtonBuilder()
    .setCustomId(addIdSuffix(joinLobbyButtonIdPrefix, lobby.id))
    .setLabel("Join Lobby")
    .setStyle(ButtonStyle.Primary);

  const leaveButton = new ButtonBuilder()
    .setCustomId(addIdSuffix(leaveLobbyButtonIdPrefix, lobby.id))
    .setLabel("Leave Lobby")
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    joinButton,
    leaveButton,
  );
}

export function buildLobbyEmbed(lobby: Lobby, bulletins: Bulletin[]) {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`The ${lobby.name} lobby`)
    .setDescription(lobby.description)
    .addFields({
      name: "Current Occupants",
      value: "\n" + prettyBulletinBoard(bulletins) + "\n",
    })
    .setTimestamp()
    .setFooter({
      text: "Click the buttons bellow to join/leave the list above",
      iconURL: "https://www.dojoscoreboard.com/logo192.png",
    });

  return embed;
}
