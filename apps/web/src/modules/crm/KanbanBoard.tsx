import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, GripVertical, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import type { Lead, LeadStage } from "./crm-types";

function money(value: string | null): string {
  if (value === null) return "Valor não informado";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}
function due(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

function LeadCardView({ lead, stages, canUpdate, canConvert, overlay = false, dragHandle, onMove, onFollowup, onConvert }: {
  lead: Lead; stages: LeadStage[]; canUpdate: boolean; canConvert: boolean; overlay?: boolean; dragHandle?: ReactNode;
  onMove?: (lead: Lead, stage: LeadStage) => void; onFollowup?: (lead: Lead, trigger: HTMLButtonElement) => void; onConvert?: (lead: Lead, trigger: HTMLButtonElement) => void;
}) {
  const stage = stages.find((item) => item.id === lead.stageId);
  return <article aria-label={`Lead ${lead.name}`} className={`rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-lg ${overlay ? "w-72 rotate-1 shadow-2xl" : ""}`}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base text-white">{lead.name}</h3>{lead.company && <p className="mt-1 truncate text-sm text-brand-50">{lead.company}</p>}</div>{dragHandle}</div>
    <p className="mt-3 font-mono text-sm text-brand-subtle">{money(lead.estimatedValue)}</p>
    <p className="mt-3 flex items-center gap-2 text-sm text-brand-50"><UserRound aria-hidden="true" className="h-4 w-4" />{lead.responsible?.fullName ?? "Sem responsável"}</p>
    {lead.nextFollowup && <p className={`mt-2 flex items-center gap-2 text-sm ${lead.nextFollowup.overdue ? "text-red-300" : "text-brand-50"}`}><CalendarClock aria-hidden="true" className="h-4 w-4" />{due(lead.nextFollowup.dueAt)}{lead.nextFollowup.overdue && <span className="sr-only">, atrasado</span>}</p>}
    {!overlay && <div className="mt-4 grid gap-2">
      {canUpdate && <><label className="text-xs font-semibold text-brand-100" htmlFor={`move-${lead.id}`}>Mover para etapa</label><select id={`move-${lead.id}`} value={lead.stageId} onChange={(event) => { const target = stages.find((item) => item.id === event.target.value); if (target) onMove?.(lead, target); }} className="min-h-11 rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-white">{stages.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <Button variant="ghost" onClick={(event) => onFollowup?.(lead, event.currentTarget)}>Agendar follow-up</Button></>}
      {canConvert && stage?.outcome === "WON" && !lead.convertedClientId && <Button onClick={(event) => onConvert?.(lead, event.currentTarget)}>Converter em cliente</Button>}
    </div>}
  </article>;
}

function SortableLeadCard(props: Omit<Parameters<typeof LeadCardView>[0], "overlay">) {
  const { lead, canUpdate } = props;
  const sortable = useSortable({ id: lead.id, disabled: !canUpdate, data: { type: "lead", lead, stageId: lead.stageId } });
  const handle = canUpdate ? <button ref={sortable.setActivatorNodeRef} type="button" className="grid min-h-11 min-w-11 place-items-center rounded-lg text-brand-100 hover:bg-surface-muted" aria-label={`Mover ${lead.name}`} {...sortable.attributes} {...sortable.listeners}><GripVertical aria-hidden="true" className="h-5 w-5" /></button> : null;
  return <div ref={sortable.setNodeRef} style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition, opacity: sortable.isDragging ? 0.35 : 1 }}><LeadCardView {...props} dragHandle={handle} /></div>;
}

function KanbanColumn({ stage, leads, stages, canUpdate, canConvert, onMove, onFollowup, onConvert }: { stage: LeadStage; leads: Lead[]; stages: LeadStage[]; canUpdate: boolean; canConvert: boolean; onMove: (lead: Lead, stage: LeadStage) => void; onFollowup: (lead: Lead, trigger: HTMLButtonElement) => void; onConvert: (lead: Lead, trigger: HTMLButtonElement) => void }) {
  const drop = useDroppable({ id: `stage:${stage.id}`, data: { type: "stage", stageId: stage.id } });
  return <section ref={drop.setNodeRef} aria-labelledby={`stage-${stage.id}`} className={`w-[min(82vw,20rem)] shrink-0 rounded-xl border bg-surface-muted/40 p-3 sm:w-80 ${drop.isOver ? "border-brand-100" : "border-border-subtle"}`}>
    <header className="mb-3 flex items-center justify-between gap-3"><h2 id={`stage-${stage.id}`} className="text-lg">{stage.name}</h2><Badge>{leads.length}</Badge></header>
    <SortableContext items={leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}><div className="grid min-h-28 gap-3">{leads.map((lead) => <SortableLeadCard key={lead.id} lead={lead} stages={stages} canUpdate={canUpdate} canConvert={canConvert} onMove={onMove} onFollowup={onFollowup} onConvert={onConvert} />)}{leads.length === 0 && <p className="grid min-h-24 place-items-center rounded-lg border border-dashed border-border-subtle p-4 text-center text-sm text-brand-100">Nenhum lead nesta etapa</p>}</div></SortableContext>
  </section>;
}

export function KanbanBoard({ stages, leads, canUpdate, canConvert, onMove, onFollowup, onConvert }: { stages: LeadStage[]; leads: Lead[]; canUpdate: boolean; canConvert: boolean; onMove: (lead: Lead, stage: LeadStage) => void; onFollowup: (lead: Lead, trigger: HTMLButtonElement) => void; onConvert: (lead: Lead, trigger: HTMLButtonElement) => void }) {
  const [active, setActive] = useState<Lead | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  function start(event: DragStartEvent) { setActive(event.active.data.current?.lead as Lead | undefined ?? null); }
  function end(event: DragEndEvent) {
    const lead = event.active.data.current?.lead as Lead | undefined;
    const stageId = event.over?.data.current?.stageId as string | undefined;
    setActive(null);
    if (!lead || !stageId || stageId === lead.stageId) return;
    const stage = stages.find((item) => item.id === stageId); if (stage) onMove(lead, stage);
  }
  return <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={start} onDragCancel={() => setActive(null)} onDragEnd={end} accessibility={{ announcements: {
    onDragStart: ({ active: item }) => `Lead ${String(item.data.current?.lead?.name ?? "selecionado")} levantado. Use as setas para escolher uma etapa.`,
    onDragOver: ({ over }) => over?.data.current?.stageId ? `Sobre a etapa ${stages.find((stage) => stage.id === over.data.current?.stageId)?.name ?? "destino"}.` : undefined,
    onDragEnd: ({ over }) => over?.data.current?.stageId ? `Lead movido para ${stages.find((stage) => stage.id === over.data.current?.stageId)?.name ?? "a etapa escolhida"}.` : "Movimento cancelado.",
    onDragCancel: () => "Movimento cancelado.",
  } }}>
    <div className="max-w-full overflow-x-auto pb-3" role="region" aria-label="Pipeline de leads" tabIndex={0}><div className="flex min-w-max items-start gap-4">{stages.filter((stage) => stage.active).map((stage) => <KanbanColumn key={stage.id} stage={stage} leads={leads.filter((lead) => lead.stageId === stage.id)} stages={stages} canUpdate={canUpdate} canConvert={canConvert} onMove={onMove} onFollowup={onFollowup} onConvert={onConvert} />)}</div></div>
    <DragOverlay>{active ? <LeadCardView lead={active} stages={stages} canUpdate={false} canConvert={false} overlay /> : null}</DragOverlay>
  </DndContext>;
}
