import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { Button } from "./Button";

export function Dialog({ open, title, description, onClose, triggerRef, children, size = "lg" }: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  size?: "sm" | "lg";
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        requestAnimationFrame(() => triggerRef?.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
      if (!focusable.length) return event.preventDefault();
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKeyDown); };
  }, [open, triggerRef]);

  if (!open) return null;
  const closeAndRestore = () => { onClose(); requestAnimationFrame(() => triggerRef?.current?.focus()); };
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm" aria-label="Fechar janela" onClick={closeAndRestore} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative h-full w-full overflow-y-auto border-l border-border-subtle bg-surface-raised p-5 shadow-2xl sm:p-6 ${size === "sm" ? "max-w-md" : "max-w-2xl"}`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><h2 id={titleId} className="text-h2 text-white">{title}</h2>{description && <p id={descriptionId} className="mt-1 text-brand-50">{description}</p>}</div>
          <Button ref={closeRef} type="button" variant="ghost" aria-label="Fechar" onClick={closeAndRestore}><X aria-hidden="true" className="h-5 w-5" /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}
