import { Cs2Map } from "@repo/server-definitions/client";

export const cs2MapToImage: Record<Cs2Map, string> = {
  [Cs2Map.Ancient]: "de_ancient.png",
  [Cs2Map.Anubis]: "de_anubis.png",
  [Cs2Map.Dust2]: "de_dust2.png",
  [Cs2Map.Inferno]: "de_inferno.png",
  [Cs2Map.Mirage]: "de_mirage.png",
  [Cs2Map.Nuke]: "de_nuke.png",
  [Cs2Map.Overpass]: "de_overpass.png",
};

export const cs2MapToLogo: Record<Cs2Map, string> = {
  [Cs2Map.Ancient]: "logo_ancient.png",
  [Cs2Map.Anubis]: "logo_anubis.png",
  [Cs2Map.Dust2]: "logo_dust2.png",
  [Cs2Map.Inferno]: "logo_inferno.png",
  [Cs2Map.Mirage]: "logo_mirage.png",
  [Cs2Map.Nuke]: "logo_nuke.png",
  [Cs2Map.Overpass]: "logo_overpass.png",
};
