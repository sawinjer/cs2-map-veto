import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { useGame } from "../hooks/use-game";
import { useTeams } from "../hooks/use-teams";

export const Route = createFileRoute("/game-links")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        lobby: z.string().nonempty(),
        gameId: z.string().nonempty(),
        team1Key: z.string().nonempty(),
        team2Key: z.string().nonempty(),
      })
      .parse(search),
});

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
  const { lobby, gameId, team1Key, team2Key } = Route.useSearch();
  const game = useGame(gameId);
  const teams = useTeams();

  const team1Id = game.data?.team1Id;
  const team2Id = game.data?.team2Id;

  const team1Name = team1Id
    ? teams.data?.find((team) => team._id === team1Id)?.name || "Team 1"
    : "Team 1";

  const team2Name = team2Id
    ? teams.data?.find((team) => team._id === team2Id)?.name || "Team 2"
    : "Team 2";

  const linkClass =
    "flex h-10 flex-1 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md flex flex-col gap-8">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          Game Links
        </h1>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Link
              to="/lobby/$lobbyId"
              params={{ lobbyId: lobby }}
              className={linkClass}
            >
              Lobby watch
            </Link>
            <CopyButton url={`/lobby/${lobby}`} />
          </div>

          <div className="flex gap-2">
            <Link
              to="/lobby/$lobbyId/control"
              params={{ lobbyId: lobby }}
              className={linkClass}
            >
              Lobby controll
            </Link>
            <CopyButton url={`/lobby/${lobby}/control`} />
          </div>

          <div className="flex gap-2">
            <Link
              to="/vote/$gameId"
              params={{ gameId }}
              search={{ key: team1Key }}
              className={linkClass}
            >
              {team1Name} Vote
            </Link>
            <CopyButton url={`/vote/${gameId}?key=${team1Key}`} />
          </div>

          <div className="flex gap-2">
            <Link
              to="/vote/$gameId"
              params={{ gameId }}
              search={{ key: team2Key }}
              className={linkClass}
            >
              {team2Name} Vote
            </Link>
            <CopyButton url={`/vote/${gameId}?key=${team2Key}`} />
          </div>
        </div>

        <Link to="/" className="underline text-center">
          Go to home
        </Link>
      </div>
    </div>
  );
}
