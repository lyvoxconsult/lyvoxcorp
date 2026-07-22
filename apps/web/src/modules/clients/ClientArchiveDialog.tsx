import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import { ApiProblem } from "../../lib/api-client";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { archiveClient } from "./client-api";
import type { Client } from "./client-types";

export function ClientArchiveDialog({ client, open, onClose, triggerRef, onArchived }: { client: Client | null; open: boolean; onClose: () => void; triggerRef?: RefObject<HTMLElement | null>; onArchived?: () => void }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => archiveClient(client!.id, client!.version),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.removeQueries({ queryKey: ["client", client!.id] });
      onClose();
      onArchived?.();
    },
  });
  const error = mutation.error instanceof ApiProblem ? mutation.error.message : mutation.error ? "Não foi possível arquivar o cliente." : null;
  return <Dialog open={open && Boolean(client)} title="Arquivar cliente" description="O registro será desativado e preservado no histórico." onClose={onClose} triggerRef={triggerRef} size="sm">
    <p>Confirma o arquivamento de <strong>{client?.name}</strong>?</p>
    {error && <p role="alert" className="mt-4 rounded-lg border border-status-error bg-red-950/40 p-3 text-red-200">{error}</p>}
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="button" variant="danger" loading={mutation.isPending} onClick={() => mutation.mutate()}>Arquivar cliente</Button></div>
  </Dialog>;
}
