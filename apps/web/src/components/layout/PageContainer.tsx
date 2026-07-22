import type { ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>;
}
