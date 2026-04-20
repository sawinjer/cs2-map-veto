import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import { Cs2Map } from "../../enums/Cs2Map";
import { Cs2Site } from "../../enums/Cs2Site";
import { GameType } from "../../enums/GameType";
import { PickStage } from "../../enums/PickStage";
import { Team } from "../../enums/Team";
import {
  type GameState,
  getGame,
  initGameState,
  saveGame,
  onGameChange,
} from "../../storage/game-storage";
import { type OpenHudVeto, openHud } from "../../utils/openhud";
import { team1KeyUtils, team2KeyUtils } from "./game-id-verification";

const subscribers: Partial<Record<string, () => void>> = {};

const cs2MapToOpenHudMap: Record<string, string> = {
  Ancient: "de_ancient",
  Anubis: "de_anubis",
  Dust2: "de_dust2",
  Inferno: "de_inferno",
  Mirage: "de_mirage",
  Nuke: "de_nuke",
  Overpass: "de_overpass",
};

const cs2SiteToSide = (site: Cs2Site | undefined): "CT" | "T" | "NO" => {
  if (site === Cs2Site.CTSite) return "CT";
  if (site === Cs2Site.TSite) return "T";
  return "NO";
};

const buildVetos = (inputGame: GameState): OpenHudVeto[] => {
  const game = structuredClone(inputGame);
  const vetos: OpenHudVeto[] = [];

  for (const stage of game.stages) {
    if (stage === PickStage.Team1Ban || stage === PickStage.Team2Ban) {
      const banRecord = game.banRecords.shift();

      if (!banRecord) {
        continue;
      }

      const teamId = stage === PickStage.Team1Ban ? game.team1Id : game.team2Id;

      vetos.push({
        mapName: cs2MapToOpenHudMap[banRecord.map] ?? (banRecord.map as string),
        type: "ban",
        teamId: teamId as string,
        side: "NO",
        mapEnd: false,
      });
    }

    if (stage === PickStage.Team1PickMap || stage === PickStage.Team2PickMap) {
      const teamId =
        stage === PickStage.Team1PickMap ? game.team1Id : game.team2Id;
      const map = game.pickedMaps.shift();

      if (!map) {
        continue;
      }

      vetos.push({
        mapName: cs2MapToOpenHudMap[map] ?? (map as string),
        type: "pick",
        teamId: teamId as string,
        side: "NO",
        mapEnd: false,
      });
    }
  }

  if (game.team1PickedSite) {
    game.team2PickedSite =
      game.team1PickedSite === Cs2Site.CTSite ? Cs2Site.TSite : Cs2Site.CTSite;
  }

  if (game.team2PickedSite) {
    game.team1PickedSite =
      game.team2PickedSite === Cs2Site.CTSite ? Cs2Site.TSite : Cs2Site.CTSite;
  }

  const lastTeam1Veto = vetos.findLast(
    (veto) => veto.teamId === game.team1Id && veto.type === "pick",
  );

  if (lastTeam1Veto) {
    lastTeam1Veto.side = cs2SiteToSide(game.team1PickedSite);
  }

  const lastTeam2Veto = vetos.findLast(
    (veto) => veto.teamId === game.team2Id && veto.type === "pick",
  );

  if (lastTeam2Veto) {
    lastTeam2Veto.side = cs2SiteToSide(game.team2PickedSite);
  }

  return vetos;
};

