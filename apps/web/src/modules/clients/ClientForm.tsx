import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createClientSchema, type CreateClientInput } from "@lyvox/validation";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import { ApiProblem } from "../../lib/api-client";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { listResponsibles } from "./client-api";
import type { ClientAddress, ClientDetail, ClientDraft } from "./client-types";

type ClientFormValues = CreateClientInput;
const emptyAddress: ClientAddress = { label: "PRIMARY", postalCode: "", street: "", number: "", complement: "", district: "", city: "", state: "", country: "BR" };

function initialValues(client?: ClientDetail): ClientFormValues {
  if (client) {
    const persistedAddress = client.address;
    return {
    type: client.type, name: client.name, tradeName: client.tradeName ?? undefined, document: client.document, email: client.email, status: client.status,
    tags: client.tags, responsibleIds: client.responsibles.map((item) => item.id),
    address: persistedAddress ? { label: persistedAddress.label, postalCode: persistedAddress.postalCode, street: persistedAddress.street, number: persistedAddress.number, complement: persistedAddress.complement ?? undefined, district: persistedAddress.district, city: persistedAddress.city, state: persistedAddress.state, country: persistedAddress.country } : emptyAddress,
    contacts: client.contacts.map(({ type, label, value, isPrimary }) => ({ type, label: label ?? undefined, value, isPrimary })),
    };
  }
  return { type: "PJ", name: "", document: "", email: "", status: "ACTIVE", tags: [], responsibleIds: [], address: emptyAddress, contacts: [] };
}

function message(errors: FieldErrors<ClientFormValues>, path: string): string | undefined {
  let value: unknown = errors;
  for (const part of path.split(".")) value = value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined;
  return value && typeof value === "object" && "message" in value && typeof (value as { message?: unknown }).message === "string" ? (value as { message: string }).message : undefined;
}

