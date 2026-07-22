import { AlertTriangle, LockKeyhole, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/Button";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

export function PageLoading({ label = "Carregando clientes" }: { label?: string }) {
  return <div role="status" aria-label={label} className="grid gap-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><span className="sr-only">{label}</span></div>;
}

export function PageError({ onRetry, forbidden = false }: { onRetry: () => void; forbidden?: boolean }) {
  return <EmptyState
    title={forbidden ? "Acesso não permitido" : "Não foi possível carregar os dados"}
    description={forbidden ? "Sua sessão não possui a permissão necessária." : "Confira sua conexão e tente novamente."}
    icon={forbidden ? <LockKeyhole aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
    action={!forbidden ? <Button onClick={onRetry}>Tentar novamente</Button> : undefined}
  />;
}

export function NoResults({ filtered, action }: { filtered: boolean; action?: ReactNode }) {
  return <EmptyState
    title={filtered ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
    description={filtered ? "Revise os termos e filtros aplicados." : "Cadastre o primeiro cliente para iniciar a gestão."}
    icon={<SearchX aria-hidden="true" />}
    action={action}
  />;
}
