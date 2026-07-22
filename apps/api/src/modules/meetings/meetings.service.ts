import { Injectable, NotFoundException } from "@nestjs/common";
import { MeetingsRepository } from "./meetings.repository.js";
import type { CreateMeetingInput, CreateMeetingNotesInput, UploadMeetingTranscriptInput } from "@lyvox/validation";

@Injectable()
export class MeetingsService {
  constructor(private readonly meetingsRepository: MeetingsRepository) {}

  async listMeetings() {
    return this.meetingsRepository.findAll();
  }

  async getMeetingById(id: string) {
    const meeting = await this.meetingsRepository.findById(id);
    if (!meeting) {
      throw new NotFoundException(`Reunião com ID ${id} não encontrada`);
    }
    return meeting;
  }

  async createMeeting(input: CreateMeetingInput, actorUserId?: string) {
    const meeting = await this.meetingsRepository.create(input, actorUserId);

    // BR-040: Calcula horário da notificação interna de 15 minutos antes da reunião
    const notificationTime = new Date(new Date(input.scheduledAt).getTime() - 15 * 60 * 1000);

    return {
      ...meeting,
      br040_notification: {
        scheduledNotificationAt: notificationTime.toISOString(),
        status: "PARTIAL_CROSS_PHASE_DEPENDENCY",
        note: "Notificação registrada de 15 minutos (BR-040); entrega assíncrona BullMQ concluída na PHASE-020",
      },
    };
  }

  async addMeetingNotes(id: string, input: CreateMeetingNotesInput, actorUserId?: string) {
    await this.getMeetingById(id);
    return this.meetingsRepository.addNotes(id, input, actorUserId);
  }

  async addTranscript(id: string, input: UploadMeetingTranscriptInput, actorUserId?: string) {
    await this.getMeetingById(id);
    const transcript = await this.meetingsRepository.addTranscript(id, input, actorUserId);
    return {
      ...transcript,
      fr042_status: "PARTIAL_CROSS_PHASE_DEPENDENCY",
      note: "Transcrição armazenada com sucesso; análise via Ollama será concluída na PHASE-022",
    };
  }
}
