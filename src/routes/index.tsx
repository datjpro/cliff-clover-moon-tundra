import { createFileRoute } from "@tanstack/react-router";
import { DesktopScene } from "@/components/lumen/desktop-scene";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <DesktopScene />;
}
