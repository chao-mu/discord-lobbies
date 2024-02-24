// Moment
import moment from "moment";

// Discord.js
import {
  GuildMember,
  Guild,
  User as DiscordUser,
  ChannelType,
  TextChannel,
  ThreadAutoArchiveDuration,
} from "discord.js";

// Ours
import type { CommandBuilder } from "@/types";
import {
  getLobbies,
  getLobby,
  getLobbyBulletins,
  joinLobby,
  Lobby,
} from "@/model/lobby";
import { getUser } from "@/model/user";
import { db } from "@/db";

async function alertLobbyMember({
  member,
  channel,
  lobby,
  bulletin,
  joiner,
  guild,
}: {
  member: GuildMember;
  lobby: Lobby;
  channel: TextChannel;
  guild: Guild;
  bulletin: string;
  joiner: DiscordUser;
}) {
  const lobbyName = lobby.name;

  console.log("creating thread");
  const thread = await channel.threads.create({
    name: `lobby-thread (${lobbyName})`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
    type: ChannelType.PrivateThread,
    reason: "Lobby member alert",
  });

  console.log("adding members");
  await thread.members.add(member.id);
  await thread.members.add(joiner.id);

  console.log("sending message");
  const threadLink = `<#${thread.id}>`;
  await member.send(
    `${joiner.displayName} has joined the ${lobbyName} lobby on ${guild.name}. They're looking for: ${bulletin}. Say hi in ${threadLink}!`,
  );

  console.log("done!");
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

    const user = await getUser(db, interaction.user);
    const lobby = await getLobby(db, lobbyName);

    const previousJoined = await joinLobby({
      db,
      bulletin,
      userId: user.id,
      lobbyId: lobby.id,
      discordGuildId: guild.id,
    });

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

    for (const { discordId } of bulletins) {
      const member = await guild.members.fetch(discordId);

      await alertLobbyMember({
        member,
        lobby,
        guild,
        channel,
        bulletin,
        joiner: interaction.user,
      });
    }

    let replyMsg = `You have joined the ${lobbyName} lobby. The ${bulletins.length} other players in the lobby have been messaged.`;
    if (bulletins.length === 0) {
      replyMsg +=
        "\nOh, you're the only one here :-(. Maybe play some blunder games while you wait for others to join?";
    }

    await interaction.reply(replyMsg);
  },
} satisfies CommandBuilder;
