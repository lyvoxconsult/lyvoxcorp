import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServicesPage } from "./ServicesPage.js";

vi.mock("./services-api.js", () => ({
  fetchServices: vi.fn().mockResolvedValue([
    {
      id: "srv-1",
      name: "Consultoria em Nuvem",
      description: "Migração e infraestrutura",
      category: "Infraestrutura",
      unit: "HOUR",
      billingType: "ONE_TIME",
      isActive: true,
      basePrice: "250.00",
      createdAt: "2026-07-22T10:00:00Z",
    },
  ]),
  createService: vi.fn(),
  updateService: vi.fn(),
  updateServicePrice: vi.fn(),
  deleteService: vi.fn(),
}));

describe("ServicesPage", () => {
  it("renders services list correctly", async () => {
    render(<ServicesPage />);

    await waitFor(() => {
      expect(screen.getByText("Catálogo de Serviços e Valores")).toBeInTheDocument();
      expect(screen.getByText("Consultoria em Nuvem")).toBeInTheDocument();
      expect(screen.getByText("R$ 250.00")).toBeInTheDocument();
    });
  });
});
