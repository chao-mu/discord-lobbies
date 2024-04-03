import LobbyReadyEvent from "./events/ready";
import JoinLobbyButtonEvent from "./events/join-lobby-button";
import LeaveLobbyButtonEvent from "./events/leave-lobby-button";
import JoinLobbyModalEvent from "./events/join-lobby-modal";

import ShowLobbyCommandBuilder from "./commands/show-lobby";

export const getLobbyEventHandlers = () => [
  LobbyReadyEvent,
  JoinLobbyButtonEvent,
  LeaveLobbyButtonEvent,
  JoinLobbyModalEvent,
];

export const getLobbyCommandBuilders = () => [ShowLobbyCommandBuilder];
