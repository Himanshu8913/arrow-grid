import { Button } from "@/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";

export function App() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Card
        className="w-full max-w-lg text-center"
        padding="lg"
        variant="surface"
      >
        <CardHeader>
          <CardTitle>{import.meta.env.VITE_APP_NAME ?? "Arrow Grid"}</CardTitle>
          <CardDescription>Strategy puzzle game — coming soon</CardDescription>
        </CardHeader>

        <CardFooter>
          <Button>Play</Button>
          <Button variant="secondary">How to Play</Button>
          <Button variant="ghost">Settings</Button>
          <Button variant="danger" size="sm">
            Quit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
