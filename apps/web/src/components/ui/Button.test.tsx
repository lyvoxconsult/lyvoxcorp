import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("supports interaction and visual variants", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<Button variant="secondary" onClick={onClick}>Continuar</Button>);
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveClass("border-brand-100");
    rerender(<Button variant="danger">Excluir</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-red-700", "text-white", "hover:bg-red-800");
  });

  it("is unavailable and exposes busy state while loading", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button loading onClick={onClick}>Salvando</Button>);
    const button = screen.getByRole("button", { name: "Salvando" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
