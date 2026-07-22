import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";
import { useSession } from "./session-context";
import { AuthorizedLanding } from "./AuthorizedLanding";

vi.mock("./session-context", () => ({ useSession: vi.fn() }));

it("lands a CRM-only user on CRM instead of clients", () => {
  vi.mocked(useSession).mockReturnValue({ user: null, grants: [], loading: false, error: null, retry: vi.fn(), can: (permission) => permission === "crm.read" });
  render(<MemoryRouter initialEntries={["/app"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Routes><Route path="/app" element={<AuthorizedLanding />} /><Route path="/app/crm" element={<h1>CRM permitido</h1>} /></Routes></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "CRM permitido" })).toBeVisible();
});
