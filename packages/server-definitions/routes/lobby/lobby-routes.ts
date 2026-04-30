import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import { getGame, onGameChange } from "../../storage/game-storage";
import { getLobby, onLobbyChange, saveLobby } from "../../storage/loby-storage";

const gameSubscribers: Partial<Record<string, () => void>> = {};
const lobbySubscribers: Partial<Record<string, () => void>> = {};

export const lobbyRoutes = new Elysia({
  prefix: "/lobby",
})
  .post("/:gameId", async (ctx) => {
    const { gameId } = ctx.params;
    const game = await getGame(gameId);
    if (!game) {
      return ctx.status("Not Found", "game not found");
    }

    const lobbyId = nanoid();
    await saveLobby(lobbyId, gameId);

    return lobbyId;
  })
  .patch(
    "/udpate/:lobbyId",
    async (ctx) => {
      const { lobbyId } = ctx.params;
      const lobby = await getLobby(lobbyId);
      const game = await getGame(ctx.query.gameId);
      if (!lobby || !game) {
        return ctx.status("Not Found");
      }

      await saveLobby(lobbyId, ctx.query.gameId);
      return "success";
    },
    { query: t.Object({ gameId: t.String() }) },
  )
  .ws("/watch/:lobbyId", {
    open: async (socket) => {
      const lobbyId = socket.data.params.lobbyId;
      const gameId = await getLobby(socket.data.params.lobbyId);

      if (!gameId) {
        socket.close();
        return;
      }

      const subscribeToGameChanges = async (gameId: string) => {
        const game = await getGame(gameId);
        if (!game) {
          return;
        }

        socket.send(JSON.stringify(game));
        const unsubscribeFromPrevChannel = gameSubscribers[socket.id];

        unsubscribeFromPrevChannel?.();
        gameSubscribers[socket.id] = onGameChange(gameId, (game) => {
          socket.send(JSON.stringify(game));
        });
      };

      lobbySubscribers[socket.id] = onLobbyChange(lobbyId, async (gameId) => {
        await subscribeToGameChanges(gameId);
      });

      await subscribeToGameChanges(gameId);
    },
    message: (socket, message) => {
      if ((message as Record<string, unknown>)?.type === "ping") {
        socket.send("pong");
      }
    },
    close: (socket) => {
      gameSubscribers[socket.id]?.();
      delete gameSubscribers[socket.id];

      lobbySubscribers[socket.id]?.();
      delete lobbySubscribers[socket.id];
    },
  });
