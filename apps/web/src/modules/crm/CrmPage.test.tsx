import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSession } from "../../auth/session-context";
import { ApiProblem } from "../../lib/api-client";
import { changeLeadStage, listPipeline } from "./crm-api";
import { CrmPage } from "./CrmPage";
import type { Lead, LeadStage, Pipeline } from "./crm-types";

vi.mock("../../auth/session-context", () => ({ useSession: vi.fn() }));
vi.mock("./crm-api", () => ({ listPipeline: vi.fn(), changeLeadStage: vi.fn(), createFollowup: vi.fn(), createLead: vi.fn(), customizeStages: vi.fn(), importLeads: vi.fn(), convertLead: vi.fn(), listCrmResponsibles: vi.fn() }));
vi.mock("./KanbanBoard", () => ({ KanbanBoard: ({ leads, stages, onMove }: { leads: Lead[]; stages: LeadStage[]; onMove: (lead: Lead, stage: LeadStage) => void }) => <div><span data-testid="lead-stage">{leads[0]?.stageId}</span><button onClick={() => onMove(leads[0]!, stages[1]!)}>Mover no teste</button></div> }));

const stages: LeadStage[] = [
  { id: "11111111-1111-4111-8111-111111111111", code: "NEW", name: "Novo", position: 1, color: "#123456", outcome: "OPEN", active: true, version: 1 },
  { id: "22222222-2222-4222-8222-222222222222", code: "QUALIFIED", name: "Qualificado", position: 2, color: "#345678", outcome: "OPEN", active: true, version: 1 },
];
const lead: Lead = { id: "33333333-3333-4333-8333-333333333333", name: "Acme", email: null, phone: null, company: "Acme", estimatedValue: "1000.00", source: null, stageId: stages[0]!.id, responsible: null, version: 1, convertedClientId: null, createdAt: "2026-07-22T12:00:00Z", updatedAt: "2026-07-22T12:00:00Z", nextFollowup: null };
const pipeline: Pipeline = { data: [lead], meta: { pageSize: 100, hasMore: false, nextCursor: null }, stages, lossReasons: [{ code: "NO_BUDGET", label: "Sem orçamento" }], metrics: { total: 1, estimatedValue: "1000.00", byStage: [{ stageId: stages[0]!.id, count: 1, estimatedValue: "1000.00" }] } };

describe("CrmPage", () => {
  beforeEach(() => { vi.mocked(useSession).mockReturnValue({ user: null, grants: [], loading: false, error: null, retry: vi.fn(), can: () => true }); vi.mocked(listPipeline).mockResolvedValue(pipeline); });
  it("rolls an optimistic stage move back after a conflict", async () => {
    vi.mocked(changeLeadStage).mockRejectedValue(new ApiProblem(409, { detail: "Conflict" }));
    const user = userEvent.setup(); const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(<QueryClientProvider client={client}><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><CrmPage /></MemoryRouter></QueryClientProvider>);
    await user.click(await screen.findByRole("button", { name: "Mover no teste" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("atualizado por outra pessoa");
    expect(screen.getByTestId("lead-stage")).toHaveTextContent(stages[0]!.id);
  });
});
