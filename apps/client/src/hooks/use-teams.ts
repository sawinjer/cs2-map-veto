import { useQuery } from "@tanstack/react-query";
import { server } from "../utils/server";

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await server.teams.get();
      return response.data;
    },
  });
};
