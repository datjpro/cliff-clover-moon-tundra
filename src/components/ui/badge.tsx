import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[11px] font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}
