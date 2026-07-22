import { Menu } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "../ui/Button";

export function Header({ onOpenMenu, menuOpen, triggerRef }: { onOpenMenu: () => void; menuOpen: boolean; triggerRef: RefObject<HTMLButtonElement | null> }) {
  return (
    <header className="flex h-16 items-center border-b border-border-subtle bg-surface-raised px-4 md:px-6">
      <Button
        ref={triggerRef}
        variant="ghost"
        className="md:hidden"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
        aria-controls="mobile-sidebar"
      ><Menu aria-hidden="true" className="h-5 w-5" /></Button>
      <p className="ml-2 font-heading text-lg tracking-wide text-brand-subtle md:ml-0">Gerenciamento</p>
    </header>
  );
}
