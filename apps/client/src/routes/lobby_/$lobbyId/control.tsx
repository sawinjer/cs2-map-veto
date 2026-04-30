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
  "flex h-10 flex-1 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950";

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-sm shadow-sm transition-colors hover:bg-gray-50"
      title="Copy link"
    >
      {copied ? (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      )}
    </button>
  );
}

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
              <div className="flex gap-2">
                <Link to="/lobby/$lobbyId" params={{ lobbyId }} className={linkClass}>
                  Lobby watch
                </Link>
                <CopyButton url={`/lobby/${lobbyId}`} />
              </div>

              <div className="flex gap-2">
                <Link to="/lobby/$lobbyId/control" params={{ lobbyId }} className={linkClass}>
                  Lobby control
                </Link>
                <CopyButton url={`/lobby/${lobbyId}/control`} />
              </div>

              <div className="flex gap-2">
                <Link
                  to="/vote/$gameId"
                  params={{ gameId: gameLinks.gameId }}
                  search={{ key: gameLinks.team1Key }}
                  className={linkClass}
                >
                  {team1Name} Vote
                </Link>
                <CopyButton url={`/vote/${gameLinks.gameId}?key=${gameLinks.team1Key}`} />
              </div>

              <div className="flex gap-2">
                <Link
                  to="/vote/$gameId"
                  params={{ gameId: gameLinks.gameId }}
                  search={{ key: gameLinks.team2Key }}
                  className={linkClass}
                >
                  {team2Name} Vote
                </Link>
                <CopyButton url={`/vote/${gameLinks.gameId}?key=${gameLinks.team2Key}`} />
              </div>
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
