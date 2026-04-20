import { useQuery } from "@tanstack/react-query";
import { server } from "../utils/server";

export const useGame = (gameId: string) => {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: async () => {
      const response = await server.match({ gameId }).get();
      return response.data;
    },
  });
};
