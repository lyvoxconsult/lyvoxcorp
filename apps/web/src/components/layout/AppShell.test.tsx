import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

function renderShell() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes><Route element={<AppShell />}><Route index element={<h1>Conteúdo</h1>} /></Route></Routes>
    </MemoryRouter>,
  );
}

describe("AppShell", () => {
  it("provides semantic navigation and skip link", () => {
    renderShell();
    expect(screen.getByRole("link", { name: "Ir para o conteúdo" })).toHaveAttribute("href", "#main-content");
    expect(screen.getAllByRole("navigation", { name: "Seções" })).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("toggles the desktop sidebar without persistent storage", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "Recolher menu lateral" }));
    expect(screen.getByRole("button", { name: "Expandir menu lateral" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Clientes" })).toBeVisible();
  });

  it("opens mobile navigation and closes it with Escape, restoring focus", async () => {
    const user = userEvent.setup();
    renderShell();
    const open = screen.getByRole("button", { name: "Abrir menu" });
    await user.click(open);
    expect(open).toHaveAttribute("aria-expanded", "true");
    const dialog = screen.getByRole("dialog", { name: "Menu de navegação" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("main", { hidden: true }).closest("[inert]")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Fechar menu" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(document.getElementById("mobile-sidebar")).not.toBeInTheDocument();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(open).toHaveFocus();
  });

  it("traps forward and reverse tab navigation inside the mobile drawer", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "Abrir menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu de navegação" });
    const close = within(dialog).getByRole("button", { name: "Fechar menu" });
    const navigationLink = within(dialog).getByRole("link", { name: "Clientes" });

    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(navigationLink).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });

  it("closes mobile navigation from overlay", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "Abrir menu" }));
    await user.click(screen.getByTestId("drawer-overlay"));
    expect(document.getElementById("mobile-sidebar")).not.toBeInTheDocument();
  });
});
