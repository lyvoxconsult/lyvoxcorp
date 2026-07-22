import { useState } from "react";
import { Button } from "../../components/ui/Button.js";
import { Dialog } from "../../components/ui/Dialog.js";
import { useSession } from "../../auth/session-context.js";
import { createMeeting } from "./meetings-api.js";

interface MeetingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MeetingFormDialog({ open, onOpenChange, onSuccess }: MeetingFormDialogProps) {
  const { csrfToken } = useSession();
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [clientId, setClientId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!title || title.trim().length < 3) {
        throw new Error("O título deve ter no mínimo 3 caracteres");
      }
      if (!clientId) {
        throw new Error("Selecione um cliente ou forneça um ID de cliente válido");
      }
      if (!scheduledAt) {
        throw new Error("Selecione a data e hora do agendamento");
      }

      const isoScheduledAt = new Date(scheduledAt).toISOString();

      await createMeeting(
        {
          title,
          agenda: agenda || undefined,
          clientId,
          scheduledAt: isoScheduledAt,
          meetingUrl: meetingUrl || undefined,
        },
        csrfToken || "",
      );

      onSuccess();
      onOpenChange(false);
      setTitle("");
      setAgenda("");
      setClientId("");
      setScheduledAt("");
      setMeetingUrl("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao agendar reunião");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Agendar Reunião">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="meeting-title" className="block text-sm font-medium text-gray-300">
            Título da Reunião *
          </label>
          <input
            id="meeting-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 mt-1 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Ex: Reunião de Alinhamento de Projeto"
            required
          />
        </div>

        <div>
          <label htmlFor="meeting-client-id" className="block text-sm font-medium text-gray-300">
            ID do Cliente *
          </label>
          <input
            id="meeting-client-id"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 mt-1 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="UUID do cliente"
            required
          />
        </div>

        <div>
          <label htmlFor="meeting-date" className="block text-sm font-medium text-gray-300">
            Data e Hora *
          </label>
          <input
            id="meeting-date"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 mt-1 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <p className="mt-1 text-xs text-amber-400/80">
            * BR-040: Notificação interna gerada automaticamente 15 minutos antes do horário.
          </p>
        </div>

        <div>
          <label htmlFor="meeting-url" className="block text-sm font-medium text-gray-300">
            Link da Reunião (Google Meet, Teams, etc.)
          </label>
          <input
            id="meeting-url"
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            className="w-full px-3 py-2 mt-1 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="https://meet.google.com/xyz-abc"
          />
        </div>

        <div>
          <label htmlFor="meeting-agenda" className="block text-sm font-medium text-gray-300">
            Pauta / Agenda
          </label>
          <textarea
            id="meeting-agenda"
            rows={3}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            className="w-full px-3 py-2 mt-1 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Pauta ou pontos a serem discutidos..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Agendando..." : "Agendar Reunião"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
