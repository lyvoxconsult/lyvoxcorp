import { Navigate, Route, Routes } from "react-router-dom";
import { ForbiddenPage } from "../auth/ForbiddenPage";
import { AuthorizedLanding } from "../auth/AuthorizedLanding";
import { LoginPage } from "../auth/LoginPage";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import { AppShell } from "../components/layout/AppShell";
import { ClientDetailPage } from "../modules/clients/ClientDetailPage";
import { ClientsPage } from "../modules/clients/ClientsPage";
import { CrmPage } from "../modules/crm/CrmPage";

export function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/403-forbidden" element={<ForbiddenPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<AppShell />}>
        <Route index element={<AuthorizedLanding />} />
        <Route element={<ProtectedRoute permission="clients.read" />}>
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="clientes/:id" element={<ClientDetailPage />} />
        </Route>
        <Route element={<ProtectedRoute permission="crm.read" />}>
          <Route path="crm" element={<CrmPage />} />
        </Route>
      </Route>
    </Route>
    <Route path="/" element={<Navigate to="/app" replace />} />
    <Route path="*" element={<Navigate to="/app" replace />} />
  </Routes>;
}
