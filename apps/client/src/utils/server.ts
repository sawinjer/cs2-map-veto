import { treaty } from "@elysiajs/eden";
import type { App } from "@repo/server-definitions/client";

const serverUrl = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

export const server = treaty<App>(serverUrl);
