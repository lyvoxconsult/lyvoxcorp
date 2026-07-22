import { describe, expect, it, vi } from "vitest";
import { ServicesController } from "./services.controller.js";
import type { ServicesService } from "./services.service.js";
import type { AuthService } from "../auth/auth.service.js";

describe("ServicesController", () => {
  const mockServicesService = {
    listServices: vi.fn().mockResolvedValue([
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Desenvolvimento Software",
        category: "Desenvolvimento",
        unit: "HOUR",
        billingType: "ONE_TIME",
        basePrice: "200.00",
      },
    ]),
    getServiceById: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    updateServicePrice: vi.fn(),
    deleteService: vi.fn(),
  } as unknown as ServicesService;

  const mockAuthService = {
    verifyCsrf: vi.fn().mockResolvedValue(true),
  } as unknown as AuthService;

  const controller = new ServicesController(mockServicesService, mockAuthService);

  it("lists services", async () => {
    const result = await controller.list("Desenvolvimento");
    expect(result).toHaveLength(1);
    expect(mockServicesService.listServices).toHaveBeenCalledWith("Desenvolvimento");
  });
});
