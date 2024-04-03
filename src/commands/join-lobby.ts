// Moment
import moment from "moment";

// Discord.js
import {
  GuildMember,
  Guild,
  User as DiscordUser,
  TextChannel,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

// Ours
import type { CommandBuilder } from "@/types";
import {
  getLobbies,
  getLobby,
  leaveLobbies,
  joinLobby,
  Lobby,
} from "@/model/lobby";
import { getOrUpsertUser } from "@/model/user";
import { db } from "@/db";

async function inviteLobbyMember({
  member,
  memberUserId,
  joiner,
  lobby,
  guild,
  bulletin,
  channel,
}: {
  member: GuildMember;
  memberUserId: number;
  joiner: DiscordUser;
  lobby: Lobby;
  guild: Guild;
  bulletin: string;
  channel: TextChannel;
}) {
  const accept = new ButtonBuilder()
    .setCustomId("accept")
    .setLabel("Accept")
    .setStyle(ButtonStyle.Primary);

  const decline = new ButtonBuilder()
    .setCustomId("decline")
    .setLabel("Decline")
    .setStyle(ButtonStyle.Secondary);

  const unsubscribe = new ButtonBuilder()
    .setCustomId("leave")
    .setLabel("Leave all lobbies")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    accept,
    decline,
    unsubscribe,
  );

  const joinerName = joiner.displayName;
  const lobbyName = lobby.name;

  const messageContent = `${joinerName} joined ${lobbyName}. Their bulletin: ${bulletin}.`;

  const message = await member.send({
    content: messageContent,
    components: [row],
  });

  message
    .createMessageComponentCollector({
      time: 60 * 1000,
    })
    .on("collect", async (i) => {
      if (i.customId === "leave") {
        await leaveLobbies(db, memberUserId);
        await message.reply(
          "You have left all lobbies. You will need to rejoin to resume receiving these notifications.",
        );
      } else if (i.customId === "decline") {
        await message.reply("You have declined the offer.");
      } else if (i.customId === "accept") {
        await message.reply(
          `You have accepted and they have been notified! Proceed to <#${channel.id}> to meet the user!`,
        );
        await joiner.dmChannel?.send(
          `${member.displayName} has accepted your offer! Perhaps offer to help them with what they need as well? Proceed to <#${channel.id}> to message the user!`,
        );
      }
      await i.update({
        content: messageContent,
        components: [],
      });
    });
}

function buildJoinModal() {
  const modal = new ModalBuilder()
    .setCustomId("join-lobby")
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

export default {
  build: async ({ builder }) => {
    builder = builder
      .setName("join-lobby")
      .setDescription("Join a lobby to be paired with other players");

    const lobbies = await getLobbies(db);
    lobbies.forEach((lobby) => {
      builder.addSubcommand((subcommand) =>
        subcommand
          .setName(lobby.name)
          .setDescription(lobby.description)
          .addStringOption((option) =>
            option
              .setName("bulletin")
              .setDescription(
                "Describe what you're looking for. Other players will see this when you join.",
              )
              .setRequired(true),
          ),
      );
    });

    return builder;
  },
  async execute({ interaction, db }) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply("This command must be used in a server");
      return;
    }
    const lobbyName = interaction.options.getSubcommand();
    if (!lobbyName) {
      await interaction.reply("You must provide a lobby name");
      return;
    }

    const bulletin = interaction.options.getString("bulletin");
    if (!bulletin) {
      await interaction.reply("You must provide a bulletin to join a lobby");
      return;
    }

    const channel = interaction.channel;
    if (!(channel instanceof TextChannel)) {
      await interaction.reply("This command must be used in a channel");
      return;
    }

    const user = await getOrUpsertUser(db, interaction.user);
    const lobby = await getLobby(db, lobbyName);

    const previousJoined = await joinLobby({
      db,
      bulletin,
      userId: user.id,
      lobbyId: lobby.id,
      discordGuildId: guild.id,
    });

    /*
    if (previousJoined) {
      const timeAgo = moment(previousJoined).fromNow();
      await interaction.reply(
        `You already joined ${timeAgo}! Renewing your timeout.`,
      );
      return;
    }

    const bulletins = await getLobbyBulletins(db, guild.id, lobbyName).then(
      (bulletins) => bulletins.filter(({ userId }) => userId !== user.id),
    );

    for (const { discordId, userId } of bulletins) {
      const member = await guild.members.fetch(discordId);

      if (!member) {
        continue;
      }

      await inviteLobbyMember({
        member,
        memberUserId: userId,
        joiner: interaction.user,
        lobby,
        guild,
        bulletin,
        channel,
      });
    }

    let replyMsg = `You have joined the ${lobbyName} lobby. The ${bulletins.length} other players in the lobby have been messaged.`;
    if (bulletins.length === 0) {
      replyMsg +=
        "\nOh, you're the only one here :-(. Maybe analyze some games while you wait for others to join?";
    }
    */

    const modal = buildJoinModal();
    await interaction.showModal(modal);
  },
} satisfies CommandBuilder;
