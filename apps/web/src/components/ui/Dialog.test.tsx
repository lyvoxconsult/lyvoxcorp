import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("traps focus and closes with Escape restoring the trigger", async () => {
    const user = userEvent.setup(); const close = vi.fn(); const triggerRef = createRef<HTMLButtonElement>();
    render(<><button ref={triggerRef}>Abrir</button><Dialog open title="Editar cliente" onClose={close} triggerRef={triggerRef}><button>Salvar</button></Dialog></>);
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
    await user.keyboard("{Escape}"); expect(close).toHaveBeenCalledOnce();
  });
  it("closes from the named overlay", async () => {
    const user = userEvent.setup(); const close = vi.fn();
    render(<Dialog open title="Confirmar" description="Descrição" onClose={close}><button>Continuar</button></Dialog>);
    await user.click(screen.getByRole("button", { name: "Fechar janela" })); expect(close).toHaveBeenCalledOnce();
  });
});
