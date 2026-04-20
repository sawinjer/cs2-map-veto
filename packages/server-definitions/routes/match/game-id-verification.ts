import { createHash } from "node:crypto";
import { env } from "../../env";

function hash(input: string) {
  const hash = createHash("sha256").update(input, "utf8").digest();
  return buferToUrlSafeBase64(hash);
}

function buferToUrlSafeBase64(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const getKeysUtils = (prefix: string) => {
  const getKeyPlainText = (gameId: string) =>
    `${env.SECRET}${prefix}${gameId}${env.SECRET}`;

  return {
    makeTeamKey: (gameId: string) => hash(getKeyPlainText(gameId)),
    verifyTeamKey: (gameId: string, receivedKey: string) =>
      receivedKey === hash(getKeyPlainText(gameId)),
  };
};

export const team1KeyUtils = getKeysUtils("t1");
export const team2KeyUtils = getKeysUtils("t2");
