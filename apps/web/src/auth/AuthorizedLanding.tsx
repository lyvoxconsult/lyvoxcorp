import { Navigate } from "react-router-dom";
import { useSession } from "./session-context";

export function AuthorizedLanding() {
  const session = useSession();
  if (session.can("clients.read")) return <Navigate to="/app/clientes" replace />;
  if (session.can("crm.read")) return <Navigate to="/app/crm" replace />;
  return <Navigate to="/403-forbidden" replace />;
}
