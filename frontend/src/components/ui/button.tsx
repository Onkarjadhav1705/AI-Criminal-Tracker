import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "icon";
};

const variants: Record<Variant, string> = {
  primary: "bg-accent text-[#061018] hover:bg-[#75c4e0]",
  secondary: "bg-panel2 text-text border border-border hover:border-accent/50",
  ghost: "bg-transparent text-muted hover:text-text hover:bg-white/5",
  danger: "bg-danger text-white hover:bg-danger/85"
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  icon: "h-9 w-9 p-0"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "secondary", size = "md", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
