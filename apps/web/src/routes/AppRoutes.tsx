import { Navigate, Route, Routes } from "react-router-dom";
import { ForbiddenPage } from "../auth/ForbiddenPage";
import { LoginPage } from "../auth/LoginPage";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { AppShell } from "../components/layout/AppShell";
import { ClientDetailPage } from "../modules/clients/ClientDetailPage";
import { ClientsPage } from "../modules/clients/ClientsPage";

export function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/403-forbidden" element={<ForbiddenPage />} />
    <Route element={<ProtectedRoute permission="clients.read" />}>
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="clientes" replace />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="clientes/:id" element={<ClientDetailPage />} />
      </Route>
    </Route>
    <Route path="/" element={<Navigate to="/app/clientes" replace />} />
    <Route path="*" element={<Navigate to="/app/clientes" replace />} />
  </Routes>;
}
