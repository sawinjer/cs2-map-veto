import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateGameForm } from "../components/create-game-form";
import { server } from "../utils/server";

export const Route = createFileRoute("/create-game")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleGameCreated = async (game: {
    observerId: string;
    team1Key: string;
    team2Key: string;
  }) => {
    const lobbyCreationResponse = await server
      .lobby({
        gameId: game.observerId,
      })
      .post();

    const lobby = lobbyCreationResponse.data;

    if (!lobby) {
      return;
    }

    navigate({
      to: "/game-links",
      search: {
        lobby,
        team1Key: game.team1Key,
        team2Key: game.team2Key,
        gameId: game.observerId,
      },
    });
  };

  return <CreateGameForm onSuccess={handleGameCreated} />;
}
