import { GameType } from "@repo/server-definitions/client";
import { useState } from "react";
import { useTeams } from "../hooks/use-teams";
import { server } from "../utils/server";
import { Button } from "./button";

type GameCreatedData = {
  observerId: string;
  team1Key: string;
  team2Key: string;
};

type Props = {
  onSuccess: (game: GameCreatedData) => void;
};

export function CreateGameForm({ onSuccess }: Props) {
  const [matchType, setMatchType] = useState<GameType>(GameType.BestOf1);
  const [team1Id, setTeam1Id] = useState<string>("");
  const [team2Id, setTeam2Id] = useState<string>("");
  const [error, setError] = useState<string>("");
  const teams = useTeams();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const hasTeam1 = team1Id !== "";
    const hasTeam2 = team2Id !== "";

    if ((hasTeam1 && !hasTeam2) || (hasTeam2 && !hasTeam1)) {
      setError("Either both teams should be selected or neither of them");
      return;
    }

    const team1Value = team1Id === "" ? undefined : team1Id;
    const team2Value = team2Id === "" ? undefined : team2Id;

    const gameCreateResult = await server.match.post(
      {},
      {
        query: {
          type: matchType,
          team1Id: team1Value,
          team2Id: team2Value,
        },
      },
    );
    const game = gameCreateResult.data;

    if (!game) {
      setError("Failed to create the game");
      return;
    }

    onSuccess(game);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Create Game
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Match Format
            </span>
            <div className="flex rounded-md bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setMatchType(GameType.BestOf1)}
                className={`flex-1 cursor-pointer rounded-sm py-1.5 text-sm font-medium transition-all ${
                  matchType === GameType.BestOf1
                    ? "bg-white shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Best of 1
              </button>
              <button
                type="button"
                onClick={() => setMatchType(GameType.BestOf3)}
                className={`flex-1 cursor-pointer rounded-sm py-1.5 text-sm font-medium transition-all ${
                  matchType === GameType.BestOf3
                    ? "bg-white shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Best of 3
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="team1"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Team 1
            </label>
            <select
              id="team1"
              value={team1Id}
              required={team2Id !== ""}
              onChange={(e) => setTeam1Id(e.target.value)}
              className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None</option>
              {teams.data?.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="team2"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Team 2
            </label>
            <select
              id="team2"
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              required={team1Id !== ""}
              className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">None</option>
              {teams.data?.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            Create Game
          </Button>
        </form>
      </div>
    </div>
  );
}