export function ClientForm({ client, onSubmit, onCancel }: { client?: ClientDetail; onSubmit: (draft: ClientDraft) => Promise<void>; onCancel: () => void }) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [tagText, setTagText] = useState(() => client?.tags.join(", ") ?? "");
  const [responsibleSearch, setResponsibleSearch] = useState("");
  const form = useForm({
    resolver: zodResolver(createClientSchema),
    defaultValues: initialValues(client),
    mode: "onBlur",
  });
  const contacts = useFieldArray({ control: form.control, name: "contacts" });
  const type = form.watch("type");
  const responsibleQuery = useQuery({ queryKey: ["client-responsibles", responsibleSearch], queryFn: ({ signal }) => listResponsibles(responsibleSearch, signal), staleTime: 30_000 });
  const availableResponsibles = useMemo(() => [...(client?.responsibles ?? []), ...(responsibleQuery.data ?? [])].filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index), [client?.responsibles, responsibleQuery.data]);

  async function submit(values: ClientFormValues) {
    const normalized: ClientDraft = {
      ...values,
      document: values.document.replace(/\D/g, ""),
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      contacts: values.contacts.filter((contact) => contact.value.trim()),
      address: values.address ? {
        label: values.address.label.trim(), postalCode: values.address.postalCode.trim(), street: values.address.street.trim(),
        number: values.address.number.trim(), complement: values.address.complement?.trim() || undefined,
        district: values.address.district.trim(), city: values.address.city.trim(), state: values.address.state.trim().toUpperCase(),
        country: values.address.country.trim().toUpperCase(),
      } : undefined,
    };
    try { await onSubmit(normalized); }
    catch (error) {
      if (error instanceof ApiProblem) {
        for (const issue of error.validationErrors) {
          const path = issue.path ?? issue.field;
          if (path) form.setError(path as never, { message: issue.message });
        }
        form.setError("root.server", { message: error.message });
      } else form.setError("root.server", { message: "Não foi possível salvar o cliente." });
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }
  const invalid = () => requestAnimationFrame(() => summaryRef.current?.focus());
  const errors = form.formState.errors;
  const selectClass = "min-h-11 rounded-lg border border-border bg-surface-base px-3 py-2 text-white";

  return <form className="grid gap-8" onSubmit={form.handleSubmit(submit, invalid)} noValidate>
    {Object.keys(errors).length > 0 && <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-lg border border-status-error bg-red-950/40 p-4"><p className="font-semibold">Revise os dados informados.</p><p className="mt-1 text-sm text-red-200">{errors.root?.server?.message ?? "Há campos que precisam de correção."}</p></div>}
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="col-span-full mb-2 font-heading text-h3">Identificação</legend>
      <div className="grid gap-2"><label htmlFor="client-type" className="font-semibold">Tipo de cliente</label><select id="client-type" className={selectClass} {...form.register("type")}><option value="PJ">Pessoa jurídica</option><option value="PF">Pessoa física</option></select>{message(errors, "type") && <p role="alert" className="text-sm text-red-300">{message(errors, "type")}</p>}</div>
      <div className="grid gap-2"><label htmlFor="client-status" className="font-semibold">Status</label><select id="client-status" className={selectClass} {...form.register("status")}><option value="ACTIVE">Ativo</option><option value="INACTIVE">Inativo</option><option value="CHURNED">Churned</option></select>{message(errors, "status") && <p role="alert" className="text-sm text-red-300">{message(errors, "status")}</p>}</div>
      <Input label={type === "PJ" ? "Razão social" : "Nome completo"} error={message(errors, "name")} required autoComplete="organization" {...form.register("name")} />
      <Input label="Nome fantasia" error={message(errors, "tradeName")} {...form.register("tradeName", { setValueAs: (value: string) => value.trim() || undefined })} />
      <Input label={type === "PJ" ? "CNPJ" : "CPF"} error={message(errors, "document")} required inputMode="numeric" {...form.register("document")} />
      <Input label="E-mail principal" error={message(errors, "email")} required type="email" autoComplete="email" {...form.register("email")} />
      <Input label="Tags" value={tagText} onChange={(event) => { setTagText(event.target.value); form.setValue("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean), { shouldValidate: true }); }} error={message(errors, "tags")} helpText="Separe as tags por vírgulas." />
    </fieldset>
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="col-span-full mb-2 font-heading text-h3">Endereço</legend>
      <Input label="CEP" inputMode="numeric" error={message(errors, "address.postalCode")} {...form.register("address.postalCode")} />
      <Input label="Logradouro" error={message(errors, "address.street")} {...form.register("address.street")} />
      <Input label="Número" error={message(errors, "address.number")} {...form.register("address.number")} />
      <Input label="Complemento" error={message(errors, "address.complement")} {...form.register("address.complement", { setValueAs: (value: string) => value.trim() || undefined })} />
      <Input label="Bairro" error={message(errors, "address.district")} {...form.register("address.district")} />
      <Input label="Cidade" error={message(errors, "address.city")} {...form.register("address.city")} />
      <Input label="UF" maxLength={2} error={message(errors, "address.state")} {...form.register("address.state", { setValueAs: (value: string) => value.toUpperCase() })} />
      <Input label="País" maxLength={2} error={message(errors, "address.country")} {...form.register("address.country", { setValueAs: (value: string) => value.toUpperCase() })} />
    </fieldset>
    <fieldset className="grid gap-4">
      <legend className="mb-2 font-heading text-h3">Contatos adicionais</legend>
      {contacts.fields.map((contact, index) => <div key={contact.id} className="grid gap-3 rounded-lg border border-border-subtle p-4 lg:grid-cols-[9rem_1fr_1fr_auto_auto]">
        <div className="grid gap-2"><label htmlFor={`contact-${index}-type`} className="font-semibold">Tipo</label><select id={`contact-${index}-type`} className={selectClass} {...form.register(`contacts.${index}.type`)}><option value="PHONE">Telefone</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">E-mail</option><option value="OTHER">Outro</option></select></div>
        <Input label="Identificação" error={message(errors, `contacts.${index}.label`)} {...form.register(`contacts.${index}.label`, { setValueAs: (value: string) => value.trim() || undefined })} />
        <Input label="Contato" error={message(errors, `contacts.${index}.value`)} {...form.register(`contacts.${index}.value`)} />
        <label className="flex min-h-11 items-center gap-2 self-end px-2"><input type="checkbox" {...form.register(`contacts.${index}.isPrimary`)} /><span>Principal</span></label>
        <Button type="button" variant="ghost" className="self-end px-3" aria-label={`Remover contato ${index + 1}`} onClick={() => contacts.remove(index)}><Trash2 aria-hidden="true" className="h-5 w-5" /></Button>
      </div>)}
      <Button type="button" variant="secondary" className="justify-self-start" onClick={() => contacts.append({ type: "PHONE", label: "", value: "", isPrimary: false })}><Plus aria-hidden="true" className="h-4 w-4" />Adicionar contato</Button>
    </fieldset>
    <fieldset className="grid gap-3">
      <legend className="mb-2 font-heading text-h3">Responsáveis internos</legend>
      <Input label="Buscar responsável" value={responsibleSearch} onChange={(event) => setResponsibleSearch(event.target.value)} helpText="Somente usuários ativos são listados." />
      {responsibleQuery.isPending && <p role="status" className="text-brand-50">Carregando responsáveis…</p>}
      {responsibleQuery.isError && <p role="alert" className="text-red-300">Não foi possível carregar os responsáveis.</p>}
      <div className="grid gap-2 sm:grid-cols-2">{availableResponsibles.map((responsible) => <label key={responsible.id} className="flex min-h-11 items-center gap-3 rounded-lg border border-border-subtle px-3 py-2"><input type="checkbox" value={responsible.id} {...form.register("responsibleIds")} /><span>{responsible.fullName}</span></label>)}</div>
      {message(errors, "responsibleIds") && <p role="alert" className="text-sm text-red-300">{message(errors, "responsibleIds")}</p>}
    </fieldset>
    <div className="flex flex-col-reverse gap-3 border-t border-border-subtle pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button><Button type="submit" loading={form.formState.isSubmitting}>{client ? "Salvar alterações" : "Cadastrar cliente"}</Button></div>
  </form>;
}
