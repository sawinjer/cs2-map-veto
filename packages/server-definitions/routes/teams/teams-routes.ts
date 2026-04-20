import Elysia from "elysia";
import { openHud, type OpenHudTeam } from "../../utils/openhud";

export const teamsRoutes = new Elysia({
  prefix: "/teams",
}).get("/", async (): Promise<OpenHudTeam[]> => {
  const teams = await openHud.fetchTeams();
  return teams;
});
