import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/feedback/Skeleton";
import { useSession } from "./session-context";

export function ProtectedRoute({ permission }: { permission?: string }) {
  const session = useSession();
  const location = useLocation();
  if (session.loading) return <div aria-label="Carregando sessão" className="grid gap-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-40 w-full" /></div>;
  if (session.error) return (
    <section role="alert" className="rounded-xl border border-status-error bg-surface-raised p-6">
      <h1 className="text-h1">Não foi possível verificar sua sessão</h1>
      <p className="mt-2 text-brand-50">Confira sua conexão e tente novamente.</p>
      <Button className="mt-4" onClick={session.retry}>Tentar novamente</Button>
    </section>
  );
  if (!session.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (permission && !session.can(permission)) return <Navigate to="/403-forbidden" replace />;
  return <Outlet />;
}
