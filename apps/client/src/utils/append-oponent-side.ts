import { Cs2Site, type GameState } from "@repo/server-definitions/client";

export const appendOponentSide = (game: GameState) => {
  if (!game) {
    return game;
  }

  const result = { ...game };

  if (result.team1PickedSite) {
    result.team2PickedSite =
      result.team1PickedSite === Cs2Site.TSite ? Cs2Site.CTSite : Cs2Site.TSite;
  }

  if (result.team2PickedSite) {
    result.team1PickedSite =
      result.team2PickedSite === Cs2Site.TSite ? Cs2Site.CTSite : Cs2Site.TSite;
  }

  return result;
};
