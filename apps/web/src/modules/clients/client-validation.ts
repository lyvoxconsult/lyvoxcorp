import { listClientsQuerySchema } from "@lyvox/validation";
import type { ClientListFilters } from "./client-types";

export function sanitizeListFilters(filters: ClientListFilters): ClientListFilters {
  const result = listClientsQuerySchema.safeParse(filters);
  return result.success ? result.data : { pageSize: 20 };
}
