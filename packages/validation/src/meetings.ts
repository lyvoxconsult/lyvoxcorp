import { z } from "zod";

export const meetingParticipantTypeSchema = z.enum(["CLIENT", "LEAD", "INTERNAL"]);

const baseMeetingSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(255),
  agenda: z.string().max(4000).optional().nullable(),
  clientId: z.string().uuid("ID do cliente inválido").optional().nullable(),
  leadId: z.string().uuid("ID do lead inválido").optional().nullable(),
  scheduledAt: z.string().datetime({ message: "Data/hora de agendamento inválida (ISO 8601 UTC)" }),
  meetingUrl: z.string().url("URL de reunião inválida").optional().nullable(),
  participantUserIds: z.array(z.string().uuid("ID de participante inválido")).optional().default([]),
});

export const createMeetingSchema = baseMeetingSchema.refine(
  (data) => Boolean(data.clientId || data.leadId),
  {
    message: "A reunião deve estar vinculada a pelo menos um cliente ou um lead",
    path: ["clientId"],
  },
);

export const updateMeetingSchema = baseMeetingSchema.partial();

export const createMeetingNotesSchema = z.object({
  notes: z.string().min(5, "A anotação deve ter no mínimo 5 caracteres").max(10000),
  summary: z.string().max(2000).optional().nullable(),
  actionItems: z.array(z.string().max(500)).optional().default([]),
});

export const createTaskFromMeetingSchema = z.object({
  title: z.string().min(3, "Título do item de ação deve ter no mínimo 3 caracteres").max(255),
  description: z.string().max(4000).optional().nullable(),
  assigneeId: z.string().uuid("ID do responsável inválido").optional().nullable(),
  dueOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data limite no formato YYYY-MM-DD").optional().nullable(),
});

export const uploadMeetingTranscriptSchema = z.object({
  rawTranscript: z.string().min(10, "A transcrição deve ter no mínimo 10 caracteres").max(50000),
  source: z.string().max(100).optional().default("MANUAL_UPLOAD"),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type CreateMeetingNotesInput = z.infer<typeof createMeetingNotesSchema>;
export type CreateTaskFromMeetingInput = z.infer<typeof createTaskFromMeetingSchema>;
export type UploadMeetingTranscriptInput = z.infer<typeof uploadMeetingTranscriptSchema>;
