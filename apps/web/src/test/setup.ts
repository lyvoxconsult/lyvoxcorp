import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { useUiStore } from "../store/ui-store";

afterEach(() => {
  cleanup();
  useUiStore.setState({ sidebarCollapsed: false });
});
