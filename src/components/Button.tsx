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
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-premium disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" && "bg-abico-blue text-white shadow-glow hover:-translate-y-0.5 hover:bg-abico-dark hover:shadow-lg active:translate-y-0",
        variant === "secondary" && "border border-gray-300 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-soft active:translate-y-0",
        variant === "ghost" && "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
