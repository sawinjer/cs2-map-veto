import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { redis, redisSub } from "./redis";
import { healthRoute } from "./routes/health/health-route";
import { lobbyRoutes } from "./routes/lobby/lobby-routes";
import { matchRoutes } from "./routes/match/match-routes";
import { teamsRoutes } from "./routes/teams/teams-routes";

const app = new Elysia()
  .use(cors())
  .use(healthRoute)
  .use(matchRoutes)
  .use(lobbyRoutes)
  .use(teamsRoutes);

const cleanup = async () => {
  redis.close();
  redisSub.close();
  await app.stop();
};

export type App = typeof app;
export { app, cleanup };
