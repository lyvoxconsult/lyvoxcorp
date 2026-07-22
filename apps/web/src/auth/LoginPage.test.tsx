import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ApiProblem } from "../lib/api-client";
import { activateMfa, login, setupMfa } from "./auth-api";
import { LoginPage } from "./LoginPage";
import { useSession } from "./session-context";

vi.mock("./auth-api", () => ({ login: vi.fn(), completeMfa: vi.fn(), setupMfa: vi.fn(), activateMfa: vi.fn() }));
vi.mock("./session-context", () => ({ useSession: vi.fn() }));

describe("LoginPage", () => {
  it("shows a safe localized error for invalid credentials", async () => {
    vi.mocked(useSession).mockReturnValue({ user: null, grants: [], loading: false, error: null, can: () => false, retry: vi.fn() });
    vi.mocked(login).mockRejectedValue(new ApiProblem(401, { detail: "Unauthorized" }));
    const user = userEvent.setup();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><LoginPage /></MemoryRouter></QueryClientProvider>);
    await user.type(screen.getByRole("textbox", { name: "E-mail" }), "user@example.com");
    await user.type(screen.getByLabelText("Senha"), "invalid-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail, senha ou código inválido.");
  });

  it("continues a real login challenge into the MFA proof state", async () => {
    vi.mocked(useSession).mockReturnValue({ user: null, grants: [], loading: false, error: null, can: () => false, retry: vi.fn() });
    vi.mocked(login).mockResolvedValue({ status: "MFA_REQUIRED", challengeToken: "x".repeat(48), expiresAt: "2026-07-22T12:00:00Z" });
    const user = userEvent.setup();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><LoginPage /></MemoryRouter></QueryClientProvider>);
    await user.type(screen.getByRole("textbox", { name: "E-mail" }), "user@example.com");
    await user.type(screen.getByLabelText("Senha"), "StrongPassword1!");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("heading", { name: "Confirmar segundo fator" })).toBeVisible();
    expect(screen.getByLabelText("Código de 6 dígitos")).toBeVisible();
  });
  it("completes mandatory enrollment and reveals backup codes once", async () => {
    vi.mocked(useSession).mockReturnValue({ user: null, grants: [], loading: false, error: null, can: () => false, retry: vi.fn() });
    vi.mocked(login).mockResolvedValue({ status: "MFA_ENROLLMENT_REQUIRED", challengeToken: "x".repeat(48), expiresAt: "2026-07-22T12:00:00Z" });
    vi.mocked(setupMfa).mockResolvedValue({ secret: "SECRET", otpauthUri: "otpauth://totp/Lyvox" });
    vi.mocked(activateMfa).mockResolvedValue({ userId: "u", csrfToken: "csrf", expiresAt: "later", backupCodes: ["backup-code-1"] });
    const user = userEvent.setup(); const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><LoginPage /></MemoryRouter></QueryClientProvider>);
    await user.type(screen.getByRole("textbox", { name: "E-mail" }), "admin@example.com"); await user.type(screen.getByLabelText("Senha"), "StrongPassword1!"); await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("SECRET")).toBeVisible();
    await user.type(screen.getByLabelText("Código de 6 dígitos"), "123456"); await user.click(screen.getByRole("button", { name: "Ativar MFA" }));
    expect(await screen.findByText("backup-code-1")).toBeVisible();
    expect(screen.queryByText("SECRET")).not.toBeInTheDocument();
  });
});
