import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { meetings, meetingNotes, meetingParticipants, meetingTranscripts, clients, leads } from "@lyvox/database/schema";
import type { CreateMeetingInput, CreateMeetingNotesInput, UploadMeetingTranscriptInput } from "@lyvox/validation";
import { DatabaseService } from "../auth/auth.infrastructure.js";

@Injectable()
export class MeetingsRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db
      .select({
        id: meetings.id,
        title: meetings.title,
        agenda: meetings.agenda,
        clientId: meetings.clientId,
        clientName: clients.name,
        leadId: meetings.leadId,
        leadName: leads.name,
        scheduledAt: meetings.scheduledAt,
        meetingUrl: meetings.meetingUrl,
        createdAt: meetings.createdAt,
      })
      .from(meetings)
      .leftJoin(clients, eq(meetings.clientId, clients.id))
      .leftJoin(leads, eq(meetings.leadId, leads.id))
      .where(isNull(meetings.deletedAt))
      .orderBy(desc(meetings.scheduledAt));
  }

  async findById(id: string) {
    const rows = await this.database.db
      .select({
        id: meetings.id,
        title: meetings.title,
        agenda: meetings.agenda,
        clientId: meetings.clientId,
        clientName: clients.name,
        leadId: meetings.leadId,
        leadName: leads.name,
        scheduledAt: meetings.scheduledAt,
        meetingUrl: meetings.meetingUrl,
        createdAt: meetings.createdAt,
      })
      .from(meetings)
      .leftJoin(clients, eq(meetings.clientId, clients.id))
      .leftJoin(leads, eq(meetings.leadId, leads.id))
      .where(and(eq(meetings.id, id), isNull(meetings.deletedAt)))
      .limit(1);

    return rows[0] || null;
  }

  async create(input: CreateMeetingInput, actorUserId?: string) {
    const [meeting] = await this.database.db
      .insert(meetings)
      .values({
        title: input.title,
        agenda: input.agenda ?? null,
        clientId: input.clientId ?? null,
        leadId: input.leadId ?? null,
        scheduledAt: new Date(input.scheduledAt),
        meetingUrl: input.meetingUrl ?? null,
        createdById: actorUserId ?? null,
      })
      .returning();

    if (input.participantUserIds && input.participantUserIds.length > 0) {
      await this.database.db.insert(meetingParticipants).values(
        input.participantUserIds.map((userId) => ({
          meetingId: meeting.id,
          userId,
          type: "INTERNAL",
          createdById: actorUserId ?? null,
        })),
      );
    }

    return meeting;
  }

  async addNotes(meetingId: string, input: CreateMeetingNotesInput, actorUserId?: string) {
    const [note] = await this.database.db
      .insert(meetingNotes)
      .values({
        meetingId,
        notes: input.notes,
        summary: input.summary ?? null,
        actionItems: input.actionItems ?? [],
        createdById: actorUserId ?? null,
      })
      .returning();

    return note;
  }

  async addTranscript(meetingId: string, input: UploadMeetingTranscriptInput, actorUserId?: string) {
    const [transcript] = await this.database.db
      .insert(meetingTranscripts)
      .values({
        meetingId,
        rawTranscript: input.rawTranscript,
        summary: null,
        actionItems: [],
        source: input.source ?? "MANUAL_UPLOAD",
        createdById: actorUserId ?? null,
      })
      .returning();

    return transcript;
  }
}
