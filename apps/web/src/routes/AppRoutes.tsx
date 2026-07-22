import { Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

function FoundationPage() {
  return (
    <section aria-labelledby="foundation-title" className="max-w-3xl rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-xl shadow-black/20 md:p-8">
      <p className="mb-2 font-mono text-caption uppercase tracking-[0.2em] text-brand-100">Interface base</p>
      <h1 id="foundation-title" className="text-h1 text-white">Fundação da interface</h1>
      <p className="mt-4 max-w-2xl text-brand-50">Estrutura visual, navegação e componentes essenciais preparados para as próximas fases.</p>
    </section>
  );
}

export function AppRoutes() {
  return <Routes><Route element={<AppShell />}><Route index element={<FoundationPage />} /></Route></Routes>;
}
