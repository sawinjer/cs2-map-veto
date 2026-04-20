import { env } from "../env";

export interface OpenHudTeam {
  _id: string;
  name: string;
  logo?: string;
  logoUrl?: string;
}

export interface OpenHudMatch {
  _id: string;
  team1: string;
  team2: string;
  score: [number, number];
  status: "waiting" | "in_progress" | "finished";
  last_updated: number;
}

const getOpenHudBaseUrl = (): string | null => {
  if (!env.OPENHUD_URL) {
    return null;
  }
  return env.OPENHUD_URL.replace(/\/$/, "");
};

const isOpenHudConfigured = (): boolean => {
  return !!getOpenHudBaseUrl();
};

export const fetchTeams = async (): Promise<OpenHudTeam[]> => {
  const baseUrl = getOpenHudBaseUrl();
  if (!baseUrl) {
    return [];
  }

  try {
    const res = await fetch(`${baseUrl}/api/teams`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn("[OpenHud] Failed to fetch teams:", res.status);
      return [];
    }

    const data = (await res.json()) as OpenHudTeam[];
    return data.map((team) => ({
      ...team,
      logoUrl: `${baseUrl}/api/teams/logo/${team._id}`,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.warn("[OpenHud] Failed to fetch teams:", msg);
    return [];
  }
};

export interface OpenHudVeto {
  mapName: string;
  type: "pick" | "ban" | "decider";
  teamId: string;
  side: "CT" | "T" | "NO";
  mapEnd: boolean;
  winner?: string | null;
}

const gameTypeToOpenHudMatchType: Record<string, string> = {
  BestOf1: "bo1",
  BestOf3: "bo3",
};

export const createMatch = async (
  team1Id: string,
  team2Id: string,
  matchType: string,
  vetos: OpenHudVeto[],
): Promise<string | null> => {
  const baseUrl = getOpenHudBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const matchData = {
    left: { id: team1Id, wins: 0 },
    right: { id: team2Id, wins: 0 },
    current: false,
    matchType: gameTypeToOpenHudMatchType[matchType] ?? matchType,
    vetos,
  };

  try {
    const res = await fetch(`${baseUrl}/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(matchData),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn("[OpenHud] Failed to create match:", res.status);
      return null;
    }

    const data = (await res.json()) as string;
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.warn("[OpenHud] Failed to create match:", msg);
    return null;
  }
};

export const openHud = {
  isConfigured: isOpenHudConfigured,
  fetchTeams,
  createMatch,
};
