import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loadSession } from "../lib/api-client";
import { SessionProvider, useSession } from "./session-context";

vi.mock("../lib/api-client", () => ({ loadSession: vi.fn(), hasPermission: (grants: Array<{ permission: string }>, permission: string) => grants.some((grant) => grant.permission === permission) }));

function Consumer() { const session = useSession(); return <p>{session.loading ? "loading" : `${session.user?.fullName}:${session.can("clients.read")}`}</p>; }

describe("SessionProvider", () => {
  it("exposes the live user and grants", async () => {
    vi.mocked(loadSession).mockResolvedValue({ user: { id: "u", email: "u@example.com", fullName: "User", passwordChangeRequired: false, mfaVerified: true }, grants: [{ permission: "clients.read", scope: "ALL" }] });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><SessionProvider><Consumer /></SessionProvider></QueryClientProvider>);
    expect(await screen.findByText("User:true")).toBeVisible();
  });
});
