import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md bg-elevated px-3 py-2 text-sm text-fg",
        "shadow-[var(--shadow-border)] placeholder:text-subtle",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        "disabled:opacity-40 resize-none",
        className,
      )}
      {...props}
    />
  );
}
