import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:scale-[0.98]",
  secondary: "bg-surface-2 text-text hover:bg-border active:scale-[0.98]",
  ghost: "text-text-muted hover:bg-surface-2 hover:text-text",
  danger: "bg-danger/10 text-danger hover:bg-danger/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
