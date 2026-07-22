import { Layers3, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { RefObject } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/Button";

type SidebarProps = {
  collapsed?: boolean;
  mobile?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
};

export function Sidebar({ collapsed = false, mobile = false, onClose, onToggleCollapse, closeButtonRef }: SidebarProps) {
  return (
    <aside aria-label="Navegação principal" className={`flex h-full flex-col border-r border-border-subtle bg-surface-raised ${collapsed && !mobile ? "w-20" : "w-72"}`}>
      <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
        <span className="font-display text-display tracking-wider text-white" aria-label="Lyvox">
          {collapsed && !mobile ? "L" : "Lyvox"}
        </span>
        {mobile && <Button ref={closeButtonRef} variant="ghost" onClick={onClose} aria-label="Fechar menu"><X aria-hidden="true" className="h-5 w-5" /></Button>}
      </div>
      <nav className="flex-1 p-3" aria-label="Seções">
        <NavLink
          to="/"
          end
          aria-label="Fundação"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 font-semibold ${isActive ? "bg-brand-accessible text-white" : "text-brand-subtle hover:bg-surface-muted"}`}
        >
          <Layers3 aria-hidden="true" className="h-5 w-5 shrink-0" />
          {(!collapsed || mobile) && <span>Fundação</span>}
        </NavLink>
      </nav>
      {!mobile && (
        <div className="border-t border-border-subtle p-3">
          <Button variant="ghost" className="w-full" onClick={onToggleCollapse} aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}>
            {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <><PanelLeftClose aria-hidden="true" /><span>Recolher</span></>}
          </Button>
        </div>
      )}
    </aside>
  );
}
