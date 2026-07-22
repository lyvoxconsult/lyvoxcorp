import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("associates label and help text", () => {
    render(<Input label="Nome" helpText="Como será exibido" />);
    const input = screen.getByRole("textbox", { name: "Nome" });
    expect(input).toHaveAccessibleDescription("Como será exibido");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveClass("border-border", "placeholder:text-brand-100");
  });

  it("announces validation errors", () => {
    render(<Input label="E-mail" error="Informe um e-mail válido" />);
    const input = screen.getByRole("textbox", { name: "E-mail" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Informe um e-mail válido");
    expect(input).toHaveClass("border-status-error", "placeholder:text-brand-100");
    expect(screen.getByRole("alert")).toBeVisible();
  });
});
