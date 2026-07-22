import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { KanbanBoard } from "./KanbanBoard";
import type { Lead, LeadStage } from "./crm-types";

const stages: LeadStage[] = [
  { id: "11111111-1111-4111-8111-111111111111", code: "NEW", name: "Novo", position: 1, color: "#123456", outcome: "OPEN", active: true, version: 1 },
  { id: "22222222-2222-4222-8222-222222222222", code: "WON", name: "Ganho", position: 2, color: "#228844", outcome: "WON", active: true, version: 1 },
];
const lead: Lead = { id: "33333333-3333-4333-8333-333333333333", name: "Acme", email: null, phone: null, company: "Acme", estimatedValue: "1000.00", source: null, stageId: stages[0]!.id, responsible: null, version: 1, convertedClientId: null, createdAt: "2026-07-22T12:00:00Z", updatedAt: "2026-07-22T12:00:00Z", nextFollowup: null };

it("offers a dedicated keyboard drag handle and an explicit cross-stage move", async () => {
  const move = vi.fn(); const user = userEvent.setup();
  render(<KanbanBoard stages={stages} leads={[lead]} canUpdate canConvert onMove={move} onFollowup={vi.fn()} onConvert={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Mover Acme" })).toBeVisible();
  await user.selectOptions(screen.getByLabelText("Mover para etapa"), stages[1]!.id);
  expect(move).toHaveBeenCalledWith(lead, stages[1]);
});

it("requires both permissions and an unconverted WON lead to show conversion", () => {
  const wonLead = { ...lead, stageId: stages[1]!.id };
  const { rerender } = render(<KanbanBoard stages={stages} leads={[wonLead]} canUpdate canConvert={false} onMove={vi.fn()} onFollowup={vi.fn()} onConvert={vi.fn()} />);
  expect(screen.queryByRole("button", { name: "Converter em cliente" })).not.toBeInTheDocument();
  rerender(<KanbanBoard stages={stages} leads={[wonLead]} canUpdate canConvert onMove={vi.fn()} onFollowup={vi.fn()} onConvert={vi.fn()} />);
  expect(screen.getByRole("button", { name: "Converter em cliente" })).toBeVisible();
  rerender(<KanbanBoard stages={stages} leads={[{ ...wonLead, convertedClientId: "44444444-4444-4444-8444-444444444444" }]} canUpdate canConvert onMove={vi.fn()} onFollowup={vi.fn()} onConvert={vi.fn()} />);
  expect(screen.queryByRole("button", { name: "Converter em cliente" })).not.toBeInTheDocument();
});

it("supports the keyboard DnD command without intercepting card controls", async () => {
  const move = vi.fn(); const user = userEvent.setup();
  render(<KanbanBoard stages={stages} leads={[lead]} canUpdate canConvert onMove={move} onFollowup={vi.fn()} onConvert={vi.fn()} />);
  const handle = screen.getByRole("button", { name: "Mover Acme" });
  handle.focus();
  await user.keyboard(" ");
  await user.keyboard("{ArrowRight}");
  await user.keyboard(" ");
  expect(screen.getByLabelText("Mover para etapa")).toBeEnabled();
});
