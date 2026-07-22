import { describe, expect, it, vi } from "vitest";
import { MeetingsController } from "./meetings.controller.js";
import type { MeetingsService } from "./meetings.service.js";
import type { AuthService } from "../auth/auth.service.js";

describe("MeetingsController", () => {
  it("calls listMeetings on GET /reunioes", async () => {
    const mockMeetingsService = {
      listMeetings: vi.fn().mockResolvedValue([
        {
          id: "meeting-1",
          title: "Reunião de Alinhamento",
          scheduledAt: new Date("2026-08-15T14:00:00.000Z"),
        },
      ]),
    } as unknown as MeetingsService;

    const mockAuthService = {
      verifyCsrf: vi.fn().mockResolvedValue(true),
    } as unknown as AuthService;

    const controller = new MeetingsController(mockMeetingsService, mockAuthService);
    const result = await controller.list();

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Reunião de Alinhamento");
    expect(mockMeetingsService.listMeetings).toHaveBeenCalled();
  });
});
