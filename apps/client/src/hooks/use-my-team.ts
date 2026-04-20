import { useQuery } from "@tanstack/react-query";
import { server } from "../utils/server";

export const useMyTeam = (gameId: string, key: string) => {
  return useQuery({
    queryKey: ["game", gameId, "me", key],
    queryFn: async () => {
      const response = await server.match
        .me({ gameId })({ teamKey: key })
        .get();
      return response.data || "none";
    },
  });
};
