import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useUiStore } from "../../store/ui-store";
import { Header } from "./Header";
import { PageContainer } from "./PageContainer";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  function closeMobileMenu(restoreFocus = false) {
    setMobileOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!mobileOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu(true);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-surface-base text-white">
      <div inert={mobileOpen || undefined} aria-hidden={mobileOpen || undefined}>
        <a href="#main-content" className="fixed left-4 top-2 z-50 -translate-y-16 rounded-md bg-brand-accessible px-4 py-2 text-white transition-transform focus:translate-y-0">Ir para o conteúdo</a>
        <div className="fixed inset-y-0 left-0 hidden md:block"><Sidebar collapsed={collapsed} onToggleCollapse={toggleSidebar} /></div>
        <div className={`min-h-screen transition-[padding] ${collapsed ? "md:pl-20" : "md:pl-72"}`}>
          <Header menuOpen={mobileOpen} onOpenMenu={() => setMobileOpen(true)} triggerRef={triggerRef} />
          <PageContainer><Outlet /></PageContainer>
        </div>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden="true"
            data-testid="drawer-overlay"
            onClick={() => closeMobileMenu(true)}
          />
          <div
            ref={dialogRef}
            id="mobile-sidebar"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="relative h-full w-72"
          >
            <Sidebar mobile closeButtonRef={closeButtonRef} onClose={() => closeMobileMenu(true)} />
          </div>
        </div>
      )}
    </div>
  );
}
