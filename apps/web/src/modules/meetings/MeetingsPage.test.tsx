import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MeetingsPage } from "./MeetingsPage.js";

vi.mock("./meetings-api.js", () => ({
  fetchMeetings: vi.fn().mockResolvedValue([
    {
      id: "meeting-1",
      title: "Reunião de Escopo",
      agenda: "Discutir prazos e entregáveis",
      clientId: "client-1",
      clientName: "Empresa ABC",
      scheduledAt: "2026-08-10T10:00:00.000Z",
      meetingUrl: "https://meet.google.com/xyz-123",
      createdAt: "2026-07-22T10:00:00.000Z",
    },
  ]),
}));

vi.mock("../../auth/session-context.js", () => ({
  useSession: () => ({
    csrfToken: "mock-csrf-token",
    hasPermission: () => true,
  }),
}));

describe("MeetingsPage", () => {
  it("renders page header and fetched meetings", async () => {
    render(<MeetingsPage />);
    expect(screen.getByText("Reuniões & Atas")).toBeDefined();
    const meetingTitle = await screen.findByText("Reunião de Escopo");
    expect(meetingTitle).toBeDefined();
    expect(screen.getByText("Empresa ABC")).toBeDefined();
  });
});
