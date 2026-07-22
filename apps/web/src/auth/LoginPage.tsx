import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ApiProblem } from "../lib/api-client";
import { activateMfa, completeMfa, login, setupMfa } from "./auth-api";
import { useSession } from "./session-context";

type Step = "LOGIN" | "MFA" | "ENROLL" | "BACKUPS";

export function LoginPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<Step>("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [secret, setSecret] = useState("");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const destination = typeof (location.state as { from?: unknown } | null)?.from === "string" ? (location.state as { from: string }).from : "/app/clientes";

  useEffect(() => { if (session.user) navigate(destination, { replace: true }); }, [destination, navigate, session.user]);
  async function authenticated() { await queryClient.invalidateQueries({ queryKey: ["session"] }); await queryClient.refetchQueries({ queryKey: ["session"] }); navigate(destination, { replace: true }); }
  function problem(value: unknown) {
    if (value instanceof ApiProblem && value.status === 401) {
      setError("E-mail, senha ou código inválido.");
      return;
    }
    setError(value instanceof ApiProblem ? value.message : "Não foi possível concluir a autenticação.");
  }

  async function submitLogin(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await login(email, password); setPassword("");
      if ("csrfToken" in result) return void await authenticated();
      setChallengeToken(result.challengeToken);
      if (result.status === "MFA_REQUIRED") setStep("MFA");
      else {
        const enrollment = await setupMfa(result.challengeToken);
        setSecret(enrollment.secret); setOtpauthUri(enrollment.otpauthUri); setStep("ENROLL");
      }
    } catch (value) { problem(value); } finally { setBusy(false); }
  }
  async function submitMfa(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await completeMfa(challengeToken, useBackup ? { backupCode: code } : { code }); setCode(""); await authenticated(); }
    catch (value) { problem(value); } finally { setBusy(false); }
  }
  async function submitEnrollment(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await activateMfa(challengeToken, code); setCode(""); setSecret(""); setOtpauthUri(""); setBackupCodes(result.backupCodes); setStep("BACKUPS"); }
    catch (value) { problem(value); } finally { setBusy(false); }
  }
  async function finishEnrollment() { setBackupCodes([]); await authenticated(); }

  return <main className="grid min-h-screen place-items-center bg-surface-base p-4"><section aria-labelledby="login-title" className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-2xl sm:p-8"><div className="mb-7"><p className="font-display text-display">Lyvox</p><h1 id="login-title" className="mt-3">{step === "LOGIN" ? "Acessar gerenciamento" : step === "MFA" ? "Confirmar segundo fator" : step === "ENROLL" ? "Ativar autenticação em duas etapas" : "Guardar códigos de backup"}</h1></div>
    {error && <p role="alert" className="mb-5 rounded-lg border border-status-error bg-red-950/40 p-3 text-red-200">{error}</p>}
    {step === "LOGIN" && <form className="grid gap-5" onSubmit={submitLogin}><Input label="E-mail" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><Input label="Senha" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><Button type="submit" loading={busy}>Entrar</Button></form>}
    {step === "MFA" && <form className="grid gap-5" onSubmit={submitMfa}><div className="rounded-lg bg-surface-muted p-4 text-brand-50"><ShieldCheck aria-hidden="true" className="mb-2 h-5 w-5" />Use o autenticador ou um código de backup.</div><Input label={useBackup ? "Código de backup" : "Código de 6 dígitos"} inputMode={useBackup ? "text" : "numeric"} autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required /><Button type="button" variant="ghost" onClick={() => { setUseBackup((value) => !value); setCode(""); }}>{useBackup ? "Usar aplicativo autenticador" : "Usar código de backup"}</Button><Button type="submit" loading={busy}>Confirmar</Button></form>}
    {step === "ENROLL" && <form className="grid gap-5" onSubmit={submitEnrollment}><p className="text-brand-50">Adicione a chave ao seu aplicativo autenticador e informe o código gerado.</p><div className="rounded-lg border border-border-subtle bg-surface-base p-4"><p className="text-sm text-brand-100">Chave temporária</p><code className="mt-2 block break-all font-mono text-white">{secret}</code><details className="mt-3"><summary className="cursor-pointer text-brand-50">Configuração avançada</summary><code className="mt-2 block break-all text-xs text-brand-100">{otpauthUri}</code></details></div><Input label="Código de 6 dígitos" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required /><Button type="submit" loading={busy}>Ativar MFA</Button></form>}
    {step === "BACKUPS" && <div className="grid gap-5"><p className="text-brand-50">Guarde estes códigos em local seguro. Eles não serão exibidos novamente.</p><ul aria-label="Códigos de backup" className="grid grid-cols-2 gap-2 rounded-lg bg-surface-base p-4 font-mono text-sm">{backupCodes.map((backup) => <li key={backup}><KeyRound aria-hidden="true" className="mr-1 inline h-3 w-3" />{backup}</li>)}</ul><Button onClick={() => { void finishEnrollment(); }}>Já guardei os códigos</Button></div>}
  </section></main>;
}
