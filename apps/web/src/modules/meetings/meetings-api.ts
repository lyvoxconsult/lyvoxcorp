import type { CreateMeetingInput, CreateMeetingNotesInput } from "@lyvox/validation";

export interface MeetingItem {
  id: string;
  title: string;
  agenda?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  leadId?: string | null;
  leadName?: string | null;
  scheduledAt: string;
  meetingUrl?: string | null;
  createdAt: string;
}

export async function fetchMeetings(): Promise<MeetingItem[]> {
  const response = await fetch("/api/v1/reunioes", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar reuniões");
  }

  return response.json();
}

export async function createMeeting(input: CreateMeetingInput, csrfToken: string): Promise<MeetingItem> {
  const response = await fetch("/api/v1/reunioes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erro ao agendar reunião");
  }

  return response.json();
}

export async function addMeetingNotes(meetingId: string, input: CreateMeetingNotesInput, csrfToken: string) {
  const response = await fetch(`/api/v1/reunioes/${meetingId}/notas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Erro ao salvar ata de reunião");
  }

  return response.json();
}
