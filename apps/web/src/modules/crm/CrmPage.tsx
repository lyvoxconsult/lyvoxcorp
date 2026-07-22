import type { InfiniteData } from "@tanstack/react-query";
import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Plus, Settings2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Can } from "../../auth/Can";
import { useSession } from "../../auth/session-context";
import { EmptyState } from "../../components/feedback/EmptyState";
import { PageError, PageLoading } from "../../components/feedback/PageState";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { ApiProblem } from "../../lib/api-client";
import { ClientForm } from "../clients/ClientForm";
import { changeLeadStage, createFollowup, createLead, customizeStages, importLeads, listPipeline, convertLead } from "./crm-api";
import { FollowupDialog } from "./FollowupDialog";
import { ImportLeadsDialog } from "./ImportLeadsDialog";
import { KanbanBoard } from "./KanbanBoard";
import { LeadForm } from "./LeadForm";
import { LostReasonDialog } from "./LostReasonDialog";
import { StageCustomizationDialog } from "./StageCustomizationDialog";
import type { ChangeStageDraft, Lead, LeadStage, Pipeline, PipelineFilters } from "./crm-types";

function currency(value: string): string { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value)); }

export function CrmPage() {
  const session = useSession(); const navigate = useNavigate(); const queryClient = useQueryClient();
  const createRef = useRef<HTMLButtonElement>(null); const importRef = useRef<HTMLButtonElement>(null); const settingsRef = useRef<HTMLButtonElement>(null); const convertRef = useRef<HTMLElement | null>(null); const followupRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState(""); const [stageFilter, setStageFilter] = useState(""); const [createOpen, setCreateOpen] = useState(false); const [importOpen, setImportOpen] = useState(false); const [settingsOpen, setSettingsOpen] = useState(false);
  const [lost, setLost] = useState<{ lead: Lead; stage: LeadStage } | null>(null); const [followup, setFollowup] = useState<Lead | null>(null); const [convert, setConvert] = useState<Lead | null>(null); const [actionError, setActionError] = useState("");
  const filters: PipelineFilters = { search: search.trim() || undefined, stageId: stageFilter || undefined, pageSize: 100 };
  const query = useInfiniteQuery({ queryKey: ["crm-pipeline", filters], queryFn: ({ pageParam, signal }) => listPipeline({ ...filters, cursor: pageParam }, signal), initialPageParam: undefined as string | undefined, getNextPageParam: (page) => page.meta.hasMore ? page.meta.nextCursor ?? undefined : undefined, placeholderData: keepPreviousData });
  const first = query.data?.pages[0]; const stages = first?.stages ?? []; const leads = query.data?.pages.flatMap((page) => page.data) ?? [];

  const stageMutation = useMutation({ mutationFn: ({ lead, stage, lossReasonCode, lossNotes }: { lead: Lead; stage: LeadStage; lossReasonCode?: string; lossNotes?: string }) => changeLeadStage(lead.id, { stageId: stage.id, version: lead.version, lossReasonCode, lossNotes } as ChangeStageDraft),
    onMutate: async ({ lead, stage }) => { setActionError(""); await queryClient.cancelQueries({ queryKey: ["crm-pipeline"] }); const snapshots = queryClient.getQueriesData<InfiniteData<Pipeline>>({ queryKey: ["crm-pipeline"] }); queryClient.setQueriesData<InfiniteData<Pipeline>>({ queryKey: ["crm-pipeline"] }, (current) => current ? { ...current, pages: current.pages.map((page) => ({ ...page, data: page.data.flatMap((item) => item.id !== lead.id ? [item] : filters.stageId && filters.stageId !== stage.id ? [] : [{ ...item, stageId: stage.id }]) })) } : current); return { snapshots }; },
    onError: (error, _variables, context) => { context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)); setActionError(error instanceof ApiProblem && error.status === 409 ? "O lead foi atualizado por outra pessoa. O pipeline foi recarregado." : "Não foi possível mover o lead. A posição anterior foi restaurada."); },
    onSettled: async () => { await queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] }); },
  });
  function requestMove(lead: Lead, stage: LeadStage) { if (stage.outcome === "LOST") setLost({ lead, stage }); else stageMutation.mutate({ lead, stage }); }
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ["crm-pipeline"] }); };
  const createMutation = useMutation({ mutationFn: createLead, onSuccess: async () => { await refresh(); setCreateOpen(false); } });
  const followupMutation = useMutation({ mutationFn: ({ lead, input }: { lead: Lead; input: Parameters<typeof createFollowup>[1] }) => createFollowup(lead.id, input), onSuccess: refresh });
  const convertMutation = useMutation({ mutationFn: ({ lead, client }: { lead: Lead; client: Parameters<typeof convertLead>[1]["client"] }) => convertLead(lead.id, { version: lead.version, client }), onSuccess: async (result) => { await refresh(); setConvert(null); navigate(`/app/clientes/${result.clientId}`); } });
  const importMutation = useMutation({ mutationFn: importLeads, onSuccess: refresh });
  const stagesMutation = useMutation({ mutationFn: customizeStages, onSuccess: refresh });

  if (query.isPending) return <PageLoading label="Carregando pipeline" />;
  if (query.isError) return <PageError forbidden={query.error instanceof ApiProblem && query.error.status === 403} onRetry={() => { void query.refetch(); }} />;
  if (!first) return null;
  return <section aria-labelledby="crm-title" className="grid gap-6">
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="font-mono text-caption uppercase tracking-[0.2em] text-brand-100">Comercial</p><h1 id="crm-title">CRM e pipeline</h1><p className="mt-2 text-brand-50">Acompanhe oportunidades, próximos contatos e conversões.</p></div><div className="flex flex-wrap gap-2"><Can permission="crm.create"><Button ref={importRef} variant="secondary" onClick={() => setImportOpen(true)}><Download aria-hidden="true" className="h-4 w-4" />Importar CSV</Button><Button ref={createRef} onClick={() => setCreateOpen(true)}><Plus aria-hidden="true" className="h-4 w-4" />Novo lead</Button></Can><Can permission="crm.update"><Button ref={settingsRef} variant="ghost" onClick={() => setSettingsOpen(true)}><Settings2 aria-hidden="true" className="h-4 w-4" />Etapas</Button></Can></div></header>
    <section aria-label="Métricas do pipeline" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><div className="rounded-xl border border-border-subtle bg-surface-raised p-4"><p className="text-sm text-brand-100">Leads no pipeline</p><p className="mt-2 font-mono text-2xl">{first.metrics.total}</p></div><div className="rounded-xl border border-border-subtle bg-surface-raised p-4"><p className="text-sm text-brand-100">Valor estimado</p><p className="mt-2 font-mono text-2xl">{currency(first.metrics.estimatedValue)}</p></div><div className="rounded-xl border border-border-subtle bg-surface-raised p-4 sm:col-span-2 xl:col-span-1"><p className="text-sm text-brand-100">Etapas ativas</p><p className="mt-2 font-mono text-2xl">{stages.filter((stage) => stage.active).length}</p></div></section>
    <div className="grid gap-3 rounded-xl border border-border-subtle bg-surface-raised p-4 md:grid-cols-[minmax(14rem,1fr)_16rem]"><Input label="Buscar leads" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, empresa, e-mail ou telefone" /><div className="grid gap-2"><label htmlFor="crm-stage-filter" className="font-semibold">Filtrar etapa</label><select id="crm-stage-filter" className="min-h-11 rounded-lg border border-border bg-surface-base px-3" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}><option value="">Todas</option>{stages.filter((stage) => stage.active).map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></div></div>
    {actionError && <p role="alert" className="rounded-lg border border-status-error bg-red-950/30 p-3 text-red-200">{actionError}</p>}
    {leads.length === 0 && !search && !stageFilter ? <EmptyState title="Pipeline vazio" description="Cadastre ou importe o primeiro lead para iniciar o funil." action={session.can("crm.create") ? <Button onClick={() => setCreateOpen(true)}>Cadastrar lead</Button> : undefined} /> : leads.length === 0 ? <EmptyState title="Nenhum lead encontrado" description="Ajuste a busca ou o filtro de etapa." /> : <KanbanBoard stages={stages} leads={leads} canUpdate={session.can("crm.update") && !stageMutation.isPending} canConvert={session.can("crm.update") && session.can("clients.create")} onMove={requestMove} onFollowup={(lead, trigger) => { followupRef.current = trigger; setFollowup(lead); }} onConvert={(lead, trigger) => { convertRef.current = trigger; setConvert(lead); }} />}
    {query.hasNextPage && <Button variant="secondary" loading={query.isFetchingNextPage} onClick={() => { void query.fetchNextPage(); }}>Carregar mais leads</Button>}
    <Dialog open={createOpen} title="Novo lead" description="Cadastre uma oportunidade no pipeline global." onClose={() => setCreateOpen(false)} triggerRef={createRef}><LeadForm stages={stages} onCancel={() => setCreateOpen(false)} onSubmit={(input) => createMutation.mutateAsync(input).then(() => undefined)} /></Dialog>
    <ImportLeadsDialog open={importOpen} triggerRef={importRef} onClose={() => setImportOpen(false)} onSubmit={(rows) => importMutation.mutateAsync({ rows })} />
    <StageCustomizationDialog open={settingsOpen} stages={stages} triggerRef={settingsRef} onClose={() => setSettingsOpen(false)} onSubmit={(items) => stagesMutation.mutateAsync({ stages: items }).then(() => undefined)} />
    <LostReasonDialog lead={lost?.lead ?? null} stage={lost?.stage ?? null} reasons={first.lossReasons} onClose={() => setLost(null)} onConfirm={(lossReasonCode, lossNotes) => lost ? stageMutation.mutateAsync({ ...lost, lossReasonCode, lossNotes }).then(() => undefined) : Promise.resolve()} />
    <FollowupDialog lead={followup} triggerRef={followupRef} onClose={() => setFollowup(null)} onSubmit={(lead, input) => followupMutation.mutateAsync({ lead, input }).then(() => undefined)} />
    <Dialog open={Boolean(convert)} title="Converter lead em cliente" description="Preencha os dados completos. A conversão preservará o histórico comercial." onClose={() => setConvert(null)} triggerRef={convertRef}>{convert && <ClientForm onCancel={() => setConvert(null)} onSubmit={(client) => convertMutation.mutateAsync({ lead: convert, client }).then(() => undefined)} />}</Dialog>
  </section>;
}
