import { createFileRoute } from "@tanstack/react-router";
import { MultiWindowRouter } from "@/components/lumen/multi-window-view";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <MultiWindowRouter />;
}
