import { redis, redisSub } from "../redis";

const getLobyKey = (lobbyId: string) => `lobby:${lobbyId}`;
const getLobyChannel = (lobbyId: string) => `lobby:${lobbyId}:channel`;

export const saveLobby = async (lobbyId: string, gameId: string) => {
  await redis.set(getLobyKey(lobbyId), gameId);
  await redis.publish(getLobyChannel(lobbyId), gameId);
};

export const getLobby = async (lobbyId: string) => {
  return await redis.get(getLobyKey(lobbyId));
};

export const onLobbyChange = (
  lobbyId: string,
  handler: (newGameId: string) => void | Promise<void>,
): (() => void) => {
  const channel = getLobyChannel(lobbyId);

  redisSub.subscribe(channel, async (gameId) => {
    if (gameId) {
      await handler(gameId);
    }
  });

  return () => {
    redisSub.unsubscribe(channel);
  };
};
