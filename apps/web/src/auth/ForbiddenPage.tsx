import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/feedback/EmptyState";

export function ForbiddenPage() {
  return <main className="grid min-h-screen place-items-center bg-surface-base p-4"><EmptyState title="Acesso não permitido" description="Sua sessão não possui a permissão necessária para esta área." action={<Link to="/app/clientes"><Button>Voltar</Button></Link>} /></main>;
}
