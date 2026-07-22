import { describe, expect, it } from "vitest";
import { createServiceSchema, updateServicePriceSchema, updateServiceSchema } from "./services.js";

describe("Services Validation Schemas", () => {
  it("validates a valid service payload", () => {
    const payload = {
      name: "Consultoria em TI",
      description: "Consultoria técnica especializada",
      category: "Consultoria",
      unit: "HOUR",
      billingType: "ONE_TIME",
      basePrice: 150.0,
    };

    const result = createServiceSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects invalid price or missing required fields", () => {
    const payload = {
      name: "",
      category: "",
      unit: "INVALID_UNIT",
      billingType: "ONE_TIME",
      basePrice: -50,
    };

    const result = createServiceSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.name?._errors).toBeDefined();
      expect(formatted.category?._errors).toBeDefined();
      expect(formatted.unit?._errors).toBeDefined();
      expect(formatted.basePrice?._errors).toBeDefined();
    }
  });

  it("validates updateServiceSchema", () => {
    const payload = {
      name: "Nome Atualizado",
    };
    const result = updateServiceSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("validates updateServicePriceSchema", () => {
    const payload = {
      price: 200.5,
    };
    const result = updateServicePriceSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
