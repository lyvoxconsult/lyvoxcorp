import { useEffect, useState } from "react";
import { Plus, Calendar, Video, Clock } from "lucide-react";
import { Button } from "../../components/ui/Button.js";
import { fetchMeetings, type MeetingItem } from "./meetings-api.js";
import { MeetingFormDialog } from "./MeetingFormDialog.js";
import { useSession } from "../../auth/session-context.js";

export function MeetingsPage() {
  const { hasPermission } = useSession();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const canCreate = hasPermission("meetings.create");

  const loadMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar reuniões");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reuniões & Atas</h1>
          <p className="text-sm text-gray-400">
            Agendamento de reuniões, atas estruturadas e notificações automáticas
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Reunião
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Carregando reuniões...</div>
      ) : meetings.length === 0 ? (
        <div className="p-12 text-center bg-gray-900/50 border border-gray-800 rounded-xl space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-amber-500/60" />
          <h3 className="text-lg font-medium text-white">Nenhuma reunião agendada</h3>
          <p className="text-sm text-gray-400">
            Clique em "Nova Reunião" para agendar uma reunião com cliente ou lead.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-5 bg-gray-900 border border-gray-800 rounded-xl space-y-3 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-lg">{meeting.title}</h3>
                <span className="px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Agendada
                </span>
              </div>

              {meeting.clientName && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Cliente:</span> {meeting.clientName}
                </p>
              )}

              {meeting.leadName && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-500">Lead:</span> {meeting.leadName}
                </p>
              )}

              <div className="flex items-center text-xs text-gray-400 gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {new Date(meeting.scheduledAt).toLocaleString("pt-BR")}
              </div>

              {meeting.agenda && (
                <p className="text-sm text-gray-400 line-clamp-2 pt-1 border-t border-gray-800">
                  {meeting.agenda}
                </p>
              )}

              {meeting.meetingUrl && (
                <div className="pt-2">
                  <a
                    href={meeting.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-amber-400 hover:underline gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Entrar na Reunião
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <MeetingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadMeetings}
      />
    </div>
  );
}
