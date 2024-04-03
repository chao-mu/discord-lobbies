import LobbyReadyEvent from "./events/ready";
import JoinLobbyButtonEvent from "./events/join-lobby-button";
import LeaveLobbyButtonEvent from "./events/leave-lobby-button";
import JoinLobbyModalEvent from "./events/join-lobby-modal";

export const getLobbyEventHandlers = () => [
  LobbyReadyEvent,
  JoinLobbyButtonEvent,
  LeaveLobbyButtonEvent,
  JoinLobbyModalEvent,
];

export const getLobbyCommandBuilders = () => [];
