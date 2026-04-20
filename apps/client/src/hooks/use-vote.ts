import type { Cs2Map, Cs2Site } from "@repo/server-definitions/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { server } from "../utils/server";

export const useVote = (gameId: string, teamKey: string) => {
  const queryClient = useQueryClient();

  const voteForMap = useMutation({
    mutationKey: ["vote", "map"],
    mutationFn: async (map: Cs2Map) => {
      const response = await server.match
        .vote({ gameId })({ teamKey })
        .patch({}, { query: { map } });

      if (response.error) {
        console.error(response.error);
        throw response.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["game", gameId],
      });
    },
  });

  const voteForSite = useMutation({
    mutationKey: ["vote", "site"],
    mutationFn: async (site: Cs2Site) => {
      const response = await server.match
        .vote({ gameId })({ teamKey })
        .patch({}, { query: { site } });

      if (response.error) {
        console.error(response.error);
        throw response.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["game", gameId],
      });
    },
  });

  return { voteForMap, voteForSite };
};
