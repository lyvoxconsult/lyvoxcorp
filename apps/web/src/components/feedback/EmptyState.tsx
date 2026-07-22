import { useId, type ReactNode } from "react";

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  const titleId = `empty-state-${useId().replaceAll(":", "")}`;
  return (
    <section className="rounded-xl border border-dashed border-border-subtle p-8 text-center" aria-labelledby={titleId}>
      {icon && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-brand-100">{icon}</div>}
      <h2 id={titleId} className="text-h2 text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-brand-50">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}
