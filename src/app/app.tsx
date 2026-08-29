import { Button } from "@/ui/button";

export function App() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <main className="w-full max-w-lg rounded-2xl bg-bg-surface p-8 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {import.meta.env.VITE_APP_NAME ?? "Arrow Grid"}
        </h1>
        <p className="mb-8 text-text-muted">
          Strategy puzzle game — coming soon
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button>Play</Button>
          <Button variant="secondary">How to Play</Button>
          <Button variant="ghost">Settings</Button>
          <Button variant="danger" size="sm">
            Quit
          </Button>
        </div>
      </main>
    </div>
  );
}
