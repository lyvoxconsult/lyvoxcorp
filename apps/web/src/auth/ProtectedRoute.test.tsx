import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useSession } from "./session-context";

vi.mock("./session-context", () => ({ useSession: vi.fn() }));
const mockedSession = vi.mocked(useSession);

function renderRoute() {
  return render(<MemoryRouter initialEntries={["/app/clientes"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes><Route path="/login" element={<h1>Login</h1>} /><Route path="/403-forbidden" element={<h1>Proibido</h1>} /><Route element={<ProtectedRoute permission="clients.read" />}><Route path="/app/clientes" element={<h1>Clientes</h1>} /></Route></Routes></MemoryRouter>);
}

describe("ProtectedRoute", () => {
  beforeEach(() => mockedSession.mockReturnValue({ user: null, grants: [], loading: false, error: null, can: () => false, retry: vi.fn() }));
  it("redirects an expired session to the explicit login state", () => { renderRoute(); expect(screen.getByRole("heading", { name: "Login" })).toBeVisible(); });
  it("redirects an authenticated user without permission to forbidden", () => {
    mockedSession.mockReturnValue({ user: { id: "u", email: "u@example.com", fullName: "U", passwordChangeRequired: false, mfaVerified: true }, grants: [], loading: false, error: null, can: () => false, retry: vi.fn() });
    renderRoute(); expect(screen.getByRole("heading", { name: "Proibido" })).toBeVisible();
  });
});
