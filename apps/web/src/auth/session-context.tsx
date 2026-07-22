import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import { hasPermission, loadSession, type PermissionGrant, type SessionUser } from "../lib/api-client";

type SessionContextValue = {
  user: SessionUser | null;
  grants: PermissionGrant[];
  loading: boolean;
  error: Error | null;
  can: (permission: string) => boolean;
  retry: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const query = useQuery({ queryKey: ["session"], queryFn: loadSession, retry: false, staleTime: 0 });
  const grants = query.data?.grants ?? [];
  return (
    <SessionContext.Provider value={{
      user: query.data?.user ?? null,
      grants,
      loading: query.isPending,
      error: query.error,
      can: (permission) => hasPermission(grants, permission),
      retry: () => { void query.refetch(); },
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
