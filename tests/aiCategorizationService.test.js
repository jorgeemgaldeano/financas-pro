import { describe, it, expect } from "vitest";
import { isAiCategorizationEnabled, suggestCategoryWithAI } from "../src/services/aiCategorizationService.js";

describe("isAiCategorizationEnabled", () => {
  it("é false por padrão (params antigo, sem o campo)", () => {
    expect(isAiCategorizationEnabled({})).toBe(false);
    expect(isAiCategorizationEnabled(undefined)).toBe(false);
  });

  it("reflete o valor gravado quando o campo existe", () => {
    expect(isAiCategorizationEnabled({ aiCategorization: { enabled: true } })).toBe(true);
    expect(isAiCategorizationEnabled({ aiCategorization: { enabled: false } })).toBe(false);
  });
});

describe("suggestCategoryWithAI", () => {
  it("retorna not_configured nesta versão (sem chamada real de API)", async () => {
    const result = await suggestCategoryWithAI({ desc: "Mercado", tipo: "despesa" });
    expect(result).toEqual({ ok: false, reason: "not_configured" });
  });
});
