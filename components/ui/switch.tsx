"use client";
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles with isolation to prevent container interference
        "peer relative isolate inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        // Focus styles
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Unchecked state: neutral background
        "data-[state=unchecked]:bg-input/80 dark:data-[state=unchecked]:bg-input/80",
        // Checked state: primary background
        "data-[state=checked]:bg-primary",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base thumb styles with isolation
          "relative isolate pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          // Position states
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          // Unchecked state: primary colored circle
          "data-[state=unchecked]:bg-primary",
          // Checked state: contrasting background (white/dark)
          "data-[state=checked]:bg-background dark:data-[state=checked]:bg-primary-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
