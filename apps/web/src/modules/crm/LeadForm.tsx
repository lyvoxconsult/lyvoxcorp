import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema, type CreateLeadInput } from "@lyvox/validation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ApiProblem } from "../../lib/api-client";
import { listCrmResponsibles } from "./crm-api";
import type { LeadStage } from "./crm-types";

export function LeadForm({ stages, onSubmit, onCancel }: { stages: LeadStage[]; onSubmit: (input: CreateLeadInput) => Promise<void>; onCancel: () => void }) {
  const [responsibleSearch, setResponsibleSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => setDebouncedSearch(responsibleSearch.trim()), 300); return () => window.clearTimeout(timer); }, [responsibleSearch]);
  const responsibles = useQuery({ queryKey: ["crm-responsibles", debouncedSearch], queryFn: ({ signal }) => listCrmResponsibles(debouncedSearch, signal) });
  const form = useForm<CreateLeadInput>({ resolver: zodResolver(createLeadSchema), defaultValues: { name: "", email: undefined, phone: undefined, company: undefined, estimatedValue: undefined, source: undefined, stageId: undefined, responsibleId: undefined } });
  async function submit(values: CreateLeadInput) {
    try { await onSubmit(values); }
    catch (error) { form.setError("root.server", { message: error instanceof ApiProblem ? error.message : "Não foi possível cadastrar o lead." }); }
  }
  return <form className="grid gap-5" onSubmit={form.handleSubmit(submit)} noValidate>
    {form.formState.errors.root?.server && <p role="alert" className="rounded-lg border border-status-error p-3 text-red-200">{form.formState.errors.root.server.message}</p>}
    <Input label="Nome do lead" required error={form.formState.errors.name?.message} {...form.register("name")} />
    <div className="grid gap-4 sm:grid-cols-2"><Input label="Empresa" error={form.formState.errors.company?.message} {...form.register("company", { setValueAs: (value: string) => value.trim() || undefined })} /><Input label="Origem" error={form.formState.errors.source?.message} {...form.register("source", { setValueAs: (value: string) => value.trim() || undefined })} /><Input label="E-mail" type="email" error={form.formState.errors.email?.message} {...form.register("email", { setValueAs: (value: string) => value.trim() || undefined })} /><Input label="Telefone" error={form.formState.errors.phone?.message} {...form.register("phone", { setValueAs: (value: string) => value.trim() || undefined })} /><Input label="Valor estimado" inputMode="decimal" placeholder="0,00" error={form.formState.errors.estimatedValue?.message} {...form.register("estimatedValue", { setValueAs: (value: string) => value.trim() ? value.trim().replace(",", ".") : undefined })} /></div>
    <div className="grid gap-2"><label htmlFor="lead-stage" className="font-semibold">Etapa inicial</label><select id="lead-stage" className="min-h-11 rounded-lg border border-border bg-surface-base px-3" {...form.register("stageId", { setValueAs: (value: string) => value || undefined })}><option value="">Etapa padrão</option>{stages.filter((stage) => stage.active && stage.outcome === "OPEN").map((stage) => <option key={stage.id} value={stage.id}>{stage.name}</option>)}</select></div>
    <Input label="Buscar responsável" value={responsibleSearch} onChange={(event) => setResponsibleSearch(event.target.value)} />
    <div className="grid gap-2"><label htmlFor="lead-responsible" className="font-semibold">Responsável</label><select id="lead-responsible" className="min-h-11 rounded-lg border border-border bg-surface-base px-3" {...form.register("responsibleId", { setValueAs: (value: string) => value || undefined })}><option value="">Sem responsável</option>{responsibles.data?.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select>{responsibles.isError && <p role="alert" className="text-sm text-red-300">Não foi possível carregar responsáveis.</p>}</div>
    <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button><Button type="submit" loading={form.formState.isSubmitting}>Cadastrar lead</Button></div>
  </form>;
}
