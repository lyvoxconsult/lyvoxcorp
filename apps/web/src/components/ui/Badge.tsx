import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";
const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-brand-subtle",
  success: "bg-green-950 text-green-200",
  warning: "bg-amber-950 text-amber-200",
  danger: "bg-red-950 text-red-200",
  info: "bg-sky-950 text-sky-200",
};
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
