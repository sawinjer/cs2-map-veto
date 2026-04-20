import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CreateGameForm } from "../../../components/create-game-form";
import { useTeams } from "../../../hooks/use-teams";
import { server } from "../../../utils/server";

export const Route = createFileRoute("/lobby_/$lobbyId/control")({
  component: RouteComponent,
});

type GameLinks = {
  gameId: string;
  team1Key: string;
  team2Key: string;
};

const linkClass =
  "flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950";

function RouteComponent() {
  const { lobbyId } = Route.useParams();
  const [gameLinks, setGameLinks] = useState<GameLinks | null>(null);
  const teams = useTeams();

  const team1Name =
    teams.data?.find((t) => t._id === gameLinks?.gameId)?.name ?? "Team 1";
  const team2Name =
    teams.data?.find((t) => t._id === gameLinks?.gameId)?.name ?? "Team 2";

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <CreateGameForm
          onSuccess={async ({ observerId, team1Key, team2Key }) => {
            await server.lobby.udpate({ lobbyId }).patch({}, { query: { gameId: observerId } });
            setGameLinks({ gameId: observerId, team1Key, team2Key });
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 border-l border-gray-200">
        <div className="w-full max-w-md flex flex-col gap-8">
          <h1 className="text-center text-2xl font-semibold tracking-tight">
            Game Links
          </h1>

          {gameLinks ? (
            <div className="flex flex-col gap-2">
              <Link to="/lobby/$lobbyId" params={{ lobbyId }} className={linkClass}>
                Lobby watch
              </Link>

              <Link to="/lobby/$lobbyId/control" params={{ lobbyId }} className={linkClass}>
                Lobby control
              </Link>

              <Link
                to="/vote/$gameId"
                params={{ gameId: gameLinks.gameId }}
                search={{ key: gameLinks.team1Key }}
                className={linkClass}
              >
                {team1Name} Vote
              </Link>

              <Link
                to="/vote/$gameId"
                params={{ gameId: gameLinks.gameId }}
                search={{ key: gameLinks.team2Key }}
                className={linkClass}
              >
                {team2Name} Vote
              </Link>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400">
              Create a game to see links
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