export const matchRoutes = new Elysia({
  prefix: "/match",
})
  .get("/:gameId", async (ctx) => {
    const game = await getGame(ctx.params.gameId);

    if (!game) {
      return ctx.status("Not Found", "game with this id was not found");
    }

    return game;
  })
  .get("/me/:gameId/:teamKey", async (ctx) => {
    const isTeam1Key = team1KeyUtils.verifyTeamKey(
      ctx.params.gameId,
      ctx.params.teamKey,
    );

    if (isTeam1Key) {
      return "team1";
    }

    const isTeam2Key = team2KeyUtils.verifyTeamKey(
      ctx.params.gameId,
      ctx.params.teamKey,
    );

    if (isTeam2Key) {
      return "team2";
    }

    return "none";
  })
  .post(
    "/",
    async (ctx) => {
      const gameId = nanoid();
      const { team1Id, team2Id } = ctx.query;

      const initialState = initGameState(ctx.query.type);
      const gameState = {
        ...initialState,
        team1Id,
        team2Id,
      };

      await saveGame(gameId, gameState);

      return {
        observerId: gameId,
        team1Key: team1KeyUtils.makeTeamKey(gameId),
        team2Key: team2KeyUtils.makeTeamKey(gameId),
      };
    },
    {
      query: t.Object({
        type: t.Enum(GameType),
        team1Id: t.Optional(t.String()),
        team2Id: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    "/vote/:gameId/:teamKey",
    async (ctx) => {
      const { map, site } = ctx.query;
      const options = [map, site].filter(Boolean);

      if (options.length !== 1) {
        return ctx.status("Bad Request", "Please, provide either map or site");
      }

      const isTeam1Key = team1KeyUtils.verifyTeamKey(
        ctx.params.gameId,
        ctx.params.teamKey,
      );

      const isTeam2Key = team2KeyUtils.verifyTeamKey(
        ctx.params.gameId,
        ctx.params.teamKey,
      );

      if (!isTeam1Key && !isTeam2Key) {
        return ctx.status("Forbidden", "not valid key");
      }

      const game = await getGame(ctx.params.gameId);

      if (!game) {
        return ctx.status("Not Found", "game with this id was not found");
      }

      const currentStage = game.stages[game.currentStage];

      if (!currentStage) {
        return ctx.status("Bad Request", "Game had finished");
      }

      const newGameState = structuredClone(game);
      let gameHadChanged = false;

      const bannedMaps = game.banRecords.map((r) => r.map);
      const mapCanBeBannedOrPicked =
        map && !bannedMaps.concat(game.pickedMaps).includes(map);

      if (map && !mapCanBeBannedOrPicked) {
        return ctx.status(
          "Bad Request",
          "You cannot change status of this map anymore",
        );
      }

      if (
        (currentStage === PickStage.Team1Ban &&
          isTeam1Key &&
          mapCanBeBannedOrPicked) ||
        (currentStage === PickStage.Team2Ban &&
          isTeam2Key &&
          mapCanBeBannedOrPicked)
      ) {
        newGameState.banRecords.push({
          map,
          team: isTeam1Key ? Team.Team1 : Team.Team2,
        });
        gameHadChanged = true;
      }

      if (
        (currentStage === PickStage.Team1PickMap &&
          isTeam1Key &&
          mapCanBeBannedOrPicked) ||
        (currentStage === PickStage.Team2PickMap &&
          isTeam2Key &&
          mapCanBeBannedOrPicked)
      ) {
        newGameState.pickedMaps.push(map);

        gameHadChanged = true;
      }

      if (currentStage === PickStage.Team1PickSide && isTeam1Key && site) {
        newGameState.team1PickedSite = site;
        gameHadChanged = true;
      }

      if (currentStage === PickStage.Team2PickSide && isTeam2Key && site) {
        newGameState.team2PickedSite = site;
        gameHadChanged = true;
      }

      if (!gameHadChanged) {
        return ctx.status(
          "Forbidden",
          "You have no access to change the game now",
        );
      }

      newGameState.currentStage += 1;
      await saveGame(ctx.params.gameId, newGameState);

      const gameFinished =
        newGameState.currentStage >= newGameState.stages.length;
      if (gameFinished && game.team1Id && game.team2Id) {
        const vetos = buildVetos(newGameState);
        const matchId = await openHud.createMatch(
          game.team1Id,
          game.team2Id,
          game.type,
          vetos,
        );
        if (matchId) {
          console.log(`[Match] Created OpenHud match: ${matchId}`);
        }
      }

      return "Success";
    },
    {
      query: t.Object({
        map: t.Optional(t.Enum(Cs2Map)),
        site: t.Optional(t.Enum(Cs2Site)),
      }),
    },
  )
  .ws("/watch/:gameId", {
    open: async (socket) => {
      const gameId = socket.data.params.gameId;
      const game = await getGame(gameId);

      if (!game) {
        socket.close();
        return;
      }

      socket.send(JSON.stringify(game));

      subscribers[socket.id] = onGameChange(gameId, (game) => {
        socket.send(JSON.stringify(game));
      });
    },
    message: (socket, message) => {
      if ((message as Record<string, unknown>)?.type === "ping") {
        socket.send("pong");
      }
    },
    close: (socket) => {
      subscribers[socket.id]?.();
      delete subscribers[socket.id];
    },
  });
