import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "secondary" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-muted text-muted-foreground",
  outline: "border border-border text-foreground",
};

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
