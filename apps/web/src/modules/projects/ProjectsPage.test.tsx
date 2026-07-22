import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProjectsPage } from "./ProjectsPage.js";

vi.mock("./projects-api.js", () => ({
  fetchProjects: vi.fn().mockResolvedValue([
    {
      id: "proj-1",
      name: "Implantação de ERP Cloud",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
      clientName: "Empresa Alfa LTDA",
      status: "IN_PROGRESS",
      dueOn: "2026-12-31",
      createdAt: "2026-07-22T10:00:00Z",
    },
  ]),
}));

describe("ProjectsPage", () => {
  it("renders projects list correctly", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProjectsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Projetos & Operações")).toBeInTheDocument();
      expect(screen.getByText("Implantação de ERP Cloud")).toBeInTheDocument();
      expect(screen.getByText("Empresa Alfa LTDA")).toBeInTheDocument();
    });
  });
});
