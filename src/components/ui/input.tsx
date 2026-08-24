import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md bg-elevated px-3 text-sm text-fg",
        "shadow-[var(--shadow-border)] placeholder:text-subtle",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        "disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
