import * as SwitchPrimitive from "@radix-ui/react-switch";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full",
        "bg-elevated shadow-[var(--shadow-border)]",
        "data-[state=checked]:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "transition-[background-color] duration-150 ease-out",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 rounded-full bg-fg",
          "data-[state=checked]:bg-accent-fg",
          "translate-x-0.5 data-[state=checked]:translate-x-[18px]",
          "transition-transform duration-150 ease-out",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
