import type { PickStage } from "@repo/server-definitions/client";
import { Cs2Map, Cs2Site } from "@repo/server-definitions/client";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { useMyTeam } from "../../../hooks/use-my-team";
import { useVote } from "../../../hooks/use-vote";
import { useWatchGame } from "../../../hooks/use-watch-game";
import { cs2MapToImage } from "../../../utils/map-to-image";

const allMaps = Object.keys(Cs2Map) as Cs2Map[];

export const Route = createFileRoute("/vote_/$gameId/")({
  component: RouteComponent,
  validateSearch: (search) =>
    z.object({ key: z.string().nonempty() }).parse(search),
});

function formatStage(
  stage: PickStage,
  myTeam: "team1" | "team2" | "none",
): string {
  const isMyTeam = (team: "team1" | "team2") => myTeam === team;
  const isOpponent = (team: "team1" | "team2") =>
    myTeam !== team && myTeam !== "none";

  switch (stage) {
    case "Team1PickMap":
      return isMyTeam("team1")
        ? "You pick a map"
        : isOpponent("team1")
          ? "Opponent picks a map"
          : "Team 1 picks a map";
    case "Team2PickMap":
      return isMyTeam("team2")
        ? "You pick a map"
        : isOpponent("team2")
          ? "Opponent picks a map"
          : "Team 2 picks a map";
    case "Team1Ban":
      return isMyTeam("team1")
        ? "You ban a map"
        : isOpponent("team1")
          ? "Opponent bans a map"
          : "Team 1 bans a map";
    case "Team2Ban":
      return isMyTeam("team2")
        ? "You ban a map"
        : isOpponent("team2")
          ? "Opponent bans a map"
          : "Team 2 bans a map";
    case "Team1PickSide":
      return isMyTeam("team1")
        ? "You pick side"
        : isOpponent("team1")
          ? "Opponent picks side"
          : "Team 1 picks side";
    case "Team2PickSide":
      return isMyTeam("team2")
        ? "You pick side"
        : isOpponent("team2")
          ? "Opponent picks side"
          : "Team 2 picks side";
    default:
      return stage;
  }
}

function RouteComponent() {
  const params = Route.useParams();
  const searchParams = Route.useSearch();
  const game = useWatchGame(params.gameId);
  const myTeam = useMyTeam(params.gameId, searchParams.key);
  const { voteForMap, voteForSite } = useVote(params.gameId, searchParams.key);

  if (!game) {
    return <div>Loading...</div>;
  }

  const bannedMaps = game.banRecords?.map((r) => r.map) ?? [];
  const currentStage = game.stages[game.currentStage];
  const currentStageFormatted = formatStage(
    currentStage,
    myTeam.data || "none",
  );
  const isMyTurn =
    (myTeam.data === "team1" &&
      (currentStage === "Team1PickMap" ||
        currentStage === "Team1Ban" ||
        currentStage === "Team1PickSide")) ||
    (myTeam.data === "team2" &&
      (currentStage === "Team2PickMap" ||
        currentStage === "Team2Ban" ||
        currentStage === "Team2PickSide"));
  const isPickingSide =
    currentStage === "Team1PickSide" || currentStage === "Team2PickSide";
  const isFinished = game.currentStage >= game.stages.length;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {!isFinished && (
        <div className="flex gap-3 flex-wrap">
          {game.stages.map((stage, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                backgroundColor:
                  index === game.currentStage ? "#f59e0b" : "#e5e7eb",
                color: index === game.currentStage ? "white" : "#374151",
                fontWeight: index === game.currentStage ? "bold" : "normal",
              }}
            >
              {index + 1}. {formatStage(stage, myTeam.data || "none")}
            </div>
          ))}
        </div>
      )}
      {!isFinished && (
        <h2 className="text-4xl text-center font-bold py-10">
          {isMyTurn ? currentStageFormatted : "Waiting for opponent..."}
        </h2>
      )}

      {isFinished ? (
        <div className="h-screen flex items-center justify-center">
          {(() => {
            const mySide =
              myTeam.data === "team1"
                ? game.team1PickedSite
                : game.team2PickedSite;
            const mapsText = game.pickedMaps.join(", ");

            return (
              <h2 className="text-4xl rounded-md bg-gray-200 p-5">
                You are starting on{" "}
                <strong>{mySide === Cs2Site.TSite ? "T" : "CT"}</strong>, you
                will play {mapsText}
              </h2>
            );
          })()}
        </div>
      ) : isPickingSide ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => voteForSite.mutate(Cs2Site.TSite)}
            style={{
              padding: "40px 60px",
              fontSize: "24px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            <img src="/t.png" alt="terroris side" />
          </button>
          <button
            type="button"
            onClick={() => voteForSite.mutate(Cs2Site.CTSite)}
            style={{
              padding: "40px 60px",
              fontSize: "24px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            <img src="/ct.png" alt="counter terroris side" />
          </button>
          </div>
          {game.pickedMaps.length > 0 && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "8px" }}>Maps to be played</p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                {game.pickedMaps.map((map) => (
                  <div key={map} style={{ position: "relative", display: "inline-block", borderRadius: "12px", overflow: "hidden", border: "2px solid #3b82f6" }}>
                    <img src={"/" + cs2MapToImage[map]} alt={map} style={{ display: "block", height: "180px", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 0, width: "100%", padding: "8px", backgroundColor: "white", textAlign: "center", fontWeight: "bold", color: "#3b82f6" }}>
                      {map}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {allMaps.map((map) => {
            const isBanned = bannedMaps.includes(map);
            const isPicked = game.pickedMaps?.includes(map);
            const isActionDisabled = isBanned || isPicked || !isMyTurn;
            const isHighlightedBanned = isBanned;
            const isHighlightedPicked = isPicked;

            return (
              <button
                type="button"
                key={map}
                onClick={() => {
                  if (isMyTurn && !isActionDisabled) {
                    voteForMap.mutate(map);
                  }
                }}
                disabled={isActionDisabled}
                style={{
                  position: "relative",
                  padding: "0",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  overflow: "hidden",
                  cursor: isActionDisabled ? "not-allowed" : "pointer",
                  opacity: isActionDisabled ? 0.6 : 1,
                  backgroundColor: isHighlightedBanned
                    ? "#fee2e2"
                    : isHighlightedPicked
                      ? "#dbeafe"
                      : "white",
                  borderColor: isHighlightedBanned
                    ? "#ef4444"
                    : isHighlightedPicked
                      ? "#3b82f6"
                      : "#e5e7eb",
                  height: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={"/" + cs2MapToImage[map]} alt="map" />
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "white",
                    textAlign: "center",
                    fontWeight: "bold",
                    color: isHighlightedBanned
                      ? "#ef4444"
                      : isHighlightedPicked
                        ? "#3b82f6"
                        : "#374151",
                  }}
                >
                  {map}
                  {isHighlightedBanned && " (Banned)"}
                  {isHighlightedPicked && " (Picked)"}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
