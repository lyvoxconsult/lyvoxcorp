import { useId, type ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  const titleId = `empty-state-${useId().replaceAll(":", "")}`;
  return (
    <section className="rounded-xl border border-dashed border-border-subtle p-8 text-center" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-h2 text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-brand-50">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}
