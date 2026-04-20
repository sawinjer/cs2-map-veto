import { app, cleanup } from "@repo/server-definitions";

app.listen(3000);

process.on("exit", () => {
  cleanup();
});

console.log(`Server running at ${app.server?.hostname}:${app.server?.port}`);
