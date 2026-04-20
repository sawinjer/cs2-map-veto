import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/button";

function Index() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center flex-col gap-5">
      <h1 className="font-serif text-5xl">
        Hello to{" "}
        <a href="https://code.store" className="underline">
          code.store's
        </a>{" "}
        cs2 map vote tool
      </h1>
      <Link to="/create-game">
        <Button>Create a lobby</Button>
      </Link>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
});
