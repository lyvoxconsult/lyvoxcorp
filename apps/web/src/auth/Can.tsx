import type { ReactNode } from "react";
import { useSession } from "./session-context";

export function Can({ permission, children, fallback = null }: { permission: string; children: ReactNode; fallback?: ReactNode }) {
  const session = useSession();
  return session.can(permission) ? children : fallback;
}
