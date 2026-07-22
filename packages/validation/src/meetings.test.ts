import { describe, expect, it } from "vitest";
import { createMeetingNotesSchema, createMeetingSchema, uploadMeetingTranscriptSchema } from "./meetings.js";

describe("meetings validation schemas", () => {
  it("validates valid meeting creation with clientId", () => {
    const result = createMeetingSchema.safeParse({
      title: "Reunião de Alinhamento",
      agenda: "Discutir contrato e entregáveis",
      clientId: "123e4567-e89b-12d3-a456-426614174000",
      scheduledAt: "2026-08-15T14:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("fails if neither clientId nor leadId is provided", () => {
    const result = createMeetingSchema.safeParse({
      title: "Reunião Sem Vínculo",
      scheduledAt: "2026-08-15T14:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("validates meeting notes schema", () => {
    const result = createMeetingNotesSchema.safeParse({
      notes: "Ata da reunião: Aprovado o cronograma da fase 1.",
      summary: "Cronograma aprovado.",
      actionItems: ["Enviar proposta revisada", "Agendar call técnica"],
    });
    expect(result.success).toBe(true);
  });

  it("validates upload transcript schema", () => {
    const result = uploadMeetingTranscriptSchema.safeParse({
      rawTranscript: "Transcrição da reunião gravada do cliente...",
      source: "MANUAL_UPLOAD",
    });
    expect(result.success).toBe(true);
  });
});
