"use client";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60",
        variant === "primary" && "bg-abico-blue text-white hover:bg-abico-dark",
        variant === "secondary" &&
          "border border-white/20 bg-white/10 text-white hover:bg-white/15",
        variant === "ghost" && "text-blue-100 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
