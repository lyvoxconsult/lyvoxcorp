import { LoaderCircle } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "bg-brand-accessible text-white hover:bg-brand-accessible/90",
  secondary: "border border-brand-100 bg-transparent text-brand-subtle hover:bg-surface-muted",
  ghost: "bg-transparent text-brand-subtle hover:bg-surface-muted",
  danger: "bg-red-700 text-white hover:bg-red-800",
};

export function Button({ variant = "primary", loading = false, disabled, children, className = "", ...props }: ButtonProps) {
  const unavailable = disabled || loading;
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={unavailable}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
