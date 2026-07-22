import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { useUiStore } from "../store/ui-store";
import { resetApiSession } from "../lib/api-client";

afterEach(() => {
  cleanup();
  useUiStore.setState({ sidebarCollapsed: false });
  resetApiSession();
});
