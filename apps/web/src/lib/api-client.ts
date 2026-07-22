export type ResourceScope = "ALL" | "OWN" | "ASSIGNED";

export type PermissionGrant = {
  permission: string;
  scope: ResourceScope;
};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  passwordChangeRequired: boolean;
  mfaVerified: boolean;
};

type SessionResponse = SessionUser & { grants: PermissionGrant[] };

export type ValidationError = { path?: string; field?: string; message: string };

export class ApiProblem extends Error {
  readonly status: number;
  readonly code?: string;
  readonly correlationId?: string;
  readonly validationErrors: ValidationError[];

  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.detail === "string" ? body.detail : "Não foi possível concluir a solicitação.");
    this.name = "ApiProblem";
    this.status = status;
    this.code = typeof body.code === "string" ? body.code : undefined;
    this.correlationId = typeof body.correlationId === "string" ? body.correlationId : undefined;
    this.validationErrors = Array.isArray(body.validationErrors)
      ? body.validationErrors.filter((item): item is ValidationError => Boolean(item) && typeof item === "object" && typeof (item as ValidationError).message === "string")
      : [];
  }
}

let csrfToken: string | undefined;
let csrfBootstrap: Promise<string> | undefined;

function correlationId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (!globalThis.crypto?.getRandomValues) throw new Error("Secure random UUID generation is unavailable");
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function parseBody(response: Response): Promise<Record<string, unknown>> {
  if (response.status === 204) return {};
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) return {};
  const value: unknown = await response.json();
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Correlation-ID", correlationId());
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) headers.set("X-CSRF-Token", csrfToken);

  const response = await fetch(`/api/v1${path}`, { ...init, method, headers, credentials: "include" });
  const body = await parseBody(response);
  if (!response.ok) {
    if (response.status === 401) csrfToken = undefined;
    throw new ApiProblem(response.status, body);
  }
  return body as T;
}

export async function bootstrapCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  csrfBootstrap ??= apiRequest<{ csrfToken: string }>("/auth/csrf", { method: "POST" })
    .then((response) => {
      csrfToken = response.csrfToken;
      return response.csrfToken;
    })
    .finally(() => { csrfBootstrap = undefined; });
  return csrfBootstrap;
}

export async function loadSession(): Promise<{ user: SessionUser; grants: PermissionGrant[] } | null> {
  try {
    const response = await apiRequest<SessionResponse>("/auth/me");
    await bootstrapCsrf();
    const { grants, ...user } = response;
    return { user, grants: Array.isArray(grants) ? grants : [] };
  } catch (error) {
    if (error instanceof ApiProblem && error.status === 401) return null;
    throw error;
  }
}

export function hasPermission(grants: readonly PermissionGrant[], permission: string): boolean {
  return grants.some((grant) => grant.permission === permission);
}

export function resetApiSession(): void {
  csrfToken = undefined;
  csrfBootstrap = undefined;
}

export function acceptCsrfToken(token: string): void {
  csrfToken = token;
}

export function newIdempotencyKey(): string {
  return correlationId();
}
