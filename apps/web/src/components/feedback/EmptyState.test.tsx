import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("associates each instance with its own heading", () => {
    render(
      <>
        <EmptyState title="Sem registros" description="Nenhum registro disponível." />
        <EmptyState title="Sem resultados" description="A busca não encontrou resultados." />
      </>,
    );

    const first = screen.getByRole("region", { name: "Sem registros" });
    const second = screen.getByRole("region", { name: "Sem resultados" });
    const firstId = first.getAttribute("aria-labelledby");
    const secondId = second.getAttribute("aria-labelledby");

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
    expect(first.querySelector("h2")).toHaveAttribute("id", firstId);
    expect(second.querySelector("h2")).toHaveAttribute("id", secondId);
  });
});
