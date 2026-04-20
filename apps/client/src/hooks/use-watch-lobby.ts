import type { GameState } from "@repo/server-definitions/client";
import { useCallback } from "react";
import { appendOponentSide } from "../utils/append-oponent-side";
import { server } from "../utils/server";
import { useWebSocket } from "./use-web-socket";

export const useWatchLobby = (lobbyId: string) => {
  const createChannel = useCallback(() => {
    return server.lobby.watch({ lobbyId }).subscribe();
  }, [lobbyId]);
  const game = useWebSocket(createChannel).data as GameState;

  return appendOponentSide(game);
};
