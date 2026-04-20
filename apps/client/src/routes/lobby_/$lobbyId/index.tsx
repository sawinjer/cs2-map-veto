import { Cs2Map, Cs2Site, PickStage } from "@repo/server-definitions/client";
import { createFileRoute } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import { BanBatch } from "../../../components/ban-batch";
import { PickBatch } from "../../../components/pick-batch";
import { useTeams } from "../../../hooks/use-teams";
import { useWatchLobby } from "../../../hooks/use-watch-lobby";
import { cs2MapToImage, cs2MapToLogo } from "../../../utils/map-to-image";

export const Route = createFileRoute("/lobby_/$lobbyId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { lobbyId } = Route.useParams();
  const lobby = useWatchLobby(lobbyId);
  const teams = useTeams();

  if (!lobby) {
    return;
  }

  const currentStage = lobby?.stages?.[lobby?.currentStage || 0];
  const maps = Object.values(Cs2Map);
  const isBanned = (map: Cs2Map) =>
    lobby?.banRecords.map((record) => record.map)?.includes(map);

  const team1 = teams.data?.find((team) => team._id === lobby.team1Id);
  const team2 = teams.data?.find((team) => team._id === lobby.team2Id);
  const whoBanned = (map: Cs2Map) => {
    const team = lobby.banRecords.find((record) => record.map === map)?.team;
    return team === "team1" ? team1 : team === "team2" ? team2 : undefined;
  };
  const whoPicked = (map: Cs2Map) => {
    const stageIndex = lobby.pickedMaps?.indexOf(map);
    if (stageIndex === -1 || stageIndex === undefined) {
      return undefined;
    }

    const stages = lobby.stages.filter((stage) =>
      [PickStage.Team1PickMap, PickStage.Team2PickMap].includes(stage),
    );
    const stage = stages[stageIndex];

    if (stage === PickStage.Team1PickMap) {
      return team1;
    }

    if (stage === PickStage.Team2PickMap) {
      return team2;
    }
  };
  const isPicked = (map: Cs2Map) => lobby?.pickedMaps?.includes(map);
  const isFinished = !currentStage;
  const siteIcon = (site: Cs2Site) =>
    site === Cs2Site.TSite ? "/t.png" : "/ct.png";

  const teamLabel = (
    fallback: string,
    team?: { name: string; logoUrl?: string },
  ) => {
    if (!team) {
      return fallback;
    }

    const logo = team.logoUrl;
    if (!logo) {
      return team.name;
    }

    return (
      <img
        alt="logo"
        src={logo}
        className="w-[75px] object-cover aspect-square rounded-full"
      />
    );
  };

  if (isFinished) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col gap-8">
          {lobby.team1PickedSite ? (
            <div className="flex gap-2 items-center justify-center">
              {teamLabel("Team 1", team1)}
              <span className="font-bold">plays as</span>
              <img
                src={siteIcon(lobby.team1PickedSite as Cs2Site)}
                className="w-[75px] object-cover aspect-square"
                alt="side"
              />
            </div>
          ) : null}
          {lobby.team2PickedSite ? (
            <div className="flex gap-2 items-center justify-center">
              {teamLabel("Team 2", team2)}
              <span className="font-bold">plays as</span>
              <img
                src={siteIcon(lobby.team2PickedSite as Cs2Site)}
                className="w-[75px] object-cover aspect-square"
                alt="side"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4 justify-center">
            {lobby.pickedMaps.map((map) => (
              <div
                className="w-[400px] aspect-video rounded-md relative overflow-hidden"
                key={map}
              >
                <img
                  src={`/${cs2MapToLogo[map]}`}
                  alt="logo"
                  className="absolute top-1/2 left-1/2 -translate-1/2 w-1/3 aspect-square z-50"
                />
                <img
                  className="object-cover rounded-md blur-xs"
                  src={`/${cs2MapToImage[map]}`}
                  alt="map"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 h-screen p-2">
      {maps.map((map) => (
        <div
          className={twMerge(
            "flex-1 h-full overflow-hidden relative",
            isBanned(map) ? "border-red-400 border-5 rounded-md" : "",
            isPicked(map) ? "border-blue-400 border-5 rounded-md" : "",
          )}
          key={map}
        >
          {isBanned(map) && <BanBatch whoBanned={whoBanned(map)} />}
          {isPicked(map) && <PickBatch whoPicked={whoPicked(map)} />}
          <img
            className="h-screen absolute max-w-[unset] -translate-x-1/2 -z-10"
            alt="map"
            src={`/${cs2MapToImage[map]}`}
          />

          <img
            className="absolute w-[200px] aspect-square top-1/2 left-1/2 -translate-1/2"
            alt="map"
            src={`/${cs2MapToLogo[map]}`}
          />
        </div>
      ))}
    </div>
  );
}
