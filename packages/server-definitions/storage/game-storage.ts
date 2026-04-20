import type { Cs2Map } from "../enums/Cs2Map";
import type { Cs2Site } from "../enums/Cs2Site";
import type { Team } from "../enums/Team";
import { GameType } from "../enums/GameType";
import { PickStage } from "../enums/PickStage";
import { redis, redisSub } from "../redis";
import { safeTry } from "../utils/safe-try";

export type BanRecord = {
  map: Cs2Map;
  team: Team;
};

export type GameState = {
  type: GameType;
  stages: PickStage[];
  currentStage: number;
  pickedMaps: Cs2Map[];
  banRecords: BanRecord[];
  team1PickedSite?: Cs2Site;
  team2PickedSite?: Cs2Site;
  team1Id?: string;
  team2Id?: string;
};

export const initGameState = (type: GameType): GameState => {
  let stages: PickStage[] = [];

  if (type === GameType.BestOf1) {
    stages = [
      PickStage.Team1Ban,
      PickStage.Team1Ban,
      PickStage.Team2Ban,
      PickStage.Team2Ban,
      PickStage.Team2Ban,
      PickStage.Team1PickMap,
      PickStage.Team2PickSide,
    ];
  }

  if (type === GameType.BestOf3) {
    stages = [
      PickStage.Team1Ban,
      PickStage.Team2Ban,
      PickStage.Team1PickMap,
      PickStage.Team2PickMap,
      PickStage.Team1Ban,
      PickStage.Team2PickMap,
      PickStage.Team1PickSide,
    ];
  }

  return {
    type,
    stages,
    currentStage: 0,
    banRecords: [],
    pickedMaps: [],
  };
};

const getGameKey = (gameId: string) => `game:${gameId}`;
const getGameChannel = (gameId: string) => `game:${gameId}:changes`;

export const saveGame = async (gameId: string, state: GameState) => {
  await redis.set(getGameKey(gameId), JSON.stringify(state));
  await redis.publish(getGameChannel(gameId), JSON.stringify(state));
};

export const getGame = async (
  gameId: string,
): Promise<GameState | undefined> => {
  const state = await redis.get(getGameKey(gameId));

  if (!state) {
    return;
  }

  const [parsed] = safeTry(() => JSON.parse(state));
  return parsed || undefined;
};

const gameHandlers = new Map<string, Set<(state: GameState) => void>>();

export const onGameChange = (
  gameId: string,
  handler: (state: GameState) => void,
): (() => void) => {
  const channel = getGameChannel(gameId);

  if (!gameHandlers.has(channel)) {
    gameHandlers.set(channel, new Set());
    redisSub.subscribe(channel, (message) => {
      const [parsed] = safeTry(() => JSON.parse(message));
      if (parsed) {
        gameHandlers.get(channel)?.forEach((h) => h(parsed));
      }
    });
  }

  gameHandlers.get(channel)!.add(handler);

  return () => {
    const handlers = gameHandlers.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        gameHandlers.delete(channel);
        redisSub.unsubscribe(channel);
      }
    }
  };
};
